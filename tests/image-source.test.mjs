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
