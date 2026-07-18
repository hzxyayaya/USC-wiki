const DEFAULT_SITE_URL = 'https://usc-wiki.netlify.app';

function normalizeSiteUrl(raw: string) {
	const trimmed = raw.trim();
	if (!trimmed) return DEFAULT_SITE_URL;
	return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
}

/** 构建时解析站点根 URL，供 metadataBase、sitemap、robots 使用 */
export function getSiteUrl() {
	const raw =
		process.env.NEXT_PUBLIC_SITE_URL ||
		process.env.SITE ||
		(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
		DEFAULT_SITE_URL;

	return new URL(normalizeSiteUrl(raw));
}

export const siteConfig = {
	name: 'USC Wiki',
	description: '南华大学学生维护的校园知识库，整理学业、校园生活与资源分享。',
	get url() {
		return getSiteUrl();
	},
};
