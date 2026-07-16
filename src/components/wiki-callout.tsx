import type { ReactNode } from 'react';
import { getCalloutIcon } from '@/lib/callout-icons.mjs';

type WikiCalloutProps = {
	type?: string;
	title?: string;
	fold?: '+' | '-' | string;
	children?: ReactNode;
};

function CalloutTitle({ type, title, fold }: { type: string; title: string; fold?: string }) {
	return (
		<>
			<div
				className="callout-icon"
				dangerouslySetInnerHTML={{ __html: getCalloutIcon(type) }}
			/>
			<div className="callout-title-inner">{title}</div>
			{fold ? <div className="callout-fold" /> : null}
		</>
	);
}

/**
 * Obsidian `> [!type]` callout。用真实 React 树渲染，避免 hast hName 造成 p>div hydration 错误。
 */
export function WikiCallout({ type = 'note', title, fold, children }: WikiCalloutProps) {
	const calloutType = type.toLowerCase();
	const heading = title || calloutType.charAt(0).toUpperCase() + calloutType.slice(1);
	const className = ['callout', 'not-content', fold ? 'is-collapsible' : '']
		.filter(Boolean)
		.join(' ');

	if (fold === '-' || fold === '+') {
		return (
			<details className={className} data-callout={calloutType} {...(fold === '+' ? { open: true } : {})}>
				<summary className="callout-title">
					<CalloutTitle type={calloutType} title={heading} fold={fold} />
				</summary>
				<div className="callout-content">{children}</div>
			</details>
		);
	}

	return (
		<div className={className} data-callout={calloutType}>
			<div className="callout-title">
				<CalloutTitle type={calloutType} title={heading} />
			</div>
			<div className="callout-content">{children}</div>
		</div>
	);
}
