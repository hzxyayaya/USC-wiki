import path from 'node:path';
import { visit } from 'unist-util-visit';
import {
	isImageTarget,
	parseImageEmbed,
	parseImageSize,
	resolveVaultAsset,
	toVaultUrl,
} from './vault-assets.mjs';
import {
	buildWikiLink,
	createWikiLinkContext,
	replaceWikiSyntaxInParent,
} from './wiki-links.mjs';

const skipTransformParents = new Set(['code', 'inlineCode', 'math', 'inlineMath']);

function toTitleCase(value) {
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function imageNode(url, alt, size = {}) {
	const attributes = [
		{ type: 'mdxJsxAttribute', name: 'src', value: url },
		{ type: 'mdxJsxAttribute', name: 'alt', value: alt },
	];
	if (size.width) attributes.push({ type: 'mdxJsxAttribute', name: 'width', value: size.width });
	if (size.height) attributes.push({ type: 'mdxJsxAttribute', name: 'height', value: size.height });

	return {
		type: 'mdxJsxTextElement',
		name: 'WikiImage',
		attributes,
		children: [],
	};
}

function missingEmbedNode(label) {
	return {
		type: 'emphasis',
		data: {
			hName: 'span',
			hProperties: {
				className: 'wiki-embed-missing not-content',
				role: 'note',
			},
		},
		children: [{ type: 'text', value: `无法加载嵌入图像：${label}` }],
	};
}

function pathBasename(value) {
	const normalized = value.replace(/\\/g, '/');
	return normalized.slice(normalized.lastIndexOf('/') + 1);
}

function buildImageEmbed(rawEmbed, sourceFile, assetIndex) {
	const { target, size } = parseImageEmbed(rawEmbed);
	if (!target || !isImageTarget(target)) return null;

	const resolved = resolveVaultAsset(target, sourceFile, assetIndex);
	if (!resolved) return missingEmbedNode(target);

	return imageNode(toVaultUrl(resolved), pathBasename(target), parseImageSize(size));
}

function transformWikiSyntax(node, index, parent, sourceFile, context) {
	if (!parent || skipTransformParents.has(parent.type)) return;

	replaceWikiSyntaxInParent(node, index, parent, sourceFile, context, {
		includeEmbeds: true,
		buildEmbed: (raw) => buildImageEmbed(raw, sourceFile, context.vaultIndex),
	});
}

function transformSizedMarkdownImage(node) {
	if (!node.url || !/^\d+(?:x\d+)?$/i.test(node.alt ?? '')) return;

	const size = parseImageSize(node.alt);
	node.alt = '';
	node.data = node.data || {};
	node.data.hProperties = {
		...(node.data.hProperties || {}),
		className: 'wiki-embed-image',
		loading: 'lazy',
		decoding: 'async',
		...(size.width ? { width: size.width } : {}),
		...(size.height ? { height: size.height } : {}),
	};
}

/**
 * 兼容 vault 中按文件名写的普通 Markdown 链接。
 * 例如：[大学英语B1](大学英语) → /学习指南/课程攻略/大学英语/
 */
function transformMarkdownLink(node, sourceFile, context) {
	const url = node.url?.trim();
	if (
		!url ||
		url.startsWith('/') ||
		url.startsWith('#') ||
		url.startsWith('//') ||
		/^[a-z][a-z\d+.-]*:/i.test(url)
	) {
		return;
	}

	let target;
	try {
		target = decodeURIComponent(url);
	} catch {
		target = url;
	}

	const resolved = buildWikiLink(target, sourceFile, context);
	if (!resolved.href) return;

	node.url = resolved.href;
	node.data = node.data || {};
	const existingClassName = node.data.hProperties?.className;
	const classes = Array.isArray(existingClassName)
		? existingClassName
		: typeof existingClassName === 'string'
			? existingClassName.split(/\s+/)
			: [];

	node.data.hProperties = {
		...(node.data.hProperties || {}),
		className: [...new Set(['wiki-link', ...classes])].join(' '),
	};
}

function transformHighlight(node, index, parent) {
	if (!parent || skipTransformParents.has(parent.type)) return;

	const pattern = /==([^=\n]+?)==/g;
	if (!pattern.test(node.value)) return;

	pattern.lastIndex = 0;
	const parts = [];
	let lastIndex = 0;

	for (const match of node.value.matchAll(pattern)) {
		const start = match.index ?? 0;
		if (start > lastIndex) parts.push({ type: 'text', value: node.value.slice(lastIndex, start) });
		parts.push({
			type: 'emphasis',
			data: {
				hName: 'mark',
				hProperties: {},
			},
			children: [{ type: 'text', value: match[1] }],
		});
		lastIndex = start + match[0].length;
	}

	if (parts.length === 0) return;

	if (lastIndex < node.value.length) {
		parts.push({ type: 'text', value: node.value.slice(lastIndex) });
	}

	parent.children.splice(index, 1, ...parts);
}

function getTextValue(node) {
	return node?.type === 'text' ? node.value : '';
}

/**
 * Obsidian callout → MDX <WikiCallout>，避免 hast hName 造成非法 HTML 嵌套。
 */
function transformObsidianCallout(node, index, parent) {
	const firstChild = node.children?.[0];
	const firstText = firstChild?.children?.[0];
	const value = getTextValue(firstText);
	const match = value.match(/^\[!([^\]\s+-]+)\]([+-])?(?:[ \t]+([^\n]+))?(?:\n)?/);
	if (!match) return;

	const [, rawType, foldState, rawTitle] = match;
	const calloutType = rawType.toLowerCase();
	const title = rawTitle?.trim() || toTitleCase(calloutType);
	const remainingText = value.slice(match[0].length);

	if (remainingText) {
		firstText.value = remainingText;
	} else {
		firstChild.children.shift();
		if (firstChild.children.length === 0) node.children.shift();
	}

	/** @type {Array<{ type: 'mdxJsxAttribute', name: string, value: string }>} */
	const attributes = [
		{ type: 'mdxJsxAttribute', name: 'type', value: calloutType },
		{ type: 'mdxJsxAttribute', name: 'title', value: title },
	];
	if (foldState === '-' || foldState === '+') {
		attributes.push({ type: 'mdxJsxAttribute', name: 'fold', value: foldState });
	}

	parent.children[index] = {
		type: 'mdxJsxFlowElement',
		name: 'WikiCallout',
		attributes,
		children: [...node.children],
	};
}

function resolveSourceFile(file, fallback) {
	const raw = file?.path || file?.history?.[0];
	if (!raw) return fallback;
	return path.isAbsolute(raw) ? raw : path.resolve(raw);
}

export function remarkWikiMarkdown() {
	const wikiContext = createWikiLinkContext();

	return function transformer(tree, file) {
		const sourceFile = resolveSourceFile(file, wikiContext.docsRoot);

		visit(tree, 'text', (node, index, parent) => {
			transformWikiSyntax(node, index, parent, sourceFile, wikiContext);
			transformHighlight(node, index, parent);
		});
		visit(tree, 'link', (node) => transformMarkdownLink(node, sourceFile, wikiContext));
		visit(tree, 'image', transformSizedMarkdownImage);
		visit(tree, 'blockquote', transformObsidianCallout);
	};
}
