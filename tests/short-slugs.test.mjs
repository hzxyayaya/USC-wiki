import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import {
	legacySlugFromFile,
	slugFromFile,
} from '../src/lib/docs-shared.mjs';
import { createShortSlugMap } from '../src/lib/short-slugs.mjs';

test('generates initials-based routes without changing document titles', () => {
	const filePath = path.resolve('docs/学习指南/教务指南/教材选用.md');

	assert.equal(legacySlugFromFile(filePath), '学习指南/教务指南/教材选用');
	assert.equal(slugFromFile(filePath), 'xxzn/jwzn/jcxy');
});

test('preserves existing ASCII segments and normalizes C++', () => {
	const filePath = path.resolve('docs/学习指南/课程攻略/cpp程序设计.md');

	assert.equal(slugFromFile(filePath), 'xxzn/kcgl/cppcxsj');
});

test('uses four characters for an initials collision suffix', () => {
	const map = createShortSlugMap([
		{ key: '学习指南/教务指南/教材选用.md', filePath: '学习指南/教务指南/教材选用.md' },
		{ key: '学习指南/教务指南/教程选用.md', filePath: '学习指南/教务指南/教程选用.md' },
	]);

	for (const slug of map.values()) assert.match(slug, /^xxzn\/jwzn\/jcxy-[a-z0-9]{4}$/);
});
