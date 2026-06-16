(function () {
	const storageKey = 'sl-sidebar-state';
	const sidebarSelector = '#starlight__sidebar';
	const desktopQuery = '(min-width: 50em)';

	function getSidebar() {
		return document.querySelector(sidebarSelector);
	}

	function getTopLevelGroups(sidebar) {
		return Array.from(sidebar.querySelectorAll('ul.top-level > li > details'));
	}

	function getRestoreIndex(details) {
		const restorePoint = Array.from(details.children).find(
			(child) => child.localName === 'sl-sidebar-restore'
		);
		const index = Number(restorePoint?.getAttribute('data-index'));
		return Number.isInteger(index) ? index : undefined;
	}

	function syncStarlightState(sidebar) {
		const persistRoot = sidebar.querySelector('sl-sidebar-state-persist');
		if (!persistRoot) return;

		let state = {};
		try {
			state = JSON.parse(sessionStorage.getItem(storageKey) || '{}') || {};
		} catch {}

		const hash = persistRoot.getAttribute('data-hash') || '';
		const open = Array.isArray(state.open) && state.hash === hash ? state.open : [];

		for (const details of persistRoot.querySelectorAll('details')) {
			const index = getRestoreIndex(details);
			if (index !== undefined) open[index] = details.open;
		}

		try {
			sessionStorage.setItem(
				storageKey,
				JSON.stringify({
					hash,
					open,
					scroll: sidebar.scrollTop || 0,
				})
			);
		} catch {}
	}

	function getTopLevelGroupFor(element, topLevelGroups) {
		for (const group of topLevelGroups) {
			if (group.contains(element)) return group;
		}
	}

	function openCurrentPageAncestors(sidebar, topLevelGroups) {
		const currentLink = sidebar.querySelector('a[aria-current="page"]');
		if (!currentLink) return;

		for (let element = currentLink.parentElement; element; element = element.parentElement) {
			if (element instanceof HTMLDetailsElement) element.open = true;
		}

		const currentTopLevelGroup = getTopLevelGroupFor(currentLink, topLevelGroups);
		if (!currentTopLevelGroup) return;

		for (const group of topLevelGroups) {
			if (group !== currentTopLevelGroup) group.open = false;
		}
	}

	function enforceSingleOpenTopLevelGroup(sidebar, openedGroup) {
		const topLevelGroups = getTopLevelGroups(sidebar);
		const activeGroup = openedGroup || topLevelGroups.find((group) => group.open);

		for (const group of topLevelGroups) {
			if (group !== activeGroup) group.open = false;
		}

		syncStarlightState(sidebar);
	}

	function initTopLevelAccordion() {
		if (!window.matchMedia(desktopQuery).matches) return;

		const sidebar = getSidebar();
		if (!sidebar) return;

		const topLevelGroups = getTopLevelGroups(sidebar);
		if (topLevelGroups.length === 0) return;

		let applyingAccordion = false;

		openCurrentPageAncestors(sidebar, topLevelGroups);
		enforceSingleOpenTopLevelGroup(
			sidebar,
			getTopLevelGroupFor(sidebar.querySelector('a[aria-current="page"]'), topLevelGroups)
		);

		for (const group of topLevelGroups) {
			group.addEventListener('toggle', () => {
				if (applyingAccordion) return;

				applyingAccordion = true;
				if (group.open) {
					enforceSingleOpenTopLevelGroup(sidebar, group);
				} else {
					syncStarlightState(sidebar);
				}
				applyingAccordion = false;
			});
		}
	}

	function initSidebarEnhancements() {
		initTopLevelAccordion();
	}

	function start() {
		// Starlight restores sidebar state while parsing. Run after that so our
		// accordion rule becomes the persisted state instead of fighting it.
		requestAnimationFrame(initSidebarEnhancements);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', start, { once: true });
	} else {
		start();
	}
})();
