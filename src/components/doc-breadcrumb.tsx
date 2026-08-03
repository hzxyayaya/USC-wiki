import Link from 'next/link';
import type { DocBreadcrumbItem } from '@/lib/breadcrumbs';

type DocBreadcrumbProps = {
	items: DocBreadcrumbItem[];
};

function Separator() {
	return (
		<svg
			aria-hidden="true"
			className="size-3.5 shrink-0"
			fill="none"
			viewBox="0 0 24 24"
		>
			<path
				d="m9 18 6-6-6-6"
				stroke="currentColor"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth="2"
			/>
		</svg>
	);
}

export function DocBreadcrumb({ items }: DocBreadcrumbProps) {
	if (items.length === 0) return null;

	return (
		<nav
			aria-label="面包屑"
			className="flex items-center gap-1.5 text-sm text-fd-muted-foreground"
		>
			{items.map((item, index) => (
				<span className="contents" key={item.url}>
					{index > 0 ? <Separator /> : null}
					<Link
						className={
							index === items.length - 1
								? 'truncate font-medium text-fd-primary transition-opacity hover:opacity-80'
								: 'truncate transition-opacity hover:opacity-80'
						}
						href={item.url}
					>
						{item.name}
					</Link>
				</span>
			))}
		</nav>
	);
}
