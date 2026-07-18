'use client';

import { useMemo } from 'react';
import { create } from '@orama/orama';
import { createTokenizer } from '@orama/tokenizers/mandarin';
import { useDocsSearch } from 'fumadocs-core/search/client';
import { oramaStaticClient } from 'fumadocs-core/search/client/orama-static';
import {
	SearchDialog,
	SearchDialogClose,
	SearchDialogContent,
	SearchDialogHeader,
	SearchDialogIcon,
	SearchDialogInput,
	SearchDialogList,
	SearchDialogOverlay,
	type SharedProps,
} from 'fumadocs-ui/components/dialog/search';
import type { SearchLink } from 'fumadocs-ui/contexts/search';

function initOrama() {
	return create({
		schema: { _: 'string' },
		components: {
			tokenizer: createTokenizer(),
		},
	});
}

export default function WikiSearchDialog({
	links = [],
	...props
}: SharedProps & { links?: SearchLink[] }) {
	const { search, setSearch, query } = useDocsSearch({
		client: oramaStaticClient({
			from: '/search-index.json',
			initOrama,
		}),
	});

	const defaultItems = useMemo(() => {
		if (links.length === 0) return null;
		return links.map(([name, url]) => ({
			type: 'page' as const,
			id: name,
			content: name,
			url,
		}));
	}, [links]);

	return (
		<SearchDialog
			search={search}
			onSearchChange={setSearch}
			isLoading={query.isLoading}
			{...props}
		>
			<SearchDialogOverlay />
			<SearchDialogContent>
				<SearchDialogHeader>
					<SearchDialogIcon />
					<SearchDialogInput />
					<SearchDialogClose />
				</SearchDialogHeader>
				<SearchDialogList
					items={query.data !== 'empty' ? query.data : defaultItems}
				/>
			</SearchDialogContent>
		</SearchDialog>
	);
}
