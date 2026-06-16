import path from 'node:path';
import {
	createDocIndex,
	createVaultIndex,
	parseWikiLink,
	resolveWikiLink,
} from './vault-assets.mjs';

export const wikiLinkPattern = /(?<!!)\[\[([^\]]+?)\]\]/g;

export function createWikiLinkContext() {
	return {
		docIndex: createDocIndex(),
		vaultIndex: createVaultIndex(),
		docsRoot: path.resolve('docs'),
	};
}

export function buildWikiLink(raw, sourceFile, context) {
	const resolved = resolveWikiLink(raw, sourceFile, context.docIndex, context.vaultIndex);
	if (!resolved) {
		const { target, alias } = parseWikiLink(raw);
		return {
			href: null,
			label: alias || target,
			kind: 'unresolved',
		};
	}

	return resolved;
}

export function escapeHtml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function wikiLinkHtml(link) {
	const classes = ['wiki-link'];
	if (link.kind === 'attachment') classes.push('wiki-link-attachment');
	if (link.kind === 'unresolved') classes.push('wiki-link-unresolved');

	if (!link.href) {
		return `<span class="${classes.join(' ')}">${escapeHtml(link.label)}</span>`;
	}

	const attrs = [`class="${classes.join(' ')}"`, `href="${escapeHtml(link.href)}"`];
	if (link.kind === 'attachment') attrs.push('target="_blank"', 'rel="noopener noreferrer"');

	return `<a ${attrs.join(' ')}>${escapeHtml(link.label)}</a>`;
}

export function wikiLinkMdast(link) {
	if (!link.href) {
		return {
			type: 'html',
			value: wikiLinkHtml(link),
		};
	}

	return {
		type: 'link',
		url: link.href,
		title: null,
		data: {
			hProperties: {
				className: [
					'wiki-link',
					...(link.kind === 'attachment' ? ['wiki-link-attachment'] : []),
				],
				...(link.kind === 'attachment' ? { target: '_blank', rel: ['noopener', 'noreferrer'] } : {}),
			},
		},
		children: [{ type: 'text', value: link.label }],
	};
}

export function splitWikiLinks(text, sourceFile, context, { includeEmbeds = false, buildEmbed } = {}) {
	const pattern = includeEmbeds ? /!\[\[([\s\S]+?)\]\]|(?<!!)\[\[([^\]]+?)\]\]/g : wikiLinkPattern;
	const nodes = [];
	let lastIndex = 0;
	let match;

	pattern.lastIndex = 0;
	while ((match = pattern.exec(text)) !== null) {
		const start = match.index ?? 0;
		if (start > lastIndex) nodes.push({ type: 'text', value: text.slice(lastIndex, start) });

		if (match[0].startsWith('!')) {
			const embed = buildEmbed?.(match[1]);
			nodes.push(embed ?? { type: 'text', value: match[0] });
		} else {
			const raw = match[1] ?? match[2];
			nodes.push(wikiLinkMdast(buildWikiLink(raw, sourceFile, context)));
		}

		lastIndex = start + match[0].length;
	}

	if (nodes.length === 0) return null;

	if (lastIndex < text.length) nodes.push({ type: 'text', value: text.slice(lastIndex) });

	return nodes;
}

export function replaceWikiSyntaxInParent(node, index, parent, sourceFile, context, options) {
	if (!/(?<!!)\[\[|\!\[\[/.test(node.value)) return false;

	const nodes = splitWikiLinks(node.value, sourceFile, context, options);
	if (!nodes) return false;

	if (parent.type === 'paragraph' && nodes.length === 1 && (nodes[0].type === 'html' || nodes[0].type === 'link')) {
		parent.children.splice(index, 1, nodes[0]);
		return true;
	}

	if (parent.type === 'listItem') {
		parent.children.splice(index, 1, { type: 'paragraph', children: nodes });
		return true;
	}

	parent.children.splice(index, 1, ...nodes);
	return true;
}
