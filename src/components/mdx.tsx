import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';

function mergeClassName(...parts: Array<string | undefined | null | false>) {
	return parts.filter(Boolean).join(' ');
}

const DefaultImg = defaultMdxComponents.img;

export function getMDXComponents(components?: MDXComponents): MDXComponents {
	return {
		...defaultMdxComponents,
		img: (props) => (
			<DefaultImg
				{...props}
				className={mergeClassName('wiki-embed-image', props.className)}
			/>
		),
		...components,
	};
}
