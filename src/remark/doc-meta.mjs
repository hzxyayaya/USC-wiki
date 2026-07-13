import fs from 'node:fs';

function readFrontmatter(filePath) {
	if (!filePath) return '';
	const content = fs.readFileSync(filePath, 'utf-8');
	return content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
}

function readField(frontmatter, key) {
	return frontmatter.match(new RegExp(`^${key}\\s*:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '');
}

export function remarkDocMeta() {
	return (tree, file) => {
		const frontmatter = readFrontmatter(file?.path);
		const created = readField(frontmatter, 'created');
		const updated = readField(frontmatter, 'updated');

		if (!created && !updated) return;

		const parts = [];
		if (created) parts.push(`创建 ${created}`);
		if (updated) parts.push(`更新 ${updated}`);

		tree.children.push({
			type: 'html',
			value: `<p class="doc-meta">${parts.join(' · ')}</p>`,
		});
	};
}
