import { parseDocMeta } from '../lib/docs-shared.mjs';

export function remarkDocMeta() {
	return (tree, file) => {
		if (!file?.path) return;

		const { created, updated } = parseDocMeta(file.path);
		if (!created && !updated) return;

		const parts = [];
		if (created) parts.push(`创建 ${created}`);
		if (updated) parts.push(`更新 ${updated}`);

		tree.children.push({
			type: 'paragraph',
			data: {
				hProperties: { className: ['doc-meta'] },
			},
			children: [{ type: 'text', value: parts.join(' · ') }],
		});
	};
}
