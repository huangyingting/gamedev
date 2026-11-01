import type { Locale } from "@/lib/i18n";

export function PrivacyPage({ locale }: { locale: Locale }) {
  if (locale === "zh") return (
    <main id="main" className="prose">
      <p className="detail__kicker">简单，是有意的设计</p>
      <h1>隐私</h1>
      <p>这是托管在 GitHub Pages 上的静态网站。它不包含账户系统、邮件订阅数据库、分析脚本、广告、追踪 Cookie 或浏览器存储标识符。</p>
      <h2>交互留在你的浏览器中</h2>
      <p>动画、搜索与筛选都在本地运行。搜索词不会发送到服务器，也不会被保存。只有点击复制按钮时，网站才会把选中的提示词写入剪贴板；它不会读取剪贴板。我们不请求或存储电子邮箱地址。</p>
      <h2>托管服务与外部链接</h2>
      <p>GitHub 在提供托管服务时，可能处理 IP 地址等请求信息。其具体做法请参阅 <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noreferrer">GitHub 隐私声明</a>。外部链接所指向的服务适用各自的隐私政策。</p>
    </main>
  );
  return <main id="main" className="prose"><p className="detail__kicker">Simple by design</p><h1>Privacy</h1><p>This site is a static application hosted by GitHub Pages. It has no account system, newsletter database, analytics scripts, advertising, tracking cookies, or browser-storage identifiers.</p><h2>Interactions stay in your browser</h2><p>Animations, search, and filters run locally. Search terms are not sent to a server or saved. The copy button writes the selected prompt to your clipboard only after you click it. The site does not read your clipboard. No email addresses are requested or stored.</p><h2>Hosting and external links</h2><p>GitHub may process request information such as IP addresses as part of providing its hosting service. Read <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noreferrer">GitHub&apos;s privacy statement</a> for its practices. External links take you to services governed by their own policies.</p></main>;
}
