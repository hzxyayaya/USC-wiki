import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const publicIndex = path.resolve('public/pagefind/pagefind-entry.json');
const distIndex = path.resolve('dist/pagefind/pagefind-entry.json');

function run(command, args) {
	const result = spawnSync(command, args, { stdio: 'inherit', shell: true });
	if (result.status !== 0) process.exit(result.status ?? 1);
}

if (fs.existsSync(publicIndex)) {
	console.log('[search] using existing index in public/pagefind/');
	process.exit(0);
}

if (fs.existsSync(distIndex)) {
	run('node', ['scripts/sync-pagefind.mjs']);
	process.exit(0);
}

console.log('[search] no search index found, running one-time production build...');
run('pnpm', ['run', 'build']);
run('node', ['scripts/sync-pagefind.mjs']);
