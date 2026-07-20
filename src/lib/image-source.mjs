export function getImageSource(src) {
	if (typeof src === 'string') return src;
	if (src && typeof src === 'object' && typeof src.src === 'string') return src.src;
	if (src && typeof src === 'object' && src.default) return getImageSource(src.default);
	return null;
}

function hasDimension(value) {
	return (
		(typeof value === 'number' && Number.isFinite(value) && value > 0) ||
		(typeof value === 'string' && value.trim() !== '')
	);
}

export function hasCompleteImageDimensions(src, width, height) {
	if (hasDimension(width) && hasDimension(height)) return true;
	if (!src || typeof src !== 'object') return false;
	if (hasDimension(src.width) && hasDimension(src.height)) return true;
	return src.default ? hasCompleteImageDimensions(src.default, width, height) : false;
}
