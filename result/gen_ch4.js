/**
 * gen_ch4.js — Generate 第四章.docx
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
children.push(createH1("4 自适应遗传算法优化"));

// ═══════════════════════════════════════════════════════════════════════════
// 4.1 自适应遗传算法设计
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("4.1 自适应遗传算法设计"));

children.push(
  createBodyParagraph(
    "针对传统遗传算法在路径规划中存在的收敛速度慢、易陷入局部最优、参数敏感等问题，本文设计了一种自适应遗传算法。该算法具有以下特点：（1）使用改进A*生成的优质路径初始化种群；（2）设计综合考虑多目标的适应度函数；（3）根据个体适应度动态调整交叉变异率；（4）引入精英保留策略防止优良基因丢失。"
  )
);

// ── 4.1.1 种群初始化策略 ──
children.push(createH3("4.1.1 种群初始化策略"));

children.push(
  createBodyParagraph(
    "传统GA通常随机生成初始种群，这种方式虽然多样性好，但个体质量普遍较低，导致进化代数多、收敛慢。本文提出基于改进A*的种群初始化方法："
  )
);

children.push(
  createBodyParagraph(
    "核心思想：利用改进A*算法生成多条不同权重的路径作为初始个体。通过改变动态权重 $\\alpha$ 的值（在 $[1.0, 2.0]$ 范围内随机取值），可以得到多条不同的可行路径。这些路径既保证了基本质量（都是可行解），又具有一定的多样性（因 $\\alpha$ 不同而有所差异）。种群初始化可形式化表示为："
  )
);

children.push(
  createFormulaWithNumber("X_i = A^*(G, s, g, \\alpha), \\quad \\alpha \\in [1.0, 2.0]", "4.1")
);

children.push(
  createBodyParagraph("初始化算法步骤：")
);

children.push(
  createBodyParagraph(
    "（1）设定种群大小 $N_p$（如 $N_p=10$）"
  )
);

children.push(
  createBodyParagraph(
    "（2）对于每个个体 $X_i$（$i=1,2,...,N_p$）："
  )
);

children.push(
  createBodyParagraph(
    "a. 随机生成 $\\alpha_i \\in [1.0, 2.0]$"
  )
);

children.push(
  createBodyParagraph(
    "b. 执行 $\\text{ImprovedAStar}(G, s, g, \\alpha_i)$ 得到路径 $P_i$"
  )
);

children.push(
  createBodyParagraph(
    "c. 对 $P_i$ 进行平滑处理，删除冗余点"
  )
);

children.push(
  createBodyParagraph(
    "d. 将 $P_i$ 加入种群"
  )
);

children.push(
  createBodyParagraph(
    "（3）若生成的路径数量不足 $N_p$（某些 $\\alpha$ 无解），则复制已有路径并添加微小扰动"
  )
);

children.push(
  createBodyParagraph(
    "这种初始化方式的优势：①起点高：所有个体都是可行路径，避免了大量无效搜索；②多样性：不同的 $\\alpha$ 值产生不同的路径，保持了种群多样性；③引导性：利用了问题的启发式信息（障碍物密度），不是盲目随机。"
  )
);

// ── 4.1.2 适应度函数设计 ──
children.push(createH3("4.1.2 适应度函数设计"));

children.push(
  createBodyParagraph(
    "适应度函数是评价个体优劣的标准，直接影响进化方向。在路径规划中，需要考虑多个目标：路径长度（经济性）、平滑度（稳定性）、转折点数（可控性）、安全性（避障）。本文设计的综合适应度函数为："
  )
);

children.push(
  createFormulaWithNumber("F(X) = -(\\omega_1 L(X) + \\omega_2 S(X) + \\omega_3 T(X) + P(X))", "4.2")
);

children.push(
  createBodyParagraph(
    "其中负号表示将最小化问题转化为最大化问题（GA通常求最大适应度）。各项含义如下："
  )
);

// L(X) — bold inline header
children.push(
  createMixedParagraph([
    { text: "$L(X)$ — 路径长度代价：", bold: true },
  ])
);

children.push(
  createFormulaWithNumber("L(X) = \\sum_{i=1}^{|X|-1} d(X_i, X_{i+1})", "4.3")
);

children.push(
  createBodyParagraph(
    "即相邻路径点欧氏距离之和。长度越短，机器人行驶时间越少，能耗越低。"
  )
);

// S(X) — bold inline header
children.push(
  createMixedParagraph([
    { text: "$S(X)$ — 路径平滑度代价：", bold: true },
  ])
);

children.push(
  createFormulaWithNumber("S(X) = \\sum_{i=2}^{|X|-1} \\| (X_i - X_{i-1}) - (X_{i-1} - X_{i-2}) \\|", "4.4")
);

children.push(
  createBodyParagraph(
    "即二阶差分范数之和。该值越小，路径越平滑，机器人转弯越平缓。平滑度反映了路径的\u201C弯曲程度\u201D。"
  )
);

// T(X) — bold inline header
children.push(
  createMixedParagraph([
    { text: "$T(X)$ — 转折点代价：", bold: true },
  ])
);

children.push(
  createBodyParagraph(
    "$T(X)$ 为路径中转折点的数量，即相邻路径段夹角大于阈值（如30°）的点数。转折点越少，路径越接近直线，机器人控制越简单。"
  )
);

// P(X) — bold inline header
children.push(
  createMixedParagraph([
    { text: "$P(X)$ — 碰撞惩罚：", bold: true },
  ])
);

// Piecewise P(X) rendered as two lines of block math
children.push(
  createFormulaWithNumber("P(X) = -\\chi, \\quad \\text{若路径经过障碍物}; \\quad P(X) = 0, \\quad \\text{否则}", "4.5")
);

children.push(
  createBodyParagraph(
    "其中 $\\chi$ 是足够大的正数（如 $10^6$）。碰撞的路径应被严厉惩罚，但允许存在于种群中以便后续修复。"
  )
);

// 权重系数选择
children.push(
  createMixedParagraph([
    { text: "权重系数选择：", bold: true },
    { text: "本文取 $\\omega_1 = \\omega_2 = \\omega_3 = 1.0$，即平等对待各目标。实际应用中可根据需求调整：若重视效率可增大 $\\omega_1$，若重视平稳可增大 $\\omega_2$，若希望路径简洁可增大 $\\omega_3$。" },
  ])
);

// ── 4.1.3 自适应交叉率 ──
children.push(createH3("4.1.3 自适应交叉率"));

children.push(
  createBodyParagraph(
    "传统GA使用固定交叉率 $P_c$，无法适应不同进化阶段和不同个体的需求。本文提出基于个体适应度的自适应交叉率策略："
  )
);

// Piecewise Pc formula rendered as two block math lines
children.push(
  createFormulaWithNumber("P_c = P_c^{max} - (P_c^{max} - P_c^{min})(f_{max} - f_i)/(f_{max} - f_{avg}), \\quad \\text{当} f_i > f_{avg}", "4.6")
);
children.push(
  createFormulaWithNumber("P_c = P_c^{max}, \\quad \\text{当} f_i \\leq f_{avg}", "4.7")
);

children.push(
  createBodyParagraph(
    "其中：$f_i$ 是当前个体适应度，$f_{max}$ 是种群最大适应度，$f_{avg}$ 是平均适应度。$P_c^{max}=0.9$，$P_c^{min}=0.4$。"
  )
);

children.push(
  createBodyParagraph("设计逻辑：")
);

children.push(
  createBodyParagraph(
    "对于优于平均的个体（$f_i > f_{avg}$），其交叉率随适应度升高而降低。优良个体携带更多优质基因，应减少交叉以避免破坏。"
  )
);

children.push(
  createBodyParagraph(
    "对于差于平均的个体（$f_i \\leq f_{avg}$），给予最高交叉率 $P_c^{max}$，鼓励其通过重组改进。"
  )
);

children.push(
  createBodyParagraph(
    "当种群趋同（$f_{max} \\approx f_{avg}$）时，所有个体的 $P_c \\to P_c^{max}$，增加扰动。"
  )
);

// ── 4.1.4 自适应变异率 ──
children.push(createH3("4.1.4 自适应变异率"));

children.push(
  createBodyParagraph("类似地，自适应变异率定义为：")
);

// Piecewise Pm formula rendered as two block math lines
children.push(
  createFormulaWithNumber("P_m = P_m^{min} + (P_m^{max} - P_m^{min})(f_{max} - f_i)/(f_{max} - f_{avg}), \\quad \\text{当} f_i > f_{avg}", "4.8")
);
children.push(
  createFormulaWithNumber("P_m = P_m^{max}, \\quad \\text{当} f_i \\leq f_{avg}", "4.9")
);

children.push(
  createBodyParagraph(
    "其中 $P_m^{max}=0.5$，$P_m^{min}=0.1$。变异率的变化趋势与交叉率相反：优良个体应降低变异率保护基因，较差个体应提高变异率探索新解。"
  )
);

// 停滞打破机制
children.push(
  createMixedParagraph([
    { text: "停滞打破机制：", bold: true },
    { text: "当种群适应度差异过小（$f_{max} - f_{avg} < \\varepsilon$，如 $\\varepsilon=10^{-6}$）时，认为种群趋于一致，可能陷入局部最优。此时强制令所有个体的 $P_m = P_m^{max}$，通过高强度变异跳出局部最优。" },
  ])
);

// ── 4.1.5 精英保留策略 ──
children.push(createH3("4.1.5 精英保留策略"));

children.push(
  createBodyParagraph(
    "为防止进化过程中优良基因丢失，本文采用精英保留策略：每代直接保留适应度最高的 $N_e$ 个个体进入下一代，不参与交叉变异。"
  )
);

children.push(
  createBlockMath("N_e = \\lfloor \\eta N_p \\rfloor, \\quad \\eta \\in (0.05, 0.2)")
);

children.push(
  createBodyParagraph(
    "本文取 $\\eta=0.1$，即保留前10%的精英。精英保留保证了种群质量的单调不降，配合自适应策略可以实现快速收敛。"
  )
);

// ── 4.1.6 选择算子 ──
children.push(createH3("4.1.6 选择算子"));

children.push(
  createBodyParagraph(
    "本文使用Softmax选择结合轮盘赌的方式选择父代个体。Softmax函数将适应度转换为概率："
  )
);

children.push(
  createFormulaWithNumber("p_i = \\frac{\\exp(F_i)}{\\sum_j \\exp(F_j)}", "4.10")
);

children.push(
  createBodyParagraph(
    "即 $p_i = \\exp(F_i) / \\sum_j \\exp(F_j)$，然后按概率进行轮盘赌选择。Softmax相比直接比例选择，可以调节选择的压力：温度参数（此处隐含在 $F$ 的缩放中）控制优势个体的选中概率。"
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 4.2 融合架构设计
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("4.2 融合架构设计"));

children.push(
  createBodyParagraph(
    "本文提出的融合架构将改进A*算法与自适应GA有机结合，充分发挥两者的互补优势：改进A*负责快速生成高质量的初始可行解，GA则在此基础上进行全局优化和多目标平衡。"
  )
);

// ── 4.2.1 总体流程 ──
children.push(createH3("4.2.1 总体流程"));

// 第一阶段
children.push(
  createMixedParagraph([
    { text: "第一阶段 — 改进A*生成初始路径：", bold: true },
    { text: "输入地图 $G$、起点 $s$、终点 $g$，计算障碍物密度 $\\rho$ 和动态权重 $\\alpha$。执行改进A*得到初始可行路径 $P_{initial}$。该路径质量较高但不一定最优，特别是平滑度可能不理想。" },
  ])
);

// 第二阶段
children.push(
  createMixedParagraph([
    { text: "第二阶段 — GA初始化：", bold: true },
    { text: "以 $P_{initial}$ 为基础，通过改变 $\\alpha$ 值（1.0-2.0）生成 $N_p$ 条不同路径组成初始种群。每条路径都经过平滑处理，删除冗余点。" },
  ])
);

// 第三阶段
children.push(
  createMixedParagraph([
    { text: "第三阶段 — GA进化优化：", bold: true },
    { text: "重复以下过程直到达到最大进化代数 $N_{gen}$：" },
  ])
);

children.push(
  createBodyParagraph("a. 计算所有个体的适应度")
);
children.push(
  createBodyParagraph("b. 保留前 $N_e$ 个精英个体")
);
children.push(
  createBodyParagraph("c. 使用Softmax+轮盘赌选择父代")
);
children.push(
  createBodyParagraph("d. 根据自适应 $P_c$ 进行交叉操作")
);
children.push(
  createBodyParagraph("e. 根据自适应 $P_m$ 进行变异操作")
);
children.push(
  createBodyParagraph("f. 对新生成的个体进行路径修复（见4.3节）")
);
children.push(
  createBodyParagraph("g. 精英+新生代组成下一代种群")
);

// 第四阶段
children.push(
  createMixedParagraph([
    { text: "第四阶段 — 输出最优路径：", bold: true },
    { text: "进化结束后，输出适应度最高的个体作为最终路径 $P_{optimize}$。" },
  ])
);

// ── 4.2.2 融合优势分析 ──
children.push(createH3("4.2.2 融合优势分析"));

children.push(
  createBodyParagraph(
    "融合算法相比单一算法的优势体现在以下几个方面："
  )
);

children.push(
  createBodyParagraph(
    "与纯A*相比：GA的多目标优化能力可以显著改善路径平滑度，同时保持路径长度接近最优。实验表明，融合后的路径平滑度比纯A*改善约40%至60%。"
  )
);

children.push(
  createBodyParagraph(
    "与纯GA相比：改进A*初始化为GA提供了高质量的起点，大幅减少了所需的进化代数。纯GA从随机种群出发通常需要50至100代才能收敛至满意解，而融合方法仅需10至20代即可达到相当甚至更优的效果。"
  )
);

children.push(
  createBodyParagraph(
    "计算效率方面：虽然增加了GA优化环节，但由于初始解质量高、收敛速度快，总计算耗时仍控制在可接受范围内（通常不超过5秒），能够满足离线路径规划的需求。"
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 4.3 路径修复机制
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("4.3 路径修复机制"));

children.push(
  createBodyParagraph(
    "在GA进化过程中，交叉和变异操作可能产生不可行路径（穿越障碍物或断连）。简单的做法是直接丢弃，但这会浪费计算资源。本文提出积极修复策略：尽量修复不可行个体，使其重新变为可行解。"
  )
);

// ── 4.3.1 非法点检测 ──
children.push(createH3("4.3.1 非法点检测"));

children.push(
  createBodyParagraph(
    "对于路径 $Q = \\{q_0, q_1, ..., q_k\\}$，以下情况视为非法："
  )
);

children.push(
  createBodyParagraph(
    "（1）路径点 $q_i$ 位于障碍物栅格内：$grid(q_i) = 0$"
  )
);

children.push(
  createBodyParagraph(
    "（2）相邻点连线穿过障碍物：$\\text{CheckLineOfSight}(q_i, q_{i+1}) = \\text{False}$"
  )
);

children.push(
  createBodyParagraph(
    "收集所有非法点的索引集合 $Q_{invalid}$，按从后到前的顺序处理（避免删除操作影响索引）。"
  )
);

// ── 4.3.2 A*重连策略（优先） ──
children.push(createH3("4.3.2 A*重连策略（优先）"));

children.push(
  createBodyParagraph(
    "对于非法点 $q_i$，首先尝试在其前后合法点 $q_{i-1}$ 和 $q_{i+1}$ 之间执行局部A*搜索："
  )
);

children.push(
  createBlockMath("Q'_i = A^*(grid, q_{i-1}, q_{i+1})")
);

children.push(
  createBodyParagraph(
    "若找到可行子路径 $Q'_i$，则用其替换原路径段 $q_{i-1} \\to q_i \\to q_{i+1}$。由于是局部搜索，范围小，速度很快。"
  )
);

children.push(
  createBodyParagraph(
    "优势：A*重连可以找到严格可行的替代路径，保证修复成功率。且重连路径通常质量较好（因为是优化搜索的结果）。"
  )
);

// ── 4.3.3 替代点搜索（备选） ──
children.push(createH3("4.3.3 替代点搜索（备选）"));

children.push(
  createBodyParagraph(
    "若A*重连失败（例如 $q_{i-1}$ 和 $q_{i+1}$ 被完全隔离），则在 $q_i$ 的邻域内寻找替代点。具体步骤："
  )
);

children.push(
  createBodyParagraph(
    "（1）定义搜索邻域 $B(q_i, r)$，是以 $q_i$ 为中心、$r$ 为半径的方形区域（如 $r=5$）"
  )
);

children.push(
  createBodyParagraph(
    "（2）遍历邻域内所有栅格点 $q'$，检查是否满足："
  )
);

children.push(
  createBodyParagraph(
    "a. $q'$ 是自由空间：$grid(q') = 1$"
  )
);

children.push(
  createBodyParagraph(
    "b. $q'$ 与 $q_{i-1}$ 直线可达：$\\text{CheckLineOfSight}(q_{i-1}, q') = \\text{True}$"
  )
);

children.push(
  createBodyParagraph(
    "c. $q'$ 与 $q_{i+1}$ 直线可达：$\\text{CheckLineOfSight}(q', q_{i+1}) = \\text{True}$"
  )
);

children.push(
  createBodyParagraph(
    "（3）在所有满足条件的 $q'$ 中，选择距离 $q_i$ 最近的点作为替代："
  )
);

children.push(
  createBlockMath("q_i' = \\text{argmin}_{q \\in B(q_i, r)} \\|q - q_i\\|")
);

children.push(
  createBodyParagraph(
    "替代点搜索的本质是\u201C绕路\u201D：既然直线路径不通，就找一个附近的可行点绕行。虽然可能增加路径长度，但保证了可行性。"
  )
);

// ── 4.3.4 递归修复与终止 ──
children.push(createH3("4.3.4 递归修复与终止"));

children.push(
  createBodyParagraph(
    "修复过程可能产生新的非法点（特别是替代点搜索），因此需要递归执行。设置最大修复次数（如10次），超过限制仍未修复成功则放弃该个体。"
  )
);

children.push(
  createBodyParagraph(
    "修复完成后，验证整条路径的连通性：依次检查所有相邻点对是否直线可达。只有完全连通的路径才被接受为可行解。"
  )
);

// ── 4.3.5 修复效果评估 ──
children.push(createH3("4.3.5 修复效果评估"));

children.push(
  createBodyParagraph("路径修复机制的效果：")
);

children.push(
  createBodyParagraph(
    "①提高种群利用率：原本要丢弃的不可行个体经修复后可继续使用，相当于增大了有效种群规模。"
  )
);

children.push(
  createBodyParagraph(
    "②增加多样性：修复过程引入了新的路径结构，可能发现未经探索的优质解。"
  )
);

children.push(
  createBodyParagraph(
    "③保证收敛：每一代都有足够多的可行个体，确保进化方向正确。"
  )
);

children.push(
  createBodyParagraph(
    "实验统计表明，加入修复机制后，GA的有效个体比例从约60%提升到85%以上，收敛速度提高约30%。"
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 4.4 本章小结
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH2("4.4 本章小结"));

children.push(
  createBodyParagraph(
    "本章详细阐述了自适应遗传算法的设计与实现。首先，提出了基于改进A*的种群初始化方法，利用不同权重参数生成多样化的高质量初始种群，显著提升了进化起点。其次，设计了综合适应度函数，将路径长度、平滑度、转折点数和碰撞惩罚等多个目标有机整合，实现了多目标优化。"
  )
);

children.push(
  createBodyParagraph(
    "在遗传算子方面，本章提出了基于个体适应度的自适应交叉率和变异率策略，使算法能够根据个体质量和进化阶段动态调整参数，平衡了全局探索与局部开发能力。同时，设计了精英保留策略和Softmax选择机制，保证了进化过程的稳定性和收敛性。"
  )
);

children.push(
  createBodyParagraph(
    "最后，本章介绍了路径修复机制的设计，包括碰撞检测、绕障修复和连通性验证三个核心步骤，有效解决了遗传操作产生的不可行路径问题，提高了种群利用率和收敛效率。本章内容与第三章的改进A*算法共同构成了完整的融合路径规划框架。"
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
  const outPath = path.join(__dirname, "adjust", "第四章.docx");
  try { fs.unlinkSync(outPath); } catch (e) {}
  fs.writeFileSync(outPath, buffer);
  console.log("✅ 第四章.docx generated at:", outPath);
})();
