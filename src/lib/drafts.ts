type SourceFile = {
	type: string;
	data: unknown;
};

export function hasDraftFlag(data: unknown) {
	return (
		typeof data === 'object' &&
		data !== null &&
		'draft' in data &&
		data.draft === true
	);
}

export function filterPublishedSourceFiles<File extends SourceFile>(files: File[]) {
	return files.filter((file) => file.type === 'meta' || !hasDraftFlag(file.data));
}
