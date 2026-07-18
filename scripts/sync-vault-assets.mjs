import fs from 'node:fs/promises';
import path from 'node:path';
import { docsRoot, walkVaultAssets } from '../src/lib/docs-shared.mjs';

const outputRoot = path.resolve('public', 'vault');

async function copyAsset(sourcePath) {
	const relativePath = path.relative(docsRoot, sourcePath);
	const targetPath = path.join(outputRoot, relativePath);

	await fs.mkdir(path.dirname(targetPath), { recursive: true });
	await fs.copyFile(sourcePath, targetPath);
}

await fs.rm(outputRoot, { recursive: true, force: true });

const assets = walkVaultAssets();

for (const asset of assets) {
	await copyAsset(asset);
}

console.log(`Synced ${assets.length} vault assets to ${path.relative(process.cwd(), outputRoot)}`);
