export function getImageSource(src) {
	if (typeof src === 'string') return src;
	if (src && typeof src === 'object' && typeof src.src === 'string') return src.src;
	if (src && typeof src === 'object' && src.default) return getImageSource(src.default);
	return null;
}
