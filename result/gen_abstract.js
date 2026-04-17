/**
 * gen_abstract.js — Generate 摘要.docx (Chinese + English abstracts)
 */

const fs = require("fs");
const path = require("path");
const { Packer } = require("docx");

const {
  FONT,
  SIZE,
  PAGE_PROPERTIES,
  STYLES,
  createH1,
  createBodyParagraph,
  createEmptyParagraph,
  Paragraph,
  TextRun,
  AlignmentType,
  Document,
  buildTextRuns,
  makeBodyRuns,
} = require("./docx_utils");

// ─── Content ────────────────────────────────────────────────────────────────

const cnPara1 =
  "\u79FB\u52A8\u673A\u5668\u4EBA\u8DEF\u5F84\u89C4\u5212\u662F\u673A\u5668\u4EBA\u5B66\u4E0E\u4EBA\u5DE5\u667A\u80FD\u9886\u57DF\u7684\u6838\u5FC3\u7814\u7A76\u8BFE\u9898\u4E4B\u4E00\uFF0C\u5176\u6027\u80FD\u4F18\u52A3\u76F4\u63A5\u5F71\u54CD\u673A\u5668\u4EBA\u5728\u4ED3\u50A8\u914D\u9001\u3001\u533B\u7597\u8F85\u52A9\u3001\u5DE5\u4E1A\u5DE1\u68C0\u53CA\u81EA\u52A8\u9A7E\u9A76\u7B49\u573A\u666F\u4E2D\u7684\u4EFB\u52A1\u6267\u884C\u6548\u7387\u3001\u80FD\u91CF\u6D88\u8017\u548C\u8FD0\u884C\u5B89\u5168\u6027\u3002\u8FD1\u5E74\u6765\uFF0C\u968F\u7740\u667A\u80FD\u5236\u9020\u548C\u667A\u6167\u7269\u6D41\u7B49\u6280\u672F\u7684\u8FC5\u901F\u53D1\u5C55\uFF0C\u5BF9\u79FB\u52A8\u673A\u5668\u4EBA\u5728\u5927\u89C4\u6A21\u590D\u6742\u73AF\u5883\u4E2D\u7684\u8DEF\u5F84\u89C4\u5212\u80FD\u529B\u63D0\u51FA\u4E86\u66F4\u9AD8\u8981\u6C42\u3002\u5728\u4F20\u7EDF\u7B97\u6CD5\u65B9\u9762\uFF0CA*\u7B97\u6CD5\u548CDijkstra\u7B97\u6CD5\u7B49\u786E\u5B9A\u6027\u641C\u7D22\u65B9\u6CD5\u867D\u7136\u5728\u7406\u8BBA\u4E0A\u80FD\u591F\u4FDD\u8BC1\u8DEF\u5F84\u6700\u4F18\u6027\uFF0C\u4F46\u5728\u5DE5\u7A0B\u5B9E\u8DF5\u4E2D\u9762\u4E34\u641C\u7D22\u6548\u7387\u74F6\u9888\u3001\u542F\u53D1\u5F0F\u6743\u91CD\u56FA\u5B9A\u5BFC\u81F4\u73AF\u5883\u81EA\u9002\u5E94\u6027\u4E0D\u8DB3\u3001\u4EE5\u53CA\u6805\u683C\u79BB\u6563\u5316\u5F15\u8D77\u8DEF\u5F84\u5197\u4F59\u8F6C\u6298\u7B49\u7A81\u51FA\u95EE\u9898\uFF1B\u5FEB\u901F\u968F\u673A\u6811\uFF08RRT\uFF09\u7B49\u57FA\u4E8E\u91C7\u6837\u7684\u65B9\u6CD5\u867D\u7136\u9002\u7528\u4E8E\u9AD8\u7EF4\u7A7A\u95F4\uFF0C\u4F46\u751F\u6210\u7684\u8DEF\u5F84\u8D28\u91CF\u4E0D\u7A33\u5B9A\u4E14\u96BE\u4EE5\u4FDD\u8BC1\u6700\u4F18\u6027\uFF1B\u4EBA\u5DE5\u52BF\u573A\u6CD5\uFF08APF\uFF09\u867D\u5B9E\u65F6\u6027\u597D\uFF0C\u4F46\u6781\u6613\u9677\u5165\u5C40\u90E8\u6781\u5C0F\u503C\u3002\u5728\u667A\u80FD\u4F18\u5316\u7B97\u6CD5\u65B9\u9762\uFF0C\u9057\u4F20\u7B97\u6CD5\uFF08GA\uFF09\u3001\u7C92\u5B50\u7FA4\u4F18\u5316\uFF08PSO\uFF09\u548C\u8681\u7FA4\u7B97\u6CD5\uFF08ACO\uFF09\u7B49\u65B9\u6CD5\u867D\u7136\u5177\u5907\u5168\u5C40\u641C\u7D22\u80FD\u529B\uFF0C\u4F46\u5206\u522B\u5B58\u5728\u6536\u655B\u901F\u5EA6\u6162\u3001\u6613\u9677\u5165\u5C40\u90E8\u6700\u4F18\u3001\u5173\u952E\u53C2\u6570\u4F9D\u8D56\u4EBA\u5DE5\u7ECF\u9A8C\u8BBE\u5B9A\u7B49\u95EE\u9898\uFF0C\u96BE\u4EE5\u76F4\u63A5\u6EE1\u8DB3\u5BF9\u5B9E\u65F6\u6027\u548C\u89E3\u8D28\u91CF\u6709\u8F83\u9AD8\u8981\u6C42\u7684\u8DEF\u5F84\u89C4\u5212\u4EFB\u52A1\u3002\u8FD1\u5E74\u6765\uFF0C\u56FD\u5185\u5916\u5927\u91CF\u7855\u535A\u58EB\u5B66\u4F4D\u8BBA\u6587\u548C\u671F\u520A\u7814\u7A76\u56F4\u7ED5\u7B97\u6CD5\u878D\u5408\u5C55\u5F00\u4E86\u6DF1\u5165\u63A2\u7D22\uFF0C\u5C06\u4E0D\u540C\u7B97\u6CD5\u7684\u4E92\u8865\u4F18\u52BF\u8FDB\u884C\u6709\u673A\u878D\u5408\u5DF2\u6210\u4E3A\u8DEF\u5F84\u89C4\u5212\u9886\u57DF\u7684\u91CD\u8981\u53D1\u5C55\u8D8B\u52BF\uFF0C\u4F46\u73B0\u6709\u878D\u5408\u65B9\u6848\u5728\u521D\u59CB\u8DEF\u5F84\u8D28\u91CF\u5F15\u5BFC\u3001\u9057\u4F20\u8FDB\u5316\u53C2\u6570\u81EA\u9002\u5E94\u8C03\u8282\u4EE5\u53CA\u4E0D\u53EF\u884C\u8DEF\u5F84\u4FEE\u590D\u7B49\u5173\u952E\u73AF\u8282\u4ECD\u5B58\u5728\u4E0D\u8DB3\uFF0C\u5236\u7EA6\u4E86\u878D\u5408\u7B97\u6CD5\u7684\u7EFC\u5408\u6027\u80FD\u4E0E\u5B9E\u9645\u5E94\u7528\u4EF7\u503C\u3002";

