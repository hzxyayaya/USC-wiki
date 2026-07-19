import assert from 'node:assert/strict';
import test from 'node:test';

const navigationModule = await import('../src/lib/page-navigation.mjs').catch(() => ({}));

test('computes footer navigation from the server-side page URL', () => {
	assert.equal(typeof navigationModule.getPageFooterItems, 'function');

	const pages = [
		{ type: 'page', name: '中国软件杯', url: '/竞赛与资源/竞赛/中国软件杯/' },
		{
			type: 'page',
			name: '服务外包创新创业大赛',
			url: '/竞赛与资源/竞赛/服务外包创新创业大赛/',
		},
		{
			type: 'page',
			name: '计算机程序设计大赛',
			url: '/竞赛与资源/竞赛/计算机程序设计大赛/',
		},
	];
	const tree = { type: 'root', name: 'Docs', children: pages };
	const items = navigationModule.getPageFooterItems(tree, pages[1]);
	assert.equal(items.previous?.url, '/竞赛与资源/竞赛/中国软件杯/');
	assert.equal(items.next?.url, '/竞赛与资源/竞赛/计算机程序设计大赛/');
});
