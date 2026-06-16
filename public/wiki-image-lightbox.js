(function () {
	const contentSelector = '.sl-markdown-content';
	const imageSelector = `${contentSelector} img:not([data-no-zoom])`;
	const skipParentTags = new Set(['A']);

	let lightbox = null;
	let lastActiveElement = null;

	function shouldSkip(image) {
		if (image.closest('.not-content, pre, code, .expressive-code')) return true;

		for (let node = image.parentElement; node; node = node.parentElement) {
			if (skipParentTags.has(node.tagName)) return true;
		}

		const width = image.naturalWidth || Number.parseInt(image.getAttribute('width') || '', 10) || 0;
		const height = image.naturalHeight || Number.parseInt(image.getAttribute('height') || '', 10) || 0;
		if (width > 0 && height > 0 && width < 40 && height < 40) return true;

		return false;
	}

	function createLightbox() {
		if (lightbox) return lightbox;

		lightbox = document.createElement('div');
		lightbox.id = 'wiki-image-lightbox';
		lightbox.className = 'wiki-image-lightbox';
		lightbox.hidden = true;
		lightbox.innerHTML = `
			<button type="button" class="wiki-image-lightbox__backdrop" aria-label="关闭预览"></button>
			<div class="wiki-image-lightbox__panel" role="dialog" aria-modal="true" aria-label="图片预览">
				<button type="button" class="wiki-image-lightbox__close" aria-label="关闭">×</button>
				<img class="wiki-image-lightbox__image" alt="" decoding="async" />
				<p class="wiki-image-lightbox__caption"></p>
			</div>
		`;

		document.body.appendChild(lightbox);

		const backdrop = lightbox.querySelector('.wiki-image-lightbox__backdrop');
		const closeButton = lightbox.querySelector('.wiki-image-lightbox__close');
		const image = lightbox.querySelector('.wiki-image-lightbox__image');

		backdrop.addEventListener('click', closeLightbox);
		closeButton.addEventListener('click', closeLightbox);
		image.addEventListener('click', closeLightbox);

		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
		});

		return lightbox;
	}

	function openLightbox(sourceImage) {
		const root = createLightbox();
		const image = root.querySelector('.wiki-image-lightbox__image');
		const caption = root.querySelector('.wiki-image-lightbox__caption');
		const alt = sourceImage.getAttribute('alt')?.trim() || '';

		lastActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

		image.src = sourceImage.currentSrc || sourceImage.src;
		image.alt = alt;
		caption.textContent = alt;
		caption.hidden = !alt;

		root.hidden = false;
		document.body.classList.add('wiki-image-lightbox-open');

		root.querySelector('.wiki-image-lightbox__close')?.focus();
	}

	function closeLightbox() {
		if (!lightbox || lightbox.hidden) return;

		lightbox.hidden = true;
		document.body.classList.remove('wiki-image-lightbox-open');

		const image = lightbox.querySelector('.wiki-image-lightbox__image');
		if (image) {
			image.removeAttribute('src');
			image.alt = '';
		}

		lastActiveElement?.focus();
		lastActiveElement = null;
	}

	function bindImage(image) {
		if (image.dataset.wikiZoomInit === 'true' || shouldSkip(image)) return;

		image.dataset.wikiZoomInit = 'true';
		image.classList.add('wiki-image-zoomable');
		image.tabIndex = 0;
		image.setAttribute('role', 'button');
		image.setAttribute(
			'aria-label',
			image.getAttribute('alt')?.trim() ? `查看大图：${image.getAttribute('alt')?.trim()}` : '查看大图'
		);

		const open = (event) => {
			event.preventDefault();
			event.stopPropagation();
			openLightbox(image);
		};

		image.addEventListener('click', open);
		image.addEventListener('keydown', (event) => {
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				openLightbox(image);
			}
		});
	}

	function init() {
		document.querySelectorAll(imageSelector).forEach(bindImage);
	}

	function start() {
		createLightbox();
		init();
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start, { once: true });
	} else {
		start();
	}

	document.addEventListener('astro:page-load', init);
})();