const cnPara2 =
  "针对上述问题，本文提出了一种融合改进A*算法与自适应遗传算法的移动机器人路径规划方法。首先，在A*算法层面引入基于障碍物密度的动态权重因子 $\\alpha(\\rho)=1+2\\rho/(1+\\rho^2)$，建立环境复杂度与启发函数权重之间的自适应映射关系，使算法在低障碍物密度区域保持路径最优性，在高密度障碍区域增强搜索引导力度以减少无效节点扩展，有效提升搜索效率；同时配合冗余点删除与折线段简化等路径平滑后处理手段，改善初始路径质量。随后，在遗传算法层面设计了多项自适应优化策略：利用不同权重参数的改进A*生成多条差异化可行路径作为初始种群，解决传统遗传算法\u201C冷启动\u201D问题；构建综合考虑路径长度、平滑度、转折点数量及碰撞惩罚的多目标适应度函数，引导种群向兼顾经济性与平稳性的方向进化；提出基于个体适应度的自适应交叉率和变异率调整策略，对优良个体降低算子概率以保护优质基因，对较差个体提高算子概率以促进探索改进，并引入精英保留机制和停滞打破机制防止早熟收敛。最后，针对遗传进化过程中交叉变异产生的不可行路径，设计了\u201CA*重连优先、替代点搜索备选\u201D的两级递归路径修复策略，有效保障输出路径的连通性与可行性，提高种群利用率。";

const cnPara3 =
  "实验在1500\u00D71500的大规模真实栅格地图上进行了五阶段系统验证，将所提融合方案（Improved A*+GA）与标准A*、Dijkstra、JPS以及JPS+GA等多种基准算法进行了全面对比。实验结果表明：改进A*算法的搜索效率比标准A*提升19.6%\u201475.1%，且随规划距离增大优势更加显著；融合方案在路径长度上比纯改进A*缩短3.9%\u20148.5%，转折点减少48%\u201492%；在路径平滑度指标上比JPS优7.9\u20148.5倍，展现出压倒性的路径质量优势；在计算效率上比Dijkstra提升64%\u201498%。与JPS+GA方案相比，Improved A*+GA在平滑度上优8.1\u20148.7倍，综合性能更为均衡。所有生成路径均通过有效性验证，证明了本文方法在复杂栅格环境下具有良好的可靠性和实用性。";

