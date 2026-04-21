/**
 * gen_ch3.js — Generate 第三章.docx
 */

const fs = require("fs");
const path = require("path");
const { Document, Packer } = require("docx");

const {
  FONT,
  SIZE,
  PAGE_PROPERTIES,
  STYLES,
  Paragraph,
  TextRun,
  AlignmentType,
  createH1,
  createH2,
  createH3,
  createBodyParagraph,
  createBlockMath,
  createFormulaWithNumber,
  buildTextRuns,
  makeBodyRuns,
  latexToSegments,
} = require("./docx_utils");

// ─── Helper: create a body paragraph with mixed bold/normal segments ────────
// segments: array of { text: string, bold?: boolean }
// Each segment's text can contain inline $...$ math.
function createMixedParagraph(segments, opts = {}) {
  const children = [];
  for (const seg of segments) {
    const runs = buildTextRuns(seg.text, SIZE.BODY, FONT.CN_SONG, seg.bold ? { bold: true } : {});
    children.push(...runs);
  }
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
    indent: { firstLine: 480 },
    ...opts,
    children,
  });
}

// ─── Build paragraphs ──────────────────────────────────────────────────────

const children = [];

// ═══════════════════════════════════════════════════════════════════════════
// H1
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH1("3 融合路径规划算法设计与实现"));

