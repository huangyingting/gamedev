import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";

export function AboutPage({ locale }: { locale: Locale }) {
  if (locale === "zh") return (
    <main id="main" className="prose">
      <p className="detail__kicker">实验背后的故事</p>
      <h1>关于这份指南</h1>
      <p>Game Dev Lab 是由 huangyingting 使用 Next.js 和 TypeScript 构建的交互式游戏开发指南。通过小巧、可操作的 Canvas 2D 演示，它展示了 34 种游戏开发技术。</p>
      <h2>在动手中学习</h2>
      <p>看到一项技术如何响应操作，往往比只读文字更容易理解。每个实验都配有实时演示、原理说明、实用提示词，以及可以应用到自己项目中的开发笔记。</p>
      <h2>寻找下一个想法</h2>
      <p>按机制或关键词搜索概念库，按领域筛选，或选择“随机探索”发现新内容。观察演示、暂停动画，再移动指针或使用方向键探索。打开开发笔记，了解应用场景、常见误区与实现示意。</p>
      <p>这些示例是简化的教学工具，不是可直接用于生产的物理或渲染引擎。请根据自己的引擎调整思路，在实际场景中测量性能，并为游戏调节参数。</p>
      <h2>开放，欢迎实验</h2>
      <p>应用与带类型的演示算法以 MIT 许可证开源，源码位于 <a href="https://github.com/huangyingting/gamedev" target="_blank" rel="noreferrer">GitHub 仓库</a>。你可以关注更新、报告问题，或建议下一个实验。</p>
      <Link className="concept-link" href={localePath(locale, "/#library")}>进入实验室 →</Link>
    </main>
  );
  return (
    <main id="main" className="prose">
      <p className="detail__kicker">Behind the experiments</p>
      <h1>About this guide</h1>
      <p>Game Dev Lab is an interactive field guide by huangyingting, built with Next.js and TypeScript. It explores 34 game-development techniques through small, playable Canvas 2D demonstrations.</p>
      <h2>Learn by tinkering</h2>
      <p>A technique is easier to understand when you can see it respond. Each experiment pairs a live demonstration with an explanation, a practical prompt starter, and field notes you can use in your own project.</p>
      <h2>Find your next idea</h2>
      <p>Search the library by mechanic or keyword, filter by discipline, or choose “Surprise me” to discover something new. Watch an example, pause it, and move your pointer or use the arrow keys to explore. Open its field notes for a use case, a common mistake, and an implementation sketch.</p>
      <p>The examples are simplified teaching tools, not production physics or rendering engines. Adapt the ideas to your engine, measure performance in your own scenes, and tune the numbers for your game.</p>
      <h2>Open to experimentation</h2>
      <p>The application and typed demo algorithms are available under the MIT license in the <a href="https://github.com/huangyingting/gamedev" target="_blank" rel="noreferrer">GitHub repository</a>. Watch the repository for updates, report a correction, or suggest the next experiment.</p>
      <Link className="concept-link" href={localePath(locale, "/#library")}>Enter the lab →</Link>
    </main>
  );
}