const enPara1 =
  "With the rapid advancement of intelligent manufacturing, smart logistics, and service robotics, mobile robots have been increasingly deployed in scenarios such as warehouse distribution, medical assistance, industrial inspection, and autonomous driving. Path planning, as a core functional module of mobile robots, plays a decisive role in key performance indicators including task execution efficiency, energy consumption, and operational safety. Traditional heuristic search methods represented by the A* algorithm and Dijkstra algorithm, though theoretically capable of obtaining optimal paths, suffer from several prominent issues in engineering applications: excessive node expansion in complex environments with high obstacle density, leading to substantial computational overhead; fixed-weight heuristic functions that lack adaptive adjustment to environmental characteristics; and redundant turning points caused by grid discretization and inherent search strategy limitations that compromise path smoothness and practical executability. On the other hand, intelligent optimization methods such as the genetic algorithm, despite their good robustness in global search, face challenges including slow convergence, susceptibility to local optima, and reliance on empirically determined parameter settings. In recent years, algorithm fusion combining the strengths of different approaches has become an important research trend, yet existing fusion schemes still exhibit deficiencies in initial path quality guidance, adaptive parameter adjustment during genetic evolution, and infeasible path repair.";

const enPara2 =
  "To address these issues, this thesis proposes a mobile robot path planning method that integrates an improved A* algorithm with an adaptive genetic algorithm. First, a dynamic weight factor $\\alpha(\\rho)=1+2\\rho/(1+\\rho^2)$ based on obstacle density is introduced into the A* algorithm, establishing an adaptive mapping between environmental complexity and heuristic function weight, effectively improving search efficiency. Subsequently, multiple adaptive optimization strategies are designed for the genetic algorithm: diversified feasible paths generated by the improved A* with different weight parameters serve as the initial population; a multi-objective fitness function comprehensively considering path length, smoothness, number of turning points, and collision penalty is constructed; adaptive crossover and mutation rate adjustment strategies based on individual fitness are proposed, complemented by elite preservation and stagnation breaking mechanisms. Finally, a two-level recursive path repair strategy of \u201CA* reconnection priority with substitute point search as backup\u201D is designed to ensure path connectivity and feasibility.";

const enPara3 =
  "Experiments are conducted on a large-scale 1500\u00D71500 real grid map through five-stage systematic verification, comparing the proposed fusion scheme (Improved A*+GA) against multiple benchmark algorithms including Standard A*, Dijkstra, JPS, and JPS+GA. Experimental results demonstrate that the improved A* algorithm achieves 19.6%\u201375.1% improvement in search efficiency over Standard A*; the fusion scheme reduces path length by 3.9%\u20138.5% and turning points by 48%\u201392% compared to pure Improved A*; achieves 7.9\u20138.5 times better path smoothness than JPS; and improves computational efficiency by 64%\u201398% over Dijkstra. Compared with JPS+GA, the proposed Improved A*+GA achieves 8.1\u20138.7 times better smoothness with more balanced overall performance. All generated paths pass validity verification, confirming the reliability and practicality of the proposed method in complex grid environments.";

// ─── Build paragraphs ────────────────────────────────────────────────────────

const children = [];

// 1. Chinese abstract heading
children.push(createH1("摘要"));

// 2. Chinese body paragraphs
children.push(createBodyParagraph(cnPara1));
children.push(createBodyParagraph(cnPara2));
children.push(createBodyParagraph(cnPara3));

// 3. Chinese keywords line
children.push(
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
    indent: { firstLine: 480 },
    children: [
      new TextRun({
        text: "关键词：",
        font: { name: FONT.CN_HEI },
        size: SIZE.BODY,
        bold: true,
      }),
      ...makeBodyRuns(
        "机器人，路径规划，A*算法，自适应遗传算法，启发函数，动态权重",
        SIZE.BODY,
        FONT.CN_SONG
      ).map((r) => new TextRun(r)),
    ],
  })
);

// 4. English abstract heading — manually create with Times New Roman 16pt bold, centered
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 240, line: 360 },
    children: [
      new TextRun({
        text: "Abstract",
        font: { name: FONT.EN },
        size: SIZE.H1,
        bold: true,
      }),
    ],
  })
);

// 5. English body paragraphs
children.push(createBodyParagraph(enPara1));
children.push(createBodyParagraph(enPara2));
children.push(createBodyParagraph(enPara3));

// 6. English keywords line
children.push(
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
    indent: { firstLine: 480 },
    children: [
      new TextRun({
        text: "Keywords: ",
        font: { name: FONT.EN },
        size: SIZE.BODY,
        bold: true,
      }),
      new TextRun({
        text: "Robot, path planning, A* algorithm, adaptive genetic algorithm, heuristic function, dynamic weight",
        font: { name: FONT.EN },
        size: SIZE.BODY,
      }),
    ],
  })
);

// ─── Create document and write file ──────────────────────────────────────────

const doc = new Document({
  ...STYLES,
  sections: [
    {
      ...PAGE_PROPERTIES,
      children,
    },
  ],
});

const outputPath = path.join(__dirname, "摘要.docx");

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(outputPath, buf);
  console.log(`✅ 摘要.docx generated at: ${outputPath}`);
});