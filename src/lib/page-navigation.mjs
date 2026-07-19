import { findNeighbour } from 'fumadocs-core/page-tree';

export function getPageFooterItems(tree, page) {
	return findNeighbour(tree, page.url);
}
