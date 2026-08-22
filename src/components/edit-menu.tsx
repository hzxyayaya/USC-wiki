type EditMenuProps = {
	webEditorUrl: string;
	githubUrl: string;
};

export function EditMenu({ webEditorUrl, githubUrl }: EditMenuProps) {
	return (
		<details className="relative">
			<summary className="list-none cursor-pointer rounded-md border bg-fd-secondary px-3 py-1.5 text-sm font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fd-ring [&::-webkit-details-marker]:hidden">
				编辑
			</summary>
			<div className="absolute bottom-full left-0 z-20 mb-2 min-w-44 overflow-hidden rounded-lg border bg-fd-popover p-1 text-sm text-fd-popover-foreground shadow-lg">
				<a
					href={webEditorUrl}
					target="_blank"
					rel="noreferrer"
					className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
				>
					网页编辑器
				</a>
				<a
					href={githubUrl}
					target="_blank"
					rel="noreferrer"
					className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
				>
					GitHub
				</a>
			</div>
		</details>
	);
}
