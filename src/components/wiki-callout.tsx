import type { ReactNode } from 'react';
import { getCalloutIcon } from '@/lib/callout-icons.mjs';

type WikiCalloutProps = {
	type?: string;
	title?: string;
	fold?: '+' | '-' | string;
	children?: ReactNode;
};

function CalloutIcon({ type }: { type: string }) {
	return (
		<div
			className="wiki-callout-icon"
			aria-hidden="true"
			dangerouslySetInnerHTML={{ __html: getCalloutIcon(type) }}
		/>
	);
}

/**
 * Obsidian `> [!type]` → Fumadocs 外观卡片（左色条 + 图标 + 标题/正文），
 * 保留完整主题类型，不压缩成原生 5 类。
 */
export function WikiCallout({ type = 'note', title, fold, children }: WikiCalloutProps) {
	const calloutType = type.toLowerCase();
	const heading = title || calloutType.charAt(0).toUpperCase() + calloutType.slice(1);
	const isCollapsible = fold === '-' || fold === '+';

	if (isCollapsible) {
		return (
			<details
				className="wiki-callout not-content is-collapsible"
				data-callout={calloutType}
				{...(fold === '+' ? { open: true } : {})}
			>
				<summary className="wiki-callout-summary">
					<div className="wiki-callout-bar" role="none" />
					<CalloutIcon type={calloutType} />
					<p className="wiki-callout-title">{heading}</p>
					<span className="wiki-callout-fold" aria-hidden="true" />
				</summary>
				<div className="wiki-callout-content">{children}</div>
			</details>
		);
	}

	return (
		<div className="wiki-callout not-content" data-callout={calloutType}>
			<div className="wiki-callout-bar" role="none" />
			<CalloutIcon type={calloutType} />
			<div className="wiki-callout-body">
				<p className="wiki-callout-title">{heading}</p>
				<div className="wiki-callout-content">{children}</div>
			</div>
		</div>
	);
}
