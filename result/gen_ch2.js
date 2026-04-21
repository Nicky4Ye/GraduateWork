/**
 * gen_ch2.js — Generate 第二章.docx
 */

const fs = require("fs");
const path = require("path");
const { Document, Packer } = require("docx");

const {
  PAGE_PROPERTIES,
  STYLES,
  createH1,
  createH2,
  createH3,
  createBodyParagraph,
  createBlockMath,
  createFormulaWithNumber,
} = require("./docx_utils");

// ─── Build paragraphs ──────────────────────────────────────────────────────

const children = [];

// ── H1 ──
children.push(createH1("2 环境建模与算法基础原理"));

// ── Intro paragraph ──
children.push(
  createBodyParagraph(
    "路径规划算法的设计与实现离不开对工作环境的数学描述和对基础算法原理的深入理解。本章首先介绍栅格地图的构建方法与坐标表示，为后续算法提供统一的环境模型；随后分别阐述A*算法和遗传算法的基本原理及其在路径规划应用中的局限性，为第三章和第四章的改进工作奠定理论基础。"
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 2.1 栅格地图构建与坐标表示
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("2.1 栅格地图构建与坐标表示"));

children.push(
  createBodyParagraph(
    "环境建模是移动机器人路径规划的前提。栅格法（Grid Method）是一种将连续空间离散化的常用环境表示方法，尤其适用于室内结构化环境和二维平面场景[29][12]。本文采用栅格法将连续的工作环境离散化为规则的二维栅格地图，每个栅格单元以二值方式存储环境信息。"
  )
);

// ── 2.1.1 ──
children.push(createH3("2.1.1 栅格地图数学模型"));

children.push(
  createBodyParagraph(
    "设工作空间为二维平面区域 $W \\subset \\mathbb{R}^2$，将其均匀划分为 $m \\times n$ 个大小相等的正方形栅格单元。栅格地图可表示为矩阵形式："
  )
);

children.push(
  createFormulaWithNumber("G = \\{g_{ij} \\mid i=1,2,...,m;\\ j=1,2,...,n\\}", "2.1")
);

children.push(
  createBodyParagraph(
    "其中 $g_{ij} \\in \\{0,1\\}$，$g_{ij}=1$ 表示该栅格为自由空间（可通行），$g_{ij}=0$ 表示障碍物（不可通行）。这种二值化表示方式简化了碰撞检测过程——仅需查询路径点所在栅格的取值即可判断其可行性，计算开销极低。"
  )
);

// ── 2.1.2 ──
children.push(createH3("2.1.2 坐标系与邻接关系"));

children.push(
  createBodyParagraph(
    "本文采用图像坐标系，原点位于左上角，$x$ 轴水平向右，$y$ 轴垂直向下。栅格位置以整数坐标 $(x,y)$ 表示，其中 $x \\in [0,n-1]$，$y \\in [0,m-1]$。机器人被抽象为质点模型，其位置与所在栅格中心重合。"
  )
);

children.push(
  createBodyParagraph(
    "栅格之间的邻接关系决定了机器人可选的运动方向。本文采用8邻域模型（Moore邻域），包括上、下、左、右4个正交方向和4个对角线方向。正交移动的步进代价为1，对角线移动的步进代价为 $\\sqrt{2} \\approx 1.414$（对应欧几里得距离）。相比4邻域模型，8邻域模型允许机器人沿更多方向运动，生成的路径长度更短、灵活性更高。"
  )
);

// ── 2.1.3 ──
children.push(createH3("2.1.3 障碍物密度计算"));

children.push(
  createBodyParagraph(
    "障碍物密度是量化环境复杂程度的重要指标，定义为障碍物栅格数占总栅格数的比例："
  )
);

children.push(
  createFormulaWithNumber(
    "\\rho = \\frac{\\sum_{i=1}^{m}\\sum_{j=1}^{n} \\mathbb{1}(G_{i,j}=1)}{m \\times n}",
    "2.2"
  )
);

children.push(
  createBodyParagraph(
    "其中 $\\mathbb{1}(\\cdot)$ 为指示函数，$G_{i,j}=1$ 表示对应栅格为障碍物。$\\rho$ 的取值范围为 $[0,1]$，数值越大表示环境中障碍物分布越密集，路径规划的难度也相应越高。在本文所提方法中，障碍物密度将作为改进A*算法动态调节启发式权重的核心依据。"
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 2.2 传统A*算法原理与局限性
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("2.2 传统A*算法原理与局限性"));

// ── 2.2.1 ──
children.push(createH3("2.2.1 A*算法基本原理"));

children.push(
  createBodyParagraph(
    "A*算法是一种经典的启发式图搜索方法，其核心思想在于通过综合评估函数对候选节点进行排序，优先扩展最有希望通往目标的节点[12][13]。评估函数定义为："
  )
);

children.push(createFormulaWithNumber("f(n) = g(n) + h(n)", "2.3"));

children.push(
  createBodyParagraph(
    "其中 $g(n)$ 表示从起点到节点 $n$ 的实际累积代价，$h(n)$ 表示从节点 $n$ 到目标点的启发式估计代价，$f(n)$ 则为经过节点 $n$ 到达目标的总代价估计值。算法在运行过程中维护两个核心数据结构：OpenList存放待考察的候选节点，CloseList存放已完成考察的节点。其基本执行流程如下："
  )
);

children.push(
  createBodyParagraph("（1）初始化：将起点加入OpenList，CloseList置空。")
);

children.push(
  createBodyParagraph(
    "（2）从OpenList中取出 $f$ 值最小的节点作为当前节点。"
  )
);

children.push(
  createBodyParagraph(
    "（3）若当前节点即为目标点，则沿父节点指针回溯重构完整路径并返回；否则将该节点移入CloseList。"
  )
);

children.push(
  createBodyParagraph(
    "（4）遍历当前节点的所有邻居节点：若邻居不可通行或已在CloseList中则跳过；否则计算经由当前节点到达该邻居的代价，若优于已记录值则更新其 $g$ 值、$f$ 值和父节点指针，并将其加入OpenList（若尚未加入）。"
  )
);

children.push(
  createBodyParagraph(
    "（5）重复步骤（2）至（4），直至找到目标节点或OpenList为空（即无可行路径）。"
  )
);

// ── 2.2.2 ──
children.push(createH3("2.2.2 启发式函数的选择"));

children.push(
  createBodyParagraph(
    "启发式函数 $h(n)$ 的选取对A*算法的搜索行为和性能有着重要影响。常用的启发式函数包括以下几种："
  )
);

children.push(
  createBodyParagraph(
    "曼哈顿距离：$h(n) = |x_n - x_g| + |y_n - y_g|$，适用于仅允许正交移动的场景。"
  )
);

children.push(
  createBodyParagraph(
    "欧几里得距离：$h(n) = \\sqrt{(x_n - x_g)^2 + (y_n - y_g)^2}$，适用于允许任意方向移动的场景。"
  )
);

children.push(
  createBodyParagraph(
    "切比雪夫距离：$h(n) = \\max(|x_n - x_g|, |y_n - y_g|)$，适用于对角线移动代价与正交移动代价相同的场景。"
  )
);

children.push(
  createBodyParagraph(
    "Octile距离：$h(n) = \\sqrt{2} \\cdot \\min(dx, dy) + |dx - dy|$，适用于8邻域且对角线代价为 $\\sqrt{2}$ 的场景。"
  )
);

children.push(
  createBodyParagraph(
    "启发式函数需满足可采纳性条件（admissibility），即 $h(n) \\leq h^*(n)$（$h^*(n)$ 为实际最小代价），方能保证A*算法找到全局最优路径。然而，若 $h$ 值过于保守（远小于真实代价），则搜索范围将大幅扩展，导致计算效率下降[12][13]。"
  )
);

// ── 2.2.3 ──
children.push(createH3("2.2.3 传统A*算法的局限性"));

children.push(
  createBodyParagraph(
    "尽管A*算法在理论上能够保证找到最优路径，但将其应用于实际路径规划场景时仍面临以下局限："
  )
);

children.push(
  createBodyParagraph(
    "（1）搜索效率瓶颈。在障碍物密度较高的复杂环境中，A*算法需扩展大量候选节点，内存消耗和计算时间随之急剧增长。尤其是当环境中存在\u201CU\u201D型障碍等死胡同结构时，算法会在整个凹陷区域内进行穷举式搜索后才能找到出口[13][22]。"
  )
);

children.push(
  createBodyParagraph(
    "（2）路径平滑性不足。受栅格离散化和8邻域方向限制的影响，A*算法生成的路径通常包含大量冗余转折点，不利于机器人平稳行驶。传统A*算法本身不具备路径平滑度优化机制[7][17]。"
  )
);

children.push(
  createBodyParagraph(
    "（3）环境自适应性欠缺。经典A*算法使用固定权重的启发函数，无法根据环境局部特征调整搜索策略——在开阔区域应加大启发式引导以加快推进速度，在障碍密集区域则应适当降低权重以保证搜索的全面性，而固定权重无法实现这种差异化调节。"
  )
);

children.push(
  createBodyParagraph(
    "（4）多目标优化能力有限。传统A*算法的优化目标仅为路径长度，难以同时兼顾平滑度、转弯次数、安全裕度等多个性能维度，而实际机器人应用往往需要对上述指标进行综合权衡[1][6][7]。"
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 2.3 传统遗传算法原理与局限性
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("2.3 传统遗传算法原理与局限性"));

// ── 2.3.1 ──
children.push(createH3("2.3.1 遗传算法基本原理"));

children.push(
  createBodyParagraph(
    "遗传算法（Genetic Algorithm, GA）是一种借鉴自然界生物进化机制的全局随机优化方法。GA无需依赖目标函数的梯度信息，通过维护一个由多个候选解组成的种群并对其施加选择、交叉、变异等遗传操作，在解空间中进行并行搜索，尤其适合求解非线性、多峰及组合优化问题[2]。GA的基本执行流程如下："
  )
);

children.push(
  createBodyParagraph(
    "（1）编码：将问题的可行解表示为染色体（亦称个体）。常用编码方式包括二进制编码、实数编码和序列编码等，在路径规划问题中通常采用路径点坐标序列作为编码形式。"
  )
);

children.push(
  createBodyParagraph(
    "（2）初始化：随机生成 $N$ 个个体组成初始种群。初始种群的质量和多样性对后续进化效率有重要影响。"
  )
);

children.push(
  createBodyParagraph(
    "（3）适应度评估：依据预先定义的适应度函数计算每个个体的适应度值，该值反映个体作为问题解的优劣程度，是后续选择操作的依据。"
  )
);

children.push(
  createBodyParagraph(
    "（4）选择：根据适应度值从当前种群中选取优良个体作为父代。常用的选择方法包括轮盘赌选择、锦标赛选择和排序选择等。"
  )
);

children.push(
  createBodyParagraph(
    "（5）交叉：以概率 $P_c$ 对两个父代个体的部分基因进行交换重组，生成新的子代个体。交叉操作是GA产生新解的主要途径，体现了基因重组的生物学含义。"
  )
);

children.push(
  createBodyParagraph(
    "（6）变异：以较小概率 $P_m$ 随机改变个体中某些基因位的取值，旨在维持种群多样性、防止搜索过早收敛。"
  )
);

children.push(
  createBodyParagraph(
    "（7）终止判断：当达到预设的最大进化代数或适应度满足精度要求时终止迭代，输出适应度最高的个体作为最终解。"
  )
);

// ── 2.3.2 ──
children.push(createH3("2.3.2 关键算子设计"));

children.push(
  createBodyParagraph(
    "选择算子方面，轮盘赌选择（Roulette Wheel Selection）是应用最为广泛的方法。设种群大小为 $N$，个体 $i$ 的适应度为 $f_i$，则其被选中的概率为："
  )
);

children.push(createFormulaWithNumber("P_i = \\frac{f_i}{\\sum_j f_j}", "2.4"));

children.push(
  createBodyParagraph(
    "交叉算子方面，单点交叉是最基本的实现方式，即随机选定一个交叉位点，将两个父代在该位点之后的基因片段进行互换。多点交叉和均匀交叉则提供了更为灵活的重组模式。需要注意的是，路径规划问题中的交叉算子需经过专门设计，以保证交叉后生成的路径仍具有空间连续性[3][11][20]。"
  )
);

children.push(
  createBodyParagraph(
    "变异算子方面，基本位变异随机选取个体中的若干基因位，以概率 $P_m$ 对其进行修改。在路径规划的语境下，变异操作可表现为删除路径中的冗余节点、插入新的中间节点或对已有节点的坐标进行微扰等形式。"
  )
);

// ── 2.3.3 ──
children.push(createH3("2.3.3 传统遗传算法的局限性"));

children.push(
  createBodyParagraph(
    "将标准GA直接应用于路径规划时，存在以下几方面的不足："
  )
);

children.push(
  createBodyParagraph(
    "（1）收敛速度偏慢。由于初始种群完全随机生成，缺乏来自问题结构的先验引导，算法往往需要经历大量迭代才能演化出质量满意的解，难以满足对实时性有要求的应用场景[8][15]。"
  )
);

children.push(
  createBodyParagraph(
    "（2）易陷入局部最优。随着进化推进，种群多样性逐步下降，交叉和变异操作产生更优个体的概率随之降低，导致早熟收敛现象的发生[4][9][14]。"
  )
);

children.push(
  createBodyParagraph(
    "（3）参数敏感性强。交叉率 $P_c$ 和变异率 $P_m$ 对算法性能影响显著，而固定的参数设置难以适应不同进化阶段的需求——进化初期需要较高的算子概率以鼓励全局探索，后期则应适当降低以保护已发现的优质解[4][9][16][18]。"
  )
);

children.push(
  createBodyParagraph(
    "（4）约束处理能力薄弱。路径规划中的障碍物不可穿越约束属于硬约束，标准GA在交叉变异过程中产生的不可行路径比例较高。若直接丢弃不可行解将造成计算资源浪费，若将其保留在种群中又会干扰进化方向[3][11]。"
  )
);

children.push(
  createBodyParagraph(
    "（5）局部精化能力不足。在搜索过程接近全局最优解的区域时，GA由于缺乏专门的局部搜索机制，可能在最优解邻域内反复徘徊而难以精确收敛，呈现出所谓的\u201C游荡\u201D现象[10][19]。"
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 2.4 本章小结
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("2.4 本章小结"));

children.push(
  createBodyParagraph(
    "本章首先介绍了栅格地图的构建方法与坐标表示，建立了环境建模的数学基础。栅格地图采用二值化表示方式，将连续空间离散化为规则的二维矩阵，便于碰撞检测和路径搜索。同时定义了障碍物密度指标，为后续改进A*算法的动态权重设计提供了量化依据。"
  )
);

children.push(
  createBodyParagraph(
    "随后，本章详细阐述了A*算法的基本原理，包括评估函数的设计、启发式函数的选择以及算法的执行流程，并分析了传统A*算法在搜索效率、路径平滑性、环境自适应性和多目标优化能力等方面的局限性。这些局限性为第三章的改进A*算法设计指明了方向。"
  )
);

children.push(
  createBodyParagraph(
    "最后，本章介绍了遗传算法的基本原理和关键算子设计，包括编码方式、选择、交叉和变异操作，并分析了传统遗传算法在收敛速度、局部最优陷阱、参数敏感性、约束处理和局部精化能力等方面的不足。这些分析为第四章的自适应遗传算法改进提供了理论支撑。"
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
  const outPath = path.join(__dirname, "adjust", "第二章.docx");
  try { fs.unlinkSync(outPath); } catch (e) {}
  fs.writeFileSync(outPath, buffer);
  console.log("✅ 第二章.docx generated at:", outPath);
})();
