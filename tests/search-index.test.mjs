import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';

import { filterSearchableMarkdownFiles } from '../src/lib/docs-shared.mjs';

const publishedFile = path.resolve('docs/事务办理/报销.md');
const draftFile = path.resolve('docs/事务办理/研学流程.md');

test('excludes draft documents from the production search index', () => {
	assert.deepEqual(filterSearchableMarkdownFiles([publishedFile, draftFile]), [publishedFile]);
});

test('keeps draft documents searchable when explicitly enabled for development', () => {
	assert.deepEqual(
		filterSearchableMarkdownFiles([publishedFile, draftFile], { includeDrafts: true }),
		[publishedFile, draftFile],
	);
});
