import defaultMdxComponents from 'fumadocs-ui/mdx';
import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Banner } from 'fumadocs-ui/components/banner';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { File, Files, Folder } from 'fumadocs-ui/components/files';
import { GithubInfo } from 'fumadocs-ui/components/github-info';
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { Step, Steps } from 'fumadocs-ui/components/steps';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
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

function WikiImage(props: React.ComponentProps<typeof DefaultImg>) {
	const className = mergeClassName('wiki-embed-image', toClassName(props.className));
	const src = typeof props.src === 'string' ? props.src : undefined;

	if (!src) {
		return <DefaultImg {...props} className={className} />;
	}

	return (
		<ImageZoom src={src} alt={props.alt} width={props.width} height={props.height}>
			<DefaultImg {...props} className={className} />
		</ImageZoom>
	);
}

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
			Steps,
			Step,
			Tabs,
			Tab,
			Accordions,
			Accordion,
			Files,
			File,
			Folder,
			TypeTable,
			Banner,
			ImageZoom,
			InlineTOC,
			DynamicCodeBlock,
			GithubInfo,
			WikiCallout,
			// 兼容旧 MDX 缓存里可能残留的 WikiCalloutIcon 引用
			WikiCalloutIcon: ({ html }: { html?: string }) =>
				html ? (
					<div className="callout-icon" dangerouslySetInnerHTML={{ __html: html }} />
				) : null,
		} as unknown as MDXComponents),
		img: (props) => <WikiImage {...props} />,
		...components,
	};
}
