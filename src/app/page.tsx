import Link from 'next/link';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';
import { source } from '@/lib/source';
import '@/styles/home-editorial.css';

const sections = [
	{
		chapter: '01',
		kicker: '初来南华',
		title: '新生入门',
		description: '入学准备、校园网络、校历与防骗提醒。',
		href: '/新生入门/',
		accent: 'blue',
	},
	{
		chapter: '02',
		kicker: '认真学习',
		title: '学习指南',
		description: '教务、专业、课程攻略与学习资料。',
		href: '/学习指南/',
		accent: 'cyan',
	},
	{
		chapter: '03',
		kicker: '好好生活',
		title: '校园生活',
		description: '常用软件、校园设施与日常生活。',
		href: '/校园生活/',
		accent: 'green',
	},
	{
		chapter: '04',
		kicker: '办好事情',
		title: '事务办理',
		description: '报销、研学、证件与常用办事流程。',
		href: '/事务办理/',
		accent: 'amber',
	},
	{
		chapter: '05',
		kicker: '走得更远',
		title: '竞赛与资源',
		description: '竞赛、经验、教程与实用资源。',
		href: '/竞赛与资源/',
		accent: 'orange',
	},
] as const;

const highlights = [
	{ title: '选课指南', href: '/学习指南/教务指南/选课指南/' },
	{ title: 'GPA', href: '/学习指南/教务指南/gpa/' },
	{ title: '校园生活指南', href: '/校园生活/生活指南/' },
	{ title: '软件推荐', href: '/竞赛与资源/软件与模板/software/' },
	{ title: '模板下载', href: '/竞赛与资源/软件与模板/templates/' },
];

export default function HomePage() {
	const noteCount = source.getPages().length;

	return (
		<HomeLayout {...baseOptions()}>
			<div className="home-shell">
				<section className="cover" aria-labelledby="home-title">
					<div className="folio" aria-hidden="true">
						<strong>01</strong>
						<span>
							THE STUDENT
							<br />
							FIELD GUIDE
						</span>
					</div>
					<div className="cover-copy">
						<p className="eyebrow">USC WIKI / 南华手册 · 由学生共同维护</p>
						<h1 id="home-title">
							在南华，找到
							<br />
							你需要的答案
						</h1>
						<p>课程、办事、校园生活与竞赛资源，整理成一本可以反复翻阅的学生手册</p>
					</div>
				</section>

				<nav className="chapter-index" aria-label="内容章节">
					{sections.map((section) => (
						<Link
							key={section.href}
							className={`chapter ${section.accent}`}
							href={section.href}
						>
							<span className="chapter-line" aria-hidden="true" />
							<span className="chapter-number">CHAPTER {section.chapter}</span>
							<strong>{section.kicker}</strong>
							<span className="chapter-title">{section.title}</span>
							<p>{section.description}</p>
						</Link>
					))}
				</nav>

				<section className="utility-row" aria-label="站点概览与常用入口">
					<p className="site-stat">
						当前收录 <strong>{noteCount}</strong> 篇校园笔记
					</p>
					<nav className="quick-links" aria-label="常用入口">
						{highlights.map((item) => (
							<Link key={item.href} href={item.href}>
								{item.title}
							</Link>
						))}
					</nav>
				</section>
			</div>
		</HomeLayout>
	);
}
