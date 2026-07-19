import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const calloutStyles = await readFile(
	new URL('../src/styles/wiki-callouts.css', import.meta.url),
	'utf8',
);

test('keeps callout content horizontally scrollable without a vertical scrollbar', () => {
	const contentRule = calloutStyles.match(/\.wiki-callout-content\s*\{([^}]*)\}/)?.[1] ?? '';

	assert.match(contentRule, /overflow-x:\s*auto\s*;/);
	assert.match(contentRule, /overflow-y:\s*hidden\s*;/);
});
