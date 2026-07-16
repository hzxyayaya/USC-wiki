#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { docsRoot, walkMarkdownFiles } from '../src/lib/docs-shared.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const write = process.argv.includes('--write');

function gitDate(filePath, args) {
	try {
		const relative = path.relative(repoRoot, filePath).split(path.sep).join('/');
		return execSync(`git log ${args} -1 --format=%as -- "${relative}"`, {
			cwd: repoRoot,
			encoding: 'utf-8',
			stdio: ['ignore', 'pipe', 'ignore'],
		}).trim();
	} catch {
		return null;
	}
}

function fileDate(filePath) {
	const stat = fs.statSync(filePath);
	return new Date(stat.mtime).toISOString().slice(0, 10);
}

function splitFrontmatter(content) {
	const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n([\s\S]*))?$/);
	if (!match) return null;
	return { frontmatter: match[1], body: match[2] ?? '' };
}

function getField(frontmatter, key) {
	return frontmatter.match(new RegExp(`^${key}\\s*:\\s*(.+)$`, 'm'))?.[1]?.trim().replace(/^['"]|['"]$/g, '');
}

function setField(frontmatter, key, value) {
	const line = `${key}: ${value}`;
	const regex = new RegExp(`^${key}\\s*:\\s*.+$`, 'm');
	if (regex.test(frontmatter)) return frontmatter.replace(regex, line);
	return `${frontmatter}\n${line}`;
}

function syncFile(filePath) {
	const content = fs.readFileSync(filePath, 'utf-8');
	const parsed = splitFrontmatter(content);
	if (!parsed) {
		console.warn(`skip (no frontmatter): ${path.relative(repoRoot, filePath)}`);
		return false;
	}

	const createdFromGit = gitDate(filePath, '--diff-filter=A --follow') || fileDate(filePath);
	const updatedFromGit = gitDate(filePath, '') || fileDate(filePath);
	const existingCreated = getField(parsed.frontmatter, 'created');
	const existingUpdated = getField(parsed.frontmatter, 'updated');

	const nextCreated = existingCreated || createdFromGit;
	const nextUpdated = updatedFromGit;

	if (existingCreated === nextCreated && existingUpdated === nextUpdated) return false;

	let frontmatter = parsed.frontmatter;
	if (!existingCreated) frontmatter = setField(frontmatter, 'created', nextCreated);
	frontmatter = setField(frontmatter, 'updated', nextUpdated);

	const nextContent = `---\n${frontmatter}\n---\n${parsed.body}`;
	if (write) fs.writeFileSync(filePath, nextContent, 'utf-8');

	console.log(
		`${write ? 'updated' : 'would update'}: ${path.relative(repoRoot, filePath)} (created: ${nextCreated}, updated: ${nextUpdated})`
	);
	return true;
}

const files = walkMarkdownFiles(docsRoot);
let changed = 0;

for (const filePath of files) {
	if (syncFile(filePath)) changed += 1;
}

console.log(`${write ? 'Updated' : 'Would update'} ${changed} file(s).${write ? '' : ' Run with --write to apply.'}`);
