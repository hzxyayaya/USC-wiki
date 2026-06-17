import fs from 'node:fs';
import path from 'node:path';

const sourceDir = path.resolve('dist/pagefind');
const targetDir = path.resolve('public/pagefind');

function copyDirectory(source, target) {
	if (!fs.existsSync(source)) {
		console.warn('[search] dist/pagefind not found — run `pnpm build` first.');
		process.exitCode = 1;
		return;
	}

	fs.rmSync(target, { recursive: true, force: true });
	fs.cpSync(source, target, { recursive: true });
	console.log(`[search] synced pagefind index to ${path.relative(process.cwd(), targetDir)}/`);
}

copyDirectory(sourceDir, targetDir);
