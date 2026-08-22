import assert from 'node:assert/strict';
import test from 'node:test';
import { getWebEditorUrl } from '../src/lib/layout.shared.tsx';

test('maps a source document to its editable WebObsidian deep link', () => {
	assert.equal(
		getWebEditorUrl('关于本站/贡献.md'),
		'https://usc-wiki-editor.3445267935.workers.dev/note/docs/%E5%85%B3%E4%BA%8E%E6%9C%AC%E7%AB%99/%E8%B4%A1%E7%8C%AE.md?mode=live',
	);
});

test('does not duplicate an existing docs prefix', () => {
	assert.match(getWebEditorUrl('docs/校园生活/常用软件.md'), /\/note\/docs\//);
	assert.doesNotMatch(getWebEditorUrl('docs/校园生活/常用软件.md'), /\/docs\/docs\//);
});
