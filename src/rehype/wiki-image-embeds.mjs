import { visit } from 'unist-util-visit';
import path from 'node:path';
import {
	createAssetIndex,
	isImageTarget,
	parseImageEmbed,
	parseImageSize,
	resolveVaultAsset,
	toVaultUrl,
} from '../remark/vault-assets.mjs';

const embedPattern = /!\[\[([\s\S]+?)\]\]/g;
const skipParents = new Set(['code', 'pre', 'script', 'style', 'svg']);
const docsRoot = path.resolve('docs');

function escapeHtml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function pathBasename(value) {
	const normalized = value.replace(/\\/g, '/');
	return normalized.slice(normalized.lastIndexOf('/') + 1);
}

function imageElement(url, alt, size = {}) {
	return {
		type: 'element',
		tagName: 'img',
		properties: {
			className: ['wiki-embed-image'],
			src: url,
			alt,
			loading: 'lazy',
			decoding: 'async',
			...(size.width ? { width: size.width } : {}),
			...(size.height ? { height: size.height } : {}),
		},
		children: [],
	};
}

function missingElement(label) {
	return {
		type: 'element',
		tagName: 'div',
		properties: { className: ['wiki-embed-missing', 'not-content'], role: 'note' },
		children: [{ type: 'text', value: `无法加载嵌入图像：${label}` }],
	};
}

function buildImageElement(rawEmbed, sourceFile, assetIndex) {
	const { target, size } = parseImageEmbed(rawEmbed);
	if (!target || !isImageTarget(target)) return null;

	const resolved = resolveVaultAsset(target, sourceFile, assetIndex);
	if (!resolved) return missingElement(target);

	return imageElement(toVaultUrl(resolved), pathBasename(target), parseImageSize(size));
}

function splitTextNode(node, sourceFile, assetIndex) {
	embedPattern.lastIndex = 0;
	const nodes = [];
	let lastIndex = 0;

	for (const match of node.value.matchAll(embedPattern)) {
		const start = match.index ?? 0;
		if (start > lastIndex) nodes.push({ type: 'text', value: node.value.slice(lastIndex, start) });

		const element = buildImageElement(match[1], sourceFile, assetIndex);
		nodes.push(element ?? { type: 'text', value: match[0] });

		lastIndex = start + match[0].length;
	}

	if (nodes.length === 0) return null;

	if (lastIndex < node.value.length) {
		nodes.push({ type: 'text', value: node.value.slice(lastIndex) });
	}

	return nodes;
}

export function rehypeWikiImageEmbeds() {
	const assetIndex = createAssetIndex();

	return function transformer(tree, file) {
		const sourceFile = file?.path || file?.history?.[0] || docsRoot;

		visit(tree, 'text', (node, index, parent) => {
			if (!parent || skipParents.has(parent.tagName) || !embedPattern.test(node.value)) return;

			embedPattern.lastIndex = 0;
			const nodes = splitTextNode(node, sourceFile, assetIndex);
			if (!nodes) return;

			parent.children.splice(index, 1, ...nodes);
		});
	};
}
