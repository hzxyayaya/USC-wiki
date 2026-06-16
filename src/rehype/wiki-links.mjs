import { visit } from 'unist-util-visit';
import { createWikiLinkContext, replaceWikiSyntaxInParent, wikiLinkHtml, buildWikiLink } from '../remark/wiki-links.mjs';

const skipParents = new Set(['code', 'pre', 'script', 'style', 'svg', 'a']);

function wikiLinkElement(link) {
	if (!link.href) {
		return {
			type: 'element',
			tagName: 'span',
			properties: {
				className: ['wiki-link', ...(link.kind === 'unresolved' ? ['wiki-link-unresolved'] : [])],
			},
			children: [{ type: 'text', value: link.label }],
		};
	}

	return {
		type: 'element',
		tagName: 'a',
		properties: {
			className: [
				'wiki-link',
				...(link.kind === 'attachment' ? ['wiki-link-attachment'] : []),
			],
			href: link.href,
			...(link.kind === 'attachment' ? { target: '_blank', rel: ['noopener', 'noreferrer'] } : {}),
		},
		children: [{ type: 'text', value: link.label }],
	};
}

function splitWikiLinksHast(text, sourceFile, context) {
	const pattern = /(?<!!)\[\[([^\]]+?)\]\]/g;
	const nodes = [];
	let lastIndex = 0;
	let match;

	pattern.lastIndex = 0;
	while ((match = pattern.exec(text)) !== null) {
		const start = match.index ?? 0;
		if (start > lastIndex) nodes.push({ type: 'text', value: text.slice(lastIndex, start) });
		nodes.push(wikiLinkElement(buildWikiLink(match[1], sourceFile, context)));
		lastIndex = start + match[0].length;
	}

	if (nodes.length === 0) return null;
	if (lastIndex < text.length) nodes.push({ type: 'text', value: text.slice(lastIndex) });
	return nodes;
}

export function rehypeWikiLinks() {
	const context = createWikiLinkContext();

	return function transformer(tree, file) {
		const sourceFile = file?.path || file?.history?.[0] || context.docsRoot;

		visit(tree, 'text', (node, index, parent) => {
			if (!parent || skipParents.has(parent.tagName) || !/(?<!!)\[\[/.test(node.value)) return;

			const nodes = splitWikiLinksHast(node.value, sourceFile, context);
			if (!nodes) return;

			parent.children.splice(index, 1, ...nodes);
		});

		visit(tree, 'raw', (node, index, parent) => {
			if (!parent || !/(?<!!)\[\[/.test(node.value)) return;
			node.value = node.value.replace(/(?<!!)\[\[([^\]]+?)\]\]/g, (full, raw) => {
				if (full.startsWith('!')) return full;
				return wikiLinkHtml(buildWikiLink(raw, sourceFile, context));
			});
		});
	};
}
