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
	title: 'USC Wiki｜南华大学学生校园知识库',
	description:
		'由南华大学学生共同维护的校园知识库，提供课程攻略、学习资源、校园生活和事务办理指南。',
	locale: 'zh_CN',
	ogImage: '/og-image.png',
	get url() {
		return getSiteUrl();
	},
};
