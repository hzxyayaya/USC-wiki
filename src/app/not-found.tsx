import Link from 'next/link';

export default function NotFound() {
	return (
		<main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
			<p className="text-sm font-medium text-fd-muted-foreground">404</p>
			<h1 className="text-2xl font-semibold tracking-tight">页面未找到</h1>
			<p className="text-fd-muted-foreground">
				你访问的链接可能已移动或不存在。试试搜索，或返回首页继续浏览。
			</p>
			<div className="mt-2 flex flex-wrap items-center justify-center gap-3">
				<Link
					href="/"
					className="inline-flex h-9 items-center rounded-lg bg-fd-primary px-4 text-sm font-medium text-fd-primary-foreground"
				>
					返回首页
				</Link>
				<Link
					href="/新生入门/"
					className="inline-flex h-9 items-center rounded-lg border border-fd-border px-4 text-sm font-medium"
				>
					新生入门
				</Link>
			</div>
		</main>
	);
}
