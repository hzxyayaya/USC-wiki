import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const docsRoot = path.resolve('docs');
const syntaxDemoFiles = new Set([
	path.resolve('docs/关于本站/markdown-demo.md'),
	path.resolve('docs/关于本站/fumadocs-demo.mdx'),
]);

function walkMarkdownFiles(dir, results = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const filePath = path.join(dir, entry.name);
		if (entry.isDirectory()) walkMarkdownFiles(filePath, results);
		else if (/\.mdx?$/i.test(entry.name)) results.push(filePath);
	}
	return results;
}

function stripCode(content) {
	return content
		.replace(/```[\s\S]*?```/g, '')
		.replace(/`[^`\r\n]*`/g, '');
}

test('uses Obsidian Wiki links instead of hard-coded site paths in docs', () => {
	const violations = [];

	for (const filePath of walkMarkdownFiles(docsRoot)) {
		if (syntaxDemoFiles.has(filePath)) continue;
		const content = stripCode(fs.readFileSync(filePath, 'utf8'));
		for (const match of content.matchAll(/\[[^\]]+\]\((\/[^)\s]+)\)/g)) {
			const line = content.slice(0, match.index).split(/\r?\n/).length;
			violations.push(`${path.relative(docsRoot, filePath)}:${line} ${match[0]}`);
		}
	}

	assert.deepEqual(violations, []);
});
