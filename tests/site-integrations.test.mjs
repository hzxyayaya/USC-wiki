import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const layout = await readFile(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
const baiduVerification = await readFile(
	new URL('../public/baidu_verify_codeva-NMdYmhs7AG.html', import.meta.url),
	'utf8',
);

test('loads Umami analytics after the page becomes interactive', () => {
	assert.match(layout, /https:\/\/cloud\.umami\.is\/script\.js/);
	assert.match(layout, /data-website-id="4c3025d7-44db-47d6-9f64-e6b11bae04ef"/);
	assert.match(layout, /strategy="afterInteractive"/);
});

test('publishes the Baidu site verification token at the requested path', () => {
	assert.equal(baiduVerification.trim(), 'a3cde2a093b76efd00ded5ba487fdb20');
});