// ── Intro paragraph ──
children.push(
  createBodyParagraph(
    "本章与第四章共同构成本文方法的技术核心。为便于读者建立整体认知，本章首先在3.1节对融合算法的总体架构进行全面阐述，说明改进A*算法与自适应遗传算法如何协同工作、各阶段之间的数据流和控制流关系；随后在3.2至3.4节详细介绍改进A*算法的具体设计，包括动态权重启发函数、搜索策略改进和路径平滑优化。第四章则在此基础上，详细阐述自适应遗传算法的优化策略及路径修复机制。"
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 3.1 融合算法总体架构
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("3.1 融合算法总体架构"));

children.push(
  createBodyParagraph(
    `本文提出的路径规划方法将改进A*算法与自适应遗传算法有机融合，构建了\u201C初始路径生成—进化全局优化—路径修复保障\u201D的三阶段协同工作框架。在该框架中，改进A*算法与自适应遗传算法并非简单的串联拼接，而是在算法设计层面实现了深度耦合：改进A*算法不仅负责生成单条初始路径，还通过参数化的动态权重机制为遗传算法提供多条质量可控、风格多样的种群个体；遗传算法则利用这些高质量的初始路径作为进化起点，通过自适应遗传操作在全局解空间中进一步优化路径的长度、平滑度和转折点数量等多个目标；路径修复机制贯穿遗传进化全过程，确保每一代产生的个体均为连通可行的合法路径。三个阶段环环相扣，形成了完整的闭环优化体系。`
  )
);

children.push(
  createBodyParagraph("融合算法的整体工作流程如下：")
);

// ── 第一阶段（bold header + normal text） ──
children.push(
  createMixedParagraph([
    { text: "第一阶段——改进A*初始路径生成。", bold: true },
    { text: "输入栅格地图 $G$、起点 $s$ 和终点 $g$，首先计算地图的全局障碍物密度 $\\rho$，据此通过动态权重公式确定启发式权重：" },
  ])
);

children.push(
  createFormulaWithNumber("\\alpha(\\rho) = 1 + \\frac{2\\rho}{1+\\rho^2}", "3.1")
);

children.push(
  createBodyParagraph(
    "然后以不同的 $\\alpha$ 值（在 $[1.0, 2.0]$ 范围内取值）多次执行改进A*搜索，每次得到一条风格略有差异的可行路径，并经冗余点删除和折线段简化等平滑后处理，生成 $N_p$ 条初始路径组成遗传算法的初始种群。种群初始化的形式化表达为："
  )
);

children.push(
  createFormulaWithNumber("X_i = A^*(G, s, g, \\alpha), \\quad \\alpha \\in [1.0, 2.0]", "3.2")
);

// ── 第二阶段 ──
children.push(
  createMixedParagraph([
    { text: "第二阶段——自适应遗传算法进化优化。", bold: true },
    { text: "以初始种群为基础，执行迭代进化过程。在每一代中，首先依据综合适应度函数评估所有个体：" },
  ])
);

children.push(
  createFormulaWithNumber("F(X) = -(\\omega_1 L(X) + \\omega_2 S(X) + \\omega_3 T(X) + P(X))", "3.3")
);

children.push(
  createBodyParagraph(
    "保留适应度最高的精英个体直接进入下一代；然后通过Softmax+轮盘赌方式选择父代，根据个体适应度自适应调节交叉率和变异率执行遗传操作，生成新个体；对新个体执行路径修复以消除不可行路径段。重复上述过程直至达到最大进化代数。"
  )
);

// ── 第三阶段 ──
children.push(
  createMixedParagraph([
    { text: "第三阶段——输出最优路径。", bold: true },
    { text: "进化结束后，从最终种群中选取适应度最高的个体作为最终输出路径 $P_{optimize}$。" },
  ])
);

children.push(
  createBodyParagraph(
    `该融合架构的核心优势在于：改进A*为遗传算法提供了高质量的\u201C热启动\u201D种群，避免了传统遗传算法从随机解出发导致的收敛缓慢问题，大幅减少了所需的进化代数（从50—100代降至10—20代）；遗传算法的多目标优化能力弥补了A*在路径平滑度等方面的不足，通过进化搜索发现A*难以直接获取的更优路径；路径修复机制保证了进化过程中种群质量的稳定性，将有效个体比例从约60%提升至85%以上。三个阶段的协同配合使融合算法在搜索效率、路径质量和可靠性之间实现了良好的平衡。`
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 3.2 优化启发函数：动态权重设计
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("3.2 优化启发函数：动态权重设计"));

children.push(
  createBodyParagraph(
    "如2.2.3节所述，传统A*算法采用固定权重的启发函数，缺乏对环境复杂度的自适应调节能力[13][22]。为解决这一问题，本节提出一种基于障碍物密度的动态权重调整策略，其核心思想是：在障碍物稀疏的开阔区域适当降低启发式权重以保持路径最优性，在障碍物密集的复杂区域则适当增大权重以加强搜索引导、减少对死胡同区域的无效探索。"
  )
);

// ── 3.2.1 ──
children.push(createH3("3.2.1 动态权重函数设计"));

children.push(
  createBodyParagraph(
    "在传统A*评估函数的基础上，本文引入依赖于障碍物密度 $\\rho$ 的动态权重系数 $\\alpha(\\rho)$，将改进后的评估函数定义为[27]："
  )
);

children.push(
  createFormulaWithNumber("f(n) = g(n) + \\alpha(\\rho)h(n)", "3.4")
);

children.push(
  createBodyParagraph(
    "其中 $\\alpha(\\rho)$ 需满足以下三项设计准则："
  )
);

children.push(
  createBodyParagraph(
    "（1）单调性：$\\alpha(\\rho)$ 应随 $\\rho$ 的增大而单调递增，即环境越复杂，启发式引导力度越大。"
  )
);

children.push(
  createBodyParagraph(
    "（2）有界性：$\\alpha(\\rho) \\in [1,2]$，下界为1以避免退化为无启发的Dijkstra搜索，上界为2以防止过度贪心导致路径质量严重下降[12]。"
  )
);

children.push(
  createBodyParagraph(
    "（3）平滑性：$\\alpha(\\rho)$ 应为连续可导函数，避免障碍物密度的微小变化引起搜索行为的剧烈波动。"
  )
);

children.push(
  createBodyParagraph(
    "综合上述准则，经理论推导与实验验证，本文采用如下动态权重公式："
  )
);

children.push(
  createFormulaWithNumber("\\alpha(\\rho) = 1 + \\frac{2\\rho}{1+\\rho^2}", "3.5")
);

children.push(
  createBodyParagraph(
    "该函数具有以下数学性质：当 $\\rho=0$（无障碍环境）时，$\\alpha(0)=1$，评估函数退化为标准A*，可保证路径最优性；在实际取值范围 $\\rho \\in [0,1]$ 内，$\\alpha(\\rho)$ 单调递增，当 $\\rho=1$ 时取得最大值 $\\alpha(1)=2$；其导数 $\\alpha'(\\rho)=2(1-\\rho^2)/(1+\\rho^2)^2$ 在该区间上恒非负，验证了单调性条件。"
  )
);

// ── 3.2.2 ──
children.push(createH3("3.2.2 障碍物密度计算"));

children.push(
  createBodyParagraph(
    "障碍物密度 $\\rho$ 的计算采用全局统计方式，定义为障碍物栅格数占总栅格数的比例："
  )
);

children.push(
  createFormulaWithNumber(
    "\\rho = \\frac{\\sum_{i=1}^{m}\\sum_{j=1}^{n} \\mathbb{1}(G_{i,j}=1)}{m \\times n}",
    "3.6"
  )
);

children.push(
  createBodyParagraph(
    "其中 $\\mathbb{1}(\\cdot)$ 为指示函数，$G_{i,j}=1$ 表示对应栅格为障碍物。该统计量可在地图加载阶段预先计算完成，时间复杂度为 $O(mn)$，后续每次路径规划仅需 $O(1)$ 的查询时间即可获取。"
  )
);

// ── 3.2.3 ──
children.push(createH3("3.2.3 曼哈顿距离启发式"));

children.push(
  createBodyParagraph("本文选择曼哈顿距离作为基础启发式函数：")
);

children.push(
  createFormulaWithNumber("h(n) = |x_n - x_g| + |y_n - y_g|", "3.7")
);

children.push(
  createBodyParagraph(
    "选择曼哈顿距离的理由如下：其一，该函数仅涉及加法和绝对值运算，计算效率高，适合大规模栅格地图上的高频调用；其二，曼哈顿距离在4邻域和8邻域环境中均适用，具有较好的通用性；其三，在8邻域模型中，曼哈顿距离的估计值不超过任意路径的实际代价，满足可采纳性条件，从而保证改进A*算法在 $\\alpha=1$ 时仍能找到最优路径。"
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 3.3 搜索策略改进
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("3.3 搜索策略改进"));

// ── 3.3.1 ──
children.push(createH3("3.3.1 改进A*算法流程"));

children.push(
  createBodyParagraph(
    "改进A*算法的整体搜索流程沿用了传统A*算法的框架结构，其核心改动在于将固定的启发式权重替换为基于障碍物密度计算的动态权重 $\\alpha(\\rho)$。改进算法的伪代码描述如下："
  )
);

// ── Algorithm pseudocode ──
// Title as bold body paragraph (no first-line indent for algorithm block)
const algoNoIndent = { indent: { firstLine: 0 } };

children.push(
  createMixedParagraph(
    [{ text: "算法1：Improved A* Path Planning", bold: true }],
    algoNoIndent
  )
);

children.push(
  createBodyParagraph("输入：栅格地图 $G$，起点 $s$，终点 $g$", algoNoIndent)
);

children.push(
  createBodyParagraph("输出：可行路径 $P$", algoNoIndent)
);

// Steps 1-18
children.push(
  createBodyParagraph("1. 计算障碍物密度 $\\rho = \\text{ObstacleDensity}(G)$", algoNoIndent)
);
children.push(
  createBodyParagraph("2. 计算动态权重 $\\alpha = 1 + 2\\rho/(1+\\rho^2)$", algoNoIndent)
);
children.push(
  createBodyParagraph("3. 初始化 $gScore[s]=0$，$fScore[s]=\\alpha \\cdot h(s,g)$", algoNoIndent)
);
children.push(
  createBodyParagraph("4. $OpenList \\leftarrow \\{s\\}$，$CloseList \\leftarrow \\emptyset$", algoNoIndent)
);

// Step 5 has bold keywords
children.push(
  createMixedParagraph([
    { text: "5. " },
    { text: "while", bold: true },
    { text: " $OpenList \\neq \\emptyset$ " },
    { text: "do", bold: true },
  ], algoNoIndent)
);

children.push(
  createBodyParagraph("6. $\\quad current \\leftarrow \\arg\\min_{n \\in OpenList} fScore[n]$", algoNoIndent)
);

// Step 7
children.push(
  createMixedParagraph([
    { text: "7. $\\quad$ " },
    { text: "if", bold: true },
    { text: " $current == g$ " },
    { text: "then return", bold: true },
    { text: " $\\text{ReconstructPath}(cameFrom, current)$" },
  ], algoNoIndent)
);

children.push(
  createBodyParagraph("8. $\\quad OpenList \\leftarrow OpenList \\setminus \\{current\\}$", algoNoIndent)
);
children.push(
  createBodyParagraph("9. $\\quad CloseList \\leftarrow CloseList \\cup \\{current\\}$", algoNoIndent)
);

// Step 10
children.push(
  createMixedParagraph([
    { text: "10. $\\quad$ " },
    { text: "for each", bold: true },
    { text: " $neighbor \\in \\text{Neighbors}(current)$ " },
    { text: "do", bold: true },
  ], algoNoIndent)
);

// Step 11
children.push(
  createMixedParagraph([
    { text: "11. $\\quad\\quad$ " },
    { text: "if", bold: true },
    { text: " $neighbor$ 是障碍 " },
    { text: "or", bold: true },
    { text: " $neighbor \\in CloseList$ " },
    { text: "then continue", bold: true },
  ], algoNoIndent)
);

children.push(
  createBodyParagraph("12. $\\quad\\quad tentative\\_g = gScore[current] + dist(current, neighbor)$", algoNoIndent)
);

// Step 13
children.push(
  createMixedParagraph([
    { text: "13. $\\quad\\quad$ " },
    { text: "if", bold: true },
    { text: " $tentative\\_g < gScore[neighbor]$ " },
    { text: "then", bold: true },
  ], algoNoIndent)
);

children.push(
  createBodyParagraph("14. $\\quad\\quad\\quad cameFrom[neighbor] = current$", algoNoIndent)
);
children.push(
  createBodyParagraph("15. $\\quad\\quad\\quad gScore[neighbor] = tentative\\_g$", algoNoIndent)
);
children.push(
  createBodyParagraph("16. $\\quad\\quad\\quad fScore[neighbor] = gScore[neighbor] + \\alpha \\cdot h(neighbor, g)$", algoNoIndent)
);

// Step 17
children.push(
  createMixedParagraph([
    { text: "17. $\\quad\\quad\\quad$ " },
    { text: "if", bold: true },
    { text: " $neighbor \\notin OpenList$ " },
    { text: "then", bold: true },
    { text: " $OpenList \\leftarrow OpenList \\cup \\{neighbor\\}$" },
  ], algoNoIndent)
);

// Step 18
children.push(
  createMixedParagraph([
    { text: "18. " },
    { text: "return", bold: true },
    { text: " failure" },
  ], algoNoIndent)
);

// ── 3.3.2 ──
children.push(createH3("3.3.2 8邻域扩展策略"));

children.push(
  createBodyParagraph(
    "本文采用8邻域（Moore邻域）作为节点扩展方式，允许机器人沿上、下、左、右及四个对角线方向共8个方向移动。其中正交方向的移动代价为1，对角线方向的移动代价为 $\\sqrt{2} \\approx 1.414$。"
  )
);

children.push(
  createBodyParagraph(
    "相较于4邻域（Von Neumann邻域），8邻域扩展策略具有以下优势：其一，对角线移动的引入可有效缩短路径长度，平均缩减幅度约为10%至15%；其二，在狭窄通道等受限空间中，8邻域模型更容易搜索到可行路径；其三，8邻域的全向运动模式更贴近实际移动机器人的运动学特性。"
  )
);

children.push(
  createBodyParagraph(
    `需要指出的是，对角线移动需满足额外的安全性约束：仅当目标对角线方向上的两个相邻正交栅格均为自由空间时，才允许执行该对角线移动，以防止路径在障碍物拐角处发生\u201C切角\u201D碰撞。例如，从当前位置向右上方移动时，需确保其正上方和正右方的栅格均可通行。`
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 3.4 路径平滑优化
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("3.4 路径平滑优化"));

children.push(
  createBodyParagraph(
    "改进A*算法生成的路径虽然满足可行性要求，但受栅格离散化和8邻域方向约束的限制，路径中通常包含大量冗余的中间节点和不必要的方向转折，不利于机器人的平稳行驶与高效执行。因此，需要对A*输出的原始路径进行后处理优化，以提高路径的平滑性和简洁性。"
  )
);

// ── 3.4.1 ──
children.push(createH3("3.4.1 冗余点删除"));

children.push(
  createBodyParagraph(
    "冗余点删除是路径平滑优化的第一步。若路径中连续三个节点A、B、C近似共线，且A到C的直线段不与任何障碍物相交，则中间节点B为冗余节点，可直接移除。具体的共线性判断可通过检验向量AB与BC是否平行来实现，也可通过Bresenham视线检测算法直接验证A至C的直线连通性。"
  )
);

children.push(
  createBodyParagraph(
    "该算法的执行步骤为：（1）从路径起点开始，依次遍历每个中间节点；（2）对于当前节点 $P[i]$，利用视线检测算法检查 $P[i-1]$ 至 $P[i+1]$ 是否直线可达且无碰撞；（3）若可达，则将 $P[i]$ 从路径中移除，并继续对下一个中间节点执行同样的检查；（4）反复执行上述过程直至无法再删除任何节点为止。"
  )
);

// ── 3.4.2 ──
children.push(createH3("3.4.2 折线段简化"));

children.push(
  createBodyParagraph(
    "在完成冗余点删除后，本文进一步借鉴可见性图（Visibility Graph）的思想对路径进行折线段简化[31]。对于路径点序列 $P_0, P_1, ..., P_n$，若从 $P_i$ 到某个 $P_j$（$j > i+1$）之间存在无碰撞的直线通路，则可将中间所有节点 $P_{i+1}, ..., P_{j-1}$ 删除，直接以线段 $P_i P_j$ 替代原有的折线段。"
  )
);

children.push(
  createBodyParagraph(
    "折线段简化的具体执行步骤为：（1）从起点 $P_0$ 出发，向终点方向逐步检测，寻找从 $P_0$ 直线可达的最远路径点 $P_j$；（2）将 $P_j$ 作为简化路径中的下一个关键节点加入结果序列；（3）以 $P_j$ 为新的出发点，重复步骤（1）至（2），直至到达终点。"
  )
);

children.push(
  createBodyParagraph(
    "经过上述两步平滑优化后，路径中的节点数量和转折点数量均可得到显著削减，转折点减少幅度约为60%至80%，路径形态更加简洁平滑，有利于机器人在实际运行中的轨迹跟踪与运动控制[17][20]。"
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 3.5 本章小结
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("3.5 本章小结"));

children.push(
  createBodyParagraph(
    "本章首先阐述了融合算法的总体架构，构建了\"初始路径生成—进化全局优化—路径修复保障\"的三阶段协同工作框架。该框架将改进A*算法与自适应遗传算法有机融合，实现了算法层面的深度耦合，充分发挥了两类算法的各自优势。"
  )
);

children.push(
  createBodyParagraph(
    "随后，本章详细介绍了改进A*算法的核心设计。在优化启发函数方面，提出了基于障碍物密度的动态权重调整策略，使算法能够根据环境复杂度自适应调节搜索行为。在搜索策略方面，采用8邻域扩展策略增强路径的全向移动能力。在路径平滑优化方面，设计了冗余点删除和折线段简化两步后处理方法，显著提升了路径的平滑性和简洁性。"
  )
);

children.push(
  createBodyParagraph(
    "本章内容为第四章的自适应遗传算法设计奠定了基础，改进A*算法生成的初始路径将作为遗传算法的高质量初始种群，大幅缩短进化收敛时间。"
  )
);

// ─── Assemble document and write ───────────────────────────────────────────

const doc = new Document({
  ...PAGE_PROPERTIES,
  styles: STYLES,
  sections: [
    {
      properties: {},
      children,
    },
  ],
});

(async () => {
  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "adjust", "第三章.docx");
  try { fs.unlinkSync(outPath); } catch (e) {}
  fs.writeFileSync(outPath, buffer);
  console.log("✅ 第三章.docx generated at:", outPath);
})();
