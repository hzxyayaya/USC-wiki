import fs from 'node:fs';
import path from 'node:path';
import GithubSlugger from 'github-slugger';
import {
	docsRoot,
	ignoredAssetDirs,
	markdownExtensions,
	parseDocMeta,
	slugFromFile,
	toPosix,
	vaultFileExtensions,
	walkFiles,
} from '../lib/docs-shared.mjs';

export { vaultFileExtensions } from '../lib/docs-shared.mjs';

const imagePattern = /\.(png|jpe?g|gif|webp|svg)$/i;
export function isImageTarget(target) {
	return imagePattern.test(target.trim());
}

export function isVaultFileTarget(target) {
	return vaultFileExtensions.has(path.extname(target.trim().toLowerCase()));
}

/**
 * 生成 vault 资源 URL。
 * 磁盘上的 public/vault 使用 Unicode 目录名；这里保留中文路径，
 * 只编码空格等会破坏 URL 的字符。浏览器请求时会自行百分号编码，
 * Netlify / nginx 等会解码回 Unicode 路径。
 */
function encodeVaultSegment(segment) {
	return segment.replace(/[?#\[\]%]/g, (ch) => encodeURIComponent(ch)).replace(/ /g, '%20');
}

export function toVaultUrl(absPath) {
	const relative = toPosix(path.relative(docsRoot, absPath));
	return `/vault/${relative.split('/').map(encodeVaultSegment).join('/')}`;
}

function scoreCandidate(candidate, sourceFile) {
	const sourceDir = path.dirname(sourceFile);
	const relative = toPosix(path.relative(sourceDir, candidate));
	const upLevels = (relative.match(/\.\./g) || []).length;
	const depth = relative.split('/').filter(Boolean).length;
	return upLevels * 1000 + depth * 10 + relative.length;
}

function pickClosest(candidates, sourceFile) {
	return [...candidates].sort((a, b) => scoreCandidate(a, sourceFile) - scoreCandidate(b, sourceFile))[0];
}

export function createVaultIndex() {
	const byBasename = new Map();

	for (const filePath of walkFiles(docsRoot, vaultFileExtensions, ignoredAssetDirs)) {
		const basename = path.basename(filePath);
		const list = byBasename.get(basename) || [];
		list.push(filePath);
		byBasename.set(basename, list);
	}

	return byBasename;
}

/** @deprecated Use createVaultIndex */
export function createAssetIndex() {
	return createVaultIndex();
}

function addIndexEntry(index, key, entry) {
	if (!key) return;
	const normalized = key.trim();
	if (!normalized) return;

	const list = index.get(normalized) || [];
	if (!list.some((item) => item.filePath === entry.filePath)) list.push(entry);
	index.set(normalized, list);
}

export function createDocIndex() {
	/** @type {Map<string, Array<{ filePath: string, url: string, title: string, slug: string }>>} */
	const index = new Map();

	for (const filePath of walkFiles(docsRoot, markdownExtensions)) {
		const slug = slugFromFile(filePath);
		const title = parseDocMeta(filePath).title;
		const entry = { filePath, url: `/${slug}/`, title, slug };
		const basename = path.basename(filePath, path.extname(filePath));

		addIndexEntry(index, slug, entry);
		addIndexEntry(index, slug.toLowerCase(), entry);
		addIndexEntry(index, slug.replace(/\//g, ' / '), entry);
		addIndexEntry(index, basename, entry);
		addIndexEntry(index, basename.toLowerCase(), entry);
		addIndexEntry(index, title, entry);
		addIndexEntry(index, title.toLowerCase(), entry);
	}

	return index;
}

export function resolveVaultAsset(target, sourceFile, vaultIndex) {
	const normalized = target.trim().replace(/\\/g, '/');
	if (!normalized) return null;

	const sourceDir = path.dirname(sourceFile);
	const candidates = [];

	if (normalized.includes('/')) {
		candidates.push(path.join(sourceDir, normalized), path.join(docsRoot, normalized));
		const basename = path.basename(normalized);
		for (const folder of ['attachments', 'attachment', 'assets']) {
			candidates.push(path.join(sourceDir, folder, basename));
		}
		const basenameMatches = vaultIndex.get(basename);
		if (basenameMatches) candidates.push(...basenameMatches);
	} else {
		candidates.push(path.join(sourceDir, normalized));
		for (const folder of ['attachments', 'attachment', 'assets']) {
			candidates.push(path.join(sourceDir, folder, normalized));
			candidates.push(path.join(docsRoot, folder, normalized));
		}

		const basenameMatches = vaultIndex.get(path.basename(normalized));
		if (basenameMatches) candidates.push(...basenameMatches);
	}

	const seen = new Set();
	const existing = [];

	for (const candidate of candidates) {
		const resolved = path.resolve(candidate);
		if (seen.has(resolved) || !fs.existsSync(resolved)) continue;
		seen.add(resolved);
		existing.push(resolved);
	}

	if (existing.length === 0) return null;
	return pickClosest(existing, sourceFile);
}

function resolveDocTarget(target, sourceFile, docIndex) {
	const normalized = target.trim().replace(/\\/g, '/');
	const withoutExt = normalized.replace(/\.mdx?$/i, '');
	const sourceDir = path.dirname(sourceFile);
	const keys = [normalized, withoutExt, withoutExt.toLowerCase(), normalized.toLowerCase()];

	for (const key of keys) {
		const matches = docIndex.get(key);
		if (matches?.length) return pickClosest(matches.map((item) => item.filePath), sourceFile);
	}

	const relativeCandidates = [
		path.join(sourceDir, `${withoutExt}.md`),
		path.join(sourceDir, `${withoutExt}.mdx`),
		path.join(sourceDir, withoutExt, 'index.md'),
		path.join(sourceDir, withoutExt, 'index.mdx'),
		path.join(docsRoot, `${withoutExt}.md`),
		path.join(docsRoot, `${withoutExt}.mdx`),
		path.join(docsRoot, withoutExt, 'index.md'),
		path.join(docsRoot, withoutExt, 'index.mdx'),
	];

	for (const candidate of relativeCandidates) {
		if (fs.existsSync(candidate)) return candidate;
	}

	for (const [, entries] of docIndex) {
		for (const entry of entries) {
			if (entry.title === normalized || entry.title.toLowerCase() === normalized.toLowerCase()) {
				return entry.filePath;
			}
		}
	}

	return null;
}

/**
 * 与 Fumadocs remark-heading（github-slugger）对齐，避免 #锚点对不上。
 */
export function slugifyHeading(value) {
	const slugger = new GithubSlugger();
	return slugger.slug(value.trim());
}

export function parseWikiLink(raw) {
	let inner = raw.trim();
	let alias = null;

	const pipeIndex = inner.indexOf('|');
	if (pipeIndex !== -1) {
		alias = inner.slice(pipeIndex + 1).trim();
		inner = inner.slice(0, pipeIndex).trim();
	}

	let heading = null;
	const hashIndex = inner.indexOf('#');
	if (hashIndex !== -1) {
		heading = inner.slice(hashIndex + 1).trim();
		inner = inner.slice(0, hashIndex).trim();
	}

	return { target: inner, alias, heading };
}

/**
 * @returns {{ href: string, label: string, kind: 'page' | 'attachment', filePath?: string } | null}
 */
export function resolveWikiLink(raw, sourceFile, docIndex, vaultIndex) {
	const { target, alias, heading } = parseWikiLink(raw);
	if (!target) return null;

	let href = null;
	let kind = 'page';
	let filePath = null;
	let label = alias || target;

	if (isVaultFileTarget(target)) {
		filePath = resolveVaultAsset(target, sourceFile, vaultIndex);
		if (!filePath) return null;
		href = toVaultUrl(filePath);
		kind = 'attachment';
		if (!alias) label = path.basename(target);
	} else {
		filePath = resolveDocTarget(target, sourceFile, docIndex);
		if (!filePath) return null;
		href = `/${slugFromFile(filePath)}/`;
		kind = 'page';
		if (!alias) {
			label = parseDocMeta(filePath).title;
		}
	}

	if (heading && kind === 'page') {
		const blockMatch = heading.match(/^\^(.+)$/);
		href += blockMatch ? `#^${blockMatch[1]}` : `#${slugifyHeading(heading)}`;
		if (!alias) label = `${label} › ${heading.replace(/^\^/, '')}`;
	}

	return { href, label, kind, filePath };
}

export function parseImageEmbed(raw) {
	let target = raw.trim();
	let size = null;

	const pipeIndex = target.lastIndexOf('|');
	if (pipeIndex !== -1) {
		const maybeSize = target.slice(pipeIndex + 1).trim();
		if (/^\d+(?:x\d+)?$/i.test(maybeSize)) {
			size = maybeSize;
			target = target.slice(0, pipeIndex).trim();
		}
	}

	const hashIndex = target.indexOf('#');
	if (hashIndex !== -1) target = target.slice(0, hashIndex).trim();

	return { target, size };
}

export function parseImageSize(size) {
	if (!size) return {};
	const match = size.match(/^(\d+)(?:x(\d+))?$/i);
	if (!match) return {};
	return match[2] ? { width: match[1], height: match[2] } : { width: match[1] };
}
