import assert from 'node:assert/strict';
import test from 'node:test';
import {
	filterPublishedSourceFiles,
	hasDraftFlag,
} from '../src/lib/drafts.ts';

test('recognizes only an explicit boolean draft flag', () => {
	assert.equal(hasDraftFlag({ draft: true }), true);
	assert.equal(hasDraftFlag({ draft: false }), false);
	assert.equal(hasDraftFlag({ draft: 'true' }), false);
	assert.equal(hasDraftFlag(undefined), false);
});

test('removes draft pages but preserves published pages and meta files', () => {
	const files = [
		{ type: 'page', path: '事务办理/研学流程.md', data: { draft: true } },
		{ type: 'page', path: '事务办理/驾照考试.md', data: { draft: false } },
		{ type: 'meta', path: '事务办理/meta.json', data: { draft: true } },
	];

	assert.deepEqual(filterPublishedSourceFiles(files), [files[1], files[2]]);
});
