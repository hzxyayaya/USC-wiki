import path from 'node:path';
import { pinyin } from 'pinyin-pro';

const docsRoot = path.resolve(process.cwd(), 'docs');

function toPosix(value) {
	return value.split(path.sep).join('/');
}

export function resolveDocFilePath(filePath) {
	if (path.isAbsolute(filePath)) return path.resolve(filePath);

	const normalized = toPosix(filePath);
	if (normalized === 'docs' || normalized.startsWith('docs/')) {
		return path.resolve(process.cwd(), filePath);
	}

	return path.resolve(docsRoot, filePath);
}

export function legacySlugFromFile(filePath, { lowercase = false } = {}) {
	let slug = toPosix(path.relative(docsRoot, resolveDocFilePath(filePath)))
		.replace(/\.mdx?$/, '')
		.replace(/\/index$/, '');
	if (lowercase) slug = slug.toLowerCase();
	return slug;
}

function hashSlug(value, length = 4) {
	let hash = 2166136261;
	for (const character of value) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return (hash >>> 0).toString(36).slice(0, length);
}

function shortSlugSegment(segment) {
	const normalized = segment.replace(/c\+\+/gi, 'cpp');
	const initials = pinyin(normalized, {
		pattern: 'first',
		toneType: 'none',
		type: 'array',
	}).join('');

	return initials
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function baseShortSlugFromFile(filePath, explicitSlug) {
	if (typeof explicitSlug === 'string' && explicitSlug.trim()) {
		return explicitSlug.trim().replace(/^\/+|\/+$/g, '');
	}

	return legacySlugFromFile(filePath)
		.split('/')
		.filter(Boolean)
		.map(shortSlugSegment)
		.filter(Boolean)
		.join('/');
}

/**
 * @param {Array<{ key: string, filePath: string, explicitSlug?: string }>} entries
 */
export function createShortSlugMap(entries) {
	const normalizedEntries = entries.map((entry) => ({
		...entry,
		key: resolveDocFilePath(entry.key),
		legacySlug: legacySlugFromFile(entry.filePath),
		baseSlug: baseShortSlugFromFile(entry.filePath, entry.explicitSlug),
	}));
	const grouped = new Map();

	for (const entry of normalizedEntries) {
		const group = grouped.get(entry.baseSlug) || [];
		group.push(entry);
		grouped.set(entry.baseSlug, group);
	}

	return new Map(
		normalizedEntries.map((entry) => {
			const group = grouped.get(entry.baseSlug) || [];
			let slug = entry.baseSlug;
			if (group.length > 1) {
				let length = 4;
				do {
					const token = hashSlug(entry.legacySlug, length);
					slug = `${entry.baseSlug}-${token}`;
					const tokenIsShared = group.some(
						(other) => other !== entry && hashSlug(other.legacySlug, length) === token,
					);
					if (!tokenIsShared || length >= 7) break;
					length += 1;
				} while (true);
			}
			return [entry.key, slug];
		}),
	);
}

export function shortSlugFromFile(filePath, explicitSlug) {
	return baseShortSlugFromFile(filePath, explicitSlug);
}
