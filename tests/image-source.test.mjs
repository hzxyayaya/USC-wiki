import assert from 'node:assert/strict';
import test from 'node:test';

const imageSourceModule = await import('../src/lib/image-source.mjs').catch(() => ({}));

test('normalizes a Next.js static image object for zoom detection', () => {
	assert.equal(typeof imageSourceModule.getImageSource, 'function');
	assert.equal(
		imageSourceModule.getImageSource({ src: '/image.png', width: 976, height: 708 }),
		'/image.png',
	);
});

test('keeps string image sources unchanged', () => {
	assert.equal(typeof imageSourceModule.getImageSource, 'function');
	assert.equal(imageSourceModule.getImageSource('/image.png'), '/image.png');
});

test('requires native image rendering when only one explicit dimension is available', () => {
	assert.equal(typeof imageSourceModule.hasCompleteImageDimensions, 'function');
	assert.equal(
		imageSourceModule.hasCompleteImageDimensions('https://example.com/logo.svg', 160, undefined),
		false,
	);
});

test('recognizes dimensions carried by a Next.js static image object', () => {
	assert.equal(typeof imageSourceModule.hasCompleteImageDimensions, 'function');
	assert.equal(
		imageSourceModule.hasCompleteImageDimensions(
			{ src: '/image.png', width: 976, height: 708 },
			undefined,
			undefined,
		),
		true,
	);
});
