import path from 'node:path';
import { visit } from 'unist-util-visit';
import { createVaultIndex, resolveVaultAsset, toVaultUrl } from '../remark/vault-assets.mjs';
import fs from 'node:fs';

function resolveAttachment(url, sourceFile, vaultIndex) {
	const normalized = url.trim().replace(/\\/g, '/');
	const sourceDir = path.dirname(sourceFile);
	const relativePath = path.resolve(sourceDir, normalized);

	if (fs.existsSync(relativePath)) return relativePath;

	return (
		resolveVaultAsset(normalized, sourceFile, vaultIndex) ||
		resolveVaultAsset(path.basename(normalized), sourceFile, vaultIndex)
	);
}

function textNode(value) {
	return { type: 'text', value };
}

export function rehypeResourceCards() {
	const vaultIndex = createVaultIndex();

	return (tree, file) => {
		const sourceFile = file?.path || file?.history?.[0] || process.cwd();

		visit(tree, 'element', (node, index, parent) => {
			if (!parent || node.tagName !== 'resourcecard') return;

			const title = String(node.properties?.title ?? '');
			const url = String(node.properties?.url ?? '');
			const resolved = resolveAttachment(url, sourceFile, vaultIndex);

			if (!resolved) {
				parent.children[index] = {
					type: 'element',
					tagName: 'div',
					properties: { className: ['resource-card', 'resource-card-missing'], role: 'note' },
					children: [textNode(`附件未找到：${title}（${url}）`)],
				};
				return;
			}

			parent.children[index] = {
				type: 'element',
				tagName: 'a',
				properties: {
					className: ['resource-card'],
					href: toVaultUrl(resolved),
					target: '_blank',
					rel: 'noopener noreferrer',
				},
				children: [
					{
						type: 'element',
						tagName: 'span',
						properties: { className: ['resource-card-title'] },
						children: [textNode(title)],
					},
					{
						type: 'element',
						tagName: 'span',
						properties: { className: ['resource-card-meta'] },
						children: [textNode(path.basename(resolved))],
					},
				],
			};
		});
	};
}
