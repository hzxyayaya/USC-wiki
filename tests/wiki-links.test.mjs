import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import {
	createDocIndex,
	createVaultIndex,
	resolveWikiLink,
} from '../src/remark/vault-assets.mjs';

test('resolves spreadsheet wiki links as downloadable attachments', () => {
	const sourceFile = path.resolve('docs/竞赛与资源/竞赛/index.md');
	const link = resolveWikiLink(
		'南华大学大学生学科竞赛参赛计划目录.xlsx',
		sourceFile,
		createDocIndex(),
		createVaultIndex(),
	);

	assert.equal(link?.kind, 'attachment');
	assert.match(link?.href ?? '', /^\/vault\/.+\.xlsx$/);
});
