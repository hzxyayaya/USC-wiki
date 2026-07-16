import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import type { ElementType, ReactNode } from 'react';
import { WikiCallout } from '@/components/wiki-callout';

function mergeClassName(...parts: Array<string | undefined | null | false>) {
	return parts.filter(Boolean).join(' ');
}

/** remark/hast 常把 className 编成 string[]，原生 DOM 只接受 string */
function toClassName(className: unknown): string | undefined {
	if (className == null || className === false) return undefined;
	if (typeof className === 'string') return className;
	if (Array.isArray(className)) return className.flat(Infinity).filter(Boolean).join(' ');
	return String(className);
}

const DefaultImg = defaultMdxComponents.img;

function Native(tag: ElementType) {
	return function NativeTag(props: Record<string, unknown>) {
		const { className, dangerouslySetInnerHTML, children, ...rest } = props;
		const Tag = tag;
		const normalizedClassName = toClassName(className);

		if (dangerouslySetInnerHTML) {
			return (
				<Tag
					{...rest}
					className={normalizedClassName}
					dangerouslySetInnerHTML={dangerouslySetInnerHTML}
				/>
			);
		}

		return (
			<Tag {...rest} className={normalizedClassName}>
				{children as ReactNode}
			</Tag>
		);
	};
}

/**
 * remark 插件会通过 hast hName / MDX JSX 输出额外标签与组件。
 */
export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		...( {
			div: Native('div'),
			span: Native('span'),
			details: Native('details'),
			summary: Native('summary'),
			mark: Native('mark'),
			WikiCallout,
			// 兼容旧 MDX 缓存里可能残留的 WikiCalloutIcon 引用
			WikiCalloutIcon: ({ html }: { html?: string }) =>
				html ? (
					<div className="callout-icon" dangerouslySetInnerHTML={{ __html: html }} />
				) : null,
		} as unknown as MDXComponents),
		img: (props) => (
			<DefaultImg
				{...props}
				className={mergeClassName('wiki-embed-image', toClassName(props.className))}
			/>
		),
		...components,
	};
}
