import assert from 'node:assert/strict';
import test from 'node:test';
import {
	getBreadcrumbJsonLd,
	getDocBreadcrumbItems,
} from '../src/lib/breadcrumbs.ts';

test('builds breadcrumbs from server-side slugs without matching the browser pathname', () => {
	const pages = new Map([
		[
			'学习指南',
			{
				data: { title: '学习指南' },
				slugs: ['学习指南'],
				url: '/学习指南/',
			},
		],
		[
			'学习指南/课程资料',
			{
				data: { title: '课程资料' },
				slugs: ['学习指南', '课程资料'],
				url: '/学习指南/课程资料/',
			},
		],
		[
			'学习指南/课程资料/概率论',
			{
				data: { title: '概率论' },
				slugs: ['学习指南', '课程资料', '概率论'],
				url: '/学习指南/课程资料/概率论/',
			},
		],
	]);
	const page = pages.get('学习指南/课程资料/概率论');
	const items = getDocBreadcrumbItems(page, (slugs) => pages.get(slugs.join('/')));

	assert.deepEqual(items, [
		{ name: '首页', url: '/' },
		{ name: '学习指南', url: '/学习指南/' },
		{ name: '课程资料', url: '/学习指南/课程资料/' },
		{ name: '概率论', url: '/学习指南/课程资料/概率论/' },
	]);
});

test('uses the same breadcrumb items for absolute JSON-LD URLs', () => {
	const items = [
		{ name: '首页', url: '/' },
		{ name: '学习指南', url: '/学习指南/' },
	];
	const jsonLd = getBreadcrumbJsonLd(items, 'https://usc-wiki.netlify.app');

	assert.deepEqual(jsonLd.itemListElement, [
		{
			'@type': 'ListItem',
			position: 1,
			name: '首页',
			item: 'https://usc-wiki.netlify.app/',
		},
		{
			'@type': 'ListItem',
			position: 2,
			name: '学习指南',
			item: 'https://usc-wiki.netlify.app/%E5%AD%A6%E4%B9%A0%E6%8C%87%E5%8D%97/',
		},
	]);
});
