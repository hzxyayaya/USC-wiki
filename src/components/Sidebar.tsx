import type { SidebarItem } from '@/lib/docs/meta';
import Link from 'next/link';

function isGroup(item: SidebarItem): item is Extract<SidebarItem, { items: SidebarItem[] }> {
	return 'items' in item;
}

function SidebarNode({ item }: { item: SidebarItem }) {
	if (isGroup(item)) {
		return (
			<details className="sidebar-group" open={!item.collapsed}>
				<summary>{item.label}</summary>
				<ul>
					{item.items.map((child) => (
						<SidebarNode key={'link' in child ? child.link : child.label} item={child} />
					))}
				</ul>
			</details>
		);
	}

	return (
		<li>
			<Link href={item.link}>{item.label}</Link>
		</li>
	);
}

export function Sidebar({ items }: { items: SidebarItem[] }) {
	return (
		<nav className="wiki-sidebar" aria-label="文档目录">
			<ul className="sidebar-root">
				{items.map((item) => (
					<li key={'link' in item ? item.link : item.label}>
						<SidebarNode item={item} />
					</li>
				))}
			</ul>
		</nav>
	);
}
