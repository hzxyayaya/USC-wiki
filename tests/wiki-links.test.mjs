import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import {
	createDocIndex,
	createVaultIndex,
	resolveWikiLink,
} from '../src/remark/vault-assets.mjs';
import { remarkWikiMarkdown } from '../src/remark/wiki-markdown.mjs';

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

test('resolves the C++ course title to a URL-safe page slug', () => {
	const sourceFile = path.resolve('docs/学习指南/学院与专业/cs/SWE.md');
	const link = resolveWikiLink('C++程序设计', sourceFile, createDocIndex(), createVaultIndex());

	assert.equal(link?.kind, 'page');
	assert.equal(link?.href, '/学习指南/课程攻略/cpp程序设计/');
});

function transformWikiImage(value) {
	const text = { type: 'text', value };
	const paragraph = { type: 'paragraph', children: [text] };
	const tree = { type: 'root', children: [paragraph] };
	const file = { path: path.resolve('docs/关于本站/markdown-demo.md') };

	remarkWikiMarkdown()(tree, file);
	return paragraph.children[0];
}

test('preserves an Obsidian image width in an explicit WikiImage node', () => {
	const image = transformWikiImage('![[markdown-demo-Wiki 链接-块级公式.png|240]]');

	assert.equal(image.type, 'mdxJsxTextElement');
	assert.equal(image.name, 'WikiImage');
	assert.equal(image.attributes.find((attr) => attr.name === 'width')?.value, '240');
	assert.equal(image.attributes.find((attr) => attr.name === 'height'), undefined);
});

test('preserves explicit Obsidian image width and height', () => {
	const image = transformWikiImage('![[markdown-demo-Wiki 链接-块级公式.png|180x120]]');

	assert.equal(image.type, 'mdxJsxTextElement');
	assert.equal(image.name, 'WikiImage');
	assert.equal(image.attributes.find((attr) => attr.name === 'width')?.value, '180');
	assert.equal(image.attributes.find((attr) => attr.name === 'height')?.value, '120');
});
