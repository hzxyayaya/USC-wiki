import path from 'node:path';
import { visit } from 'unist-util-visit';
import {
	isImageTarget,
	parseImageEmbed,
	parseImageSize,
	resolveVaultAsset,
	toVaultUrl,
} from './vault-assets.mjs';
import { createWikiLinkContext, replaceWikiSyntaxInParent } from './wiki-links.mjs';

const skipTransformParents = new Set(['code', 'inlineCode', 'math', 'inlineMath']);

const calloutIcons = {
	abstract:
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg>',
	bug: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>',
	danger:
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
	example:
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>',
	failure:
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
	info: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
	note: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>',
	question:
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
	quote:
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>',
	success:
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
	tip: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>',
	todo: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
	warning:
		'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
};

const iconAliases = new Map([
	['attention', 'warning'],
	['caution', 'warning'],
	['check', 'success'],
	['cite', 'quote'],
	['done', 'success'],
	['error', 'danger'],
	['fail', 'failure'],
	['faq', 'question'],
	['help', 'question'],
	['hint', 'tip'],
	['important', 'tip'],
	['missing', 'failure'],
	['summary', 'abstract'],
	['tips', 'tip'],
	['tldr', 'abstract'],
	['warn', 'warning'],
]);

function getCalloutIcon(type) {
	const lower = type.toLowerCase();
	const svg = calloutIcons[iconAliases.get(lower) || lower] || calloutIcons.note;
	return svg.replace('<svg ', '<svg class="svg-icon" ');
}

function toTitleCase(value) {
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function htmlNode(value) {
	return { type: 'html', value };
}

/**
 * 使用 mdast image，而不是 raw html。
 * Fumadocs/MDX 默认不开启 allowDangerousHtml，html 节点会被丢掉。
 */
function imageNode(url, alt, size = {}) {
	return {
		type: 'image',
		url,
		alt,
		data: {
			hProperties: {
				className: ['wiki-embed-image'],
				loading: 'lazy',
				decoding: 'async',
				...(size.width ? { width: size.width } : {}),
				...(size.height ? { height: size.height } : {}),
			},
		},
	};
}

function missingEmbedNode(label) {
	return {
		type: 'emphasis',
		data: {
			hName: 'span',
			hProperties: {
				className: ['wiki-embed-missing', 'not-content'],
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
		className: ['wiki-embed-image', ...(node.data.hProperties?.className || [])],
		loading: 'lazy',
		decoding: 'async',
		...(size.width ? { width: size.width } : {}),
		...(size.height ? { height: size.height } : {}),
	};
}

function elementNode(tagName, className, children = []) {
	return {
		type: 'paragraph',
		data: {
			hName: tagName,
			hProperties: { className: Array.isArray(className) ? className : [className] },
		},
		children,
	};
}

function contentWrapper(children) {
	return {
		type: 'blockquote',
		data: {
			hName: 'div',
			hProperties: { className: ['callout-content'] },
		},
		children,
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
		parts.push(htmlNode(`<mark>${match[1]}</mark>`));
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

	const titleChildren = [
		htmlNode(`<div class="callout-icon">${getCalloutIcon(calloutType)}</div>`),
		elementNode('div', 'callout-title-inner', [{ type: 'text', value: title }]),
	];

	if (foldState === '-' || foldState === '+') {
		titleChildren.push(htmlNode('<div class="callout-fold"></div>'));
	}

	const contentChildren = [...node.children];
	const calloutProperties = {
		className: ['callout', 'not-content', ...(foldState ? ['is-collapsible'] : [])],
		dataCallout: calloutType,
		...(foldState === '+' ? { open: true } : {}),
	};

	parent.children[index] = {
		type: 'blockquote',
		data: {
			hName: foldState ? 'details' : 'div',
			hProperties: calloutProperties,
		},
		children: [
			elementNode(foldState ? 'summary' : 'div', 'callout-title', titleChildren),
			contentWrapper(contentChildren),
		],
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
		visit(tree, 'image', transformSizedMarkdownImage);
		visit(tree, 'blockquote', transformObsidianCallout);
	};
}
