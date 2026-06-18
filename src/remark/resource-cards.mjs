import fs from 'node:fs';
import path from 'node:path';
import { visit } from 'unist-util-visit';
import { createVaultIndex, resolveVaultAsset, toVaultUrl } from './vault-assets.mjs';

function escapeHtml(value) {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function getAttr(node, name) {
	const attr = node.attributes?.find((item) => item.name === name);
	if (!attr) return null;
	if (typeof attr.value === 'string') return attr.value;
	return null;
}

function resolveAttachment(url, sourceFile, vaultIndex) {
	const normalized = url.trim().replace(/\\/g, '/');
	const sourceDir = path.dirname(sourceFile);
	const relativePath = path.resolve(sourceDir, normalized);

	if (fs.existsSync(relativePath)) return relativePath;

	return resolveVaultAsset(normalized, sourceFile, vaultIndex)
		|| resolveVaultAsset(path.basename(normalized), sourceFile, vaultIndex);
}

function resourceCardHtml(title, href, filename) {
	return [
		`<a class="resource-card" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">`,
		`<span class="resource-card-title">${escapeHtml(title)}</span>`,
		`<span class="resource-card-meta">${escapeHtml(filename)}</span>`,
		'</a>',
	].join('');
}

function missingCardHtml(title, url) {
	return `<div class="resource-card resource-card-missing" role="note">附件未找到：${escapeHtml(title)}（${escapeHtml(url)}）</div>`;
}

export function remarkResourceCards() {
	const vaultIndex = createVaultIndex();

	return function transformer(tree, file) {
		const sourceFile = file?.path || file?.history?.[0] || process.cwd();

		visit(tree, 'mdxJsxFlowElement', (node, index, parent) => {
			if (node.name !== 'ResourceCard' || !parent) return;

			const title = getAttr(node, 'title');
			const url = getAttr(node, 'url');
			if (!title || !url) return;

			const resolved = resolveAttachment(url, sourceFile, vaultIndex);
			parent.children[index] = {
				type: 'html',
				value: resolved
					? resourceCardHtml(title, toVaultUrl(resolved), path.basename(resolved))
					: missingCardHtml(title, url),
			};
		});
	};
}
