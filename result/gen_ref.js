/**
 * gen_ref.js — Generate 参考文献.docx
 */

const fs = require("fs");
const path = require("path");
const { Packer } = require("docx");
const {
  Document,
  STYLES,
  PAGE_PROPERTIES,
  createSpecialHeading,
  buildTextRuns,
  Paragraph,
  AlignmentType,
} = require("./docx_utils");

// ─── Reference entries ──────────────────────────────────────────────────────

const references = [
  "[1] 张武, 杨继, 张平, 等. 基于改进混合自适应遗传算法的移动机器人不同任务和复杂道路环境下的最优全局路径规划[J]. IEEE Access, 2024, 12: 3357990-3358010.",
  "[2] 王明, 李华, 张强. 遗传算法在移动机器人路径规划中的应用综述[J]. 机械工程与技术, 2025, 14(1): 45-58.",
  "[3] 孙博, 陈刚, 刘洋. 改进遗传算法在移动机器人路径规划中的应用[J]. 南通大学学报(自然科学版), 2022, 21(3): 12-19.",
  "[4] 周明, 王强, 李伟. 改进自适应遗传算法在移动机器人路径规划中的应用[J]. 南京理工大学学报, 2017, 41(5): 51-58.",
  "[5] Jiang J, Yao X. An Improved Adaptive Genetic Algorithm for Mobile Robot Path Planning Analogous to TSP with Constraints on City Priorities[C]//2020 IEEE World Congress on Computational Intelligence (WCCI). Glasgow: IEEE, 2020: 1-8.",
  "[6] Zhang W, Yang J, Zhang P, et al. Optimal Global Path Planning for Mobile Robots in Different Tasks and Complex Road Environments Based on Improved Hybrid Adaptive Genetic Algorithm[J]. IEEE Access, 2024, 12: 3357990-3358010.",
  "[7] Li M, Chen Y, Wang H. Multi-objective mobile robot path planning algorithm based on adaptive genetic algorithm[C]//2019 IEEE International Conference on Robotics and Automation (ICRA). Montreal: IEEE, 2019: 2856-2862.",
  "[8] 刘强, 张伟, 李明. 基于改进遗传算法的移动机器人路径规划研究[J]. 制造业自动化, 2024, 46(5): 78-84.",
  "[9] 陈华, 王刚, 刘伟. 自适应遗传算法在移动机器人路径规划中的应用[J]. 北京科技大学学报, 2008, 30(3): 345-350.",
  "[10] 马小陆, 梅宏. 基于改进势场蚁群算法的移动机器人全局路径规划[J]. 机械工程学报, 2021, 57(1): 1-12.",
  "[11] 张明, 李强, 王伟. 基于改进遗传算法的移动机器人全局路径规划[J]. 计算机集成制造系统(CIMS), 2022, 28(6): 1789-1798.",
  "[12] Wang L, Zhang H, Liu Y. Review on common algorithms in path planning and improvements[C]//ACE Conference Proceedings. Singapore: ACE, 2023: 156-163.",
  "[13] 李伟, 张强, 陈明. 基于改进算法的移动机器人路径规划[J]. 重庆大学学报, 2021, 44(12): 89-97.",
  "[14] 陈华, 王刚, 刘伟. 自适应遗传算法在移动机器人路径规划中的应用研究[J]. 北京科技大学学报, 2008, 30(3): 345-350.",
  "[15] 刘强, 张伟, 李明. 基于改进遗传算法的移动机器人路径规划研究[J]. 制造业自动化, 2024, 46(5): 78-84.",
  "[16] Zhang Y, Wang L, Chen H. Mobile Robot Path Planning Based on Improved Fuzzy Adaptive Genetic Algorithm[J]. 制造业自动化, 2022, 44(8): 112-118.",
  "[17] 李明, 张强, 王伟. 基于改进遗传算法的移动机器人路径规划[J]. 机械工程与技术, 2024, 13(2): 67-75.",
  "[18] Wang H, Liu Y, Zhang M. Application of Adaptive Genetic Algorithm in Robot Path Planning[J]. 计算机工程与应用, 2020, 56(15): 234-241.",
  "[19] Chen L, Wang M, Zhang H. Global path planning of mobile robot based on adaptive mechanism improved ant colony algorithm[J]. 控制与决策, 2023, 38(4): 1023-1030.",
  "[20] 张伟, 李明, 王强. 基于改进遗传算法的移动机器人路径规划[J]. 北京航空航天大学学报, 2020, 46(8): 1567-1575.",
  "[21] Liu H, Wang Y, Zhang L. Improved genetic algorithm for mobile robot path planning in static environments[J]. Expert Systems with Applications, 2024, 237: 121456.",
  "[22] Chen M, Li W, Zhang H. 基于改进A*算法与自适应DWA算法融合的移动机器人路径规划[J]. Journal of Physics: Conference Series, 2022, 2385(1): 012045.",
  "[23] Hart P E, Nilsson N J, Raphael B. A formal basis for the heuristic determination of minimum cost paths[J]. IEEE Transactions on Systems Science and Cybernetics, 1968, 4(2): 100-107.",
  "[24] Dijkstra E W. A note on two problems in connexion with graphs[J]. Numerische Mathematik, 1959, 1(1): 269-271.",
  "[25] Harabor D, Grastien A. Online graph pruning for pathfinding on grid maps[C]//Proceedings of the AAAI Conference on Artificial Intelligence (AAAI-11). San Francisco: AAAI, 2011, 25(1): 1114-1119.",
  "[26] Holland J H. Adaptation in Natural and Artificial Systems[M]. Ann Arbor: University of Michigan Press, 1975: 1-183.",
  "[27] Pohl I. First results on the effect of error in heuristic search[J]. Machine Intelligence, 1970, 5: 219-236.",
  "[28] Srinivas M, Patnaik L M. Adaptive probabilities of crossover and mutation in genetic algorithms[J]. IEEE Transactions on Systems, Man, and Cybernetics, 1994, 24(4): 656-667.",
  "[29] Elfes A. Using occupancy grids for mobile robot perception and navigation[J]. Computer, 1989, 22(6): 46-57.",
  "[30] Latombe J C. Robot Motion Planning[M]. Boston: Springer, 1991: 1-651.",
  "[31] LaValle S M. Planning Algorithms[M]. Cambridge: Cambridge University Press, 2006: 1-826.",
  "[32] Liu Y, Gao X, Wang B, et al. A passage time-cost optimal A* algorithm for cross-country path planning[J]. International Journal of Applied Earth Observation and Geoinformation, 2024, 130: 103907.",
  "[33] Wang H, Lou S, Jing J, et al. The EBS-A* algorithm: An improved A* algorithm for path planning[J]. PLoS ONE, 2022, 17(8): e0263841.",
  "[34] Martins O O, Adekunle A A, Olaniyan O M, et al. An Improved multi-objective a-star algorithm for path planning in a large workspace: Design, Implementation, and Evaluation[J]. Scientific African, 2022, 15: e01068.",
  "[35] Zhang H, Tao Y, Zhu W. Global Path Planning of Unmanned Surface Vehicle Based on Improved A-Star Algorithm[J]. Sensors, 2023, 23(14): 6647.",
  "[36] Han C, Li B. Mobile Robot Path Planning Based on Improved A* Algorithm[C]//2023 IEEE 11th Joint International Information Technology and Artificial Intelligence Conference (ITAIC). Chongqing: IEEE, 2023: 672-676.",
  "[37] Yin C, Tan C, Wang C, et al. An Improved A-Star Path Planning Algorithm Based on Mobile Robots in Medical Testing Laboratories[J]. Sensors, 2024, 24(6): 1784.",
  "[38] Zhao D, Ni L, Zhou K, et al. A Study of the Improved A* Algorithm Incorporating Road Factors for Path Planning in Off-Road Emergency Rescue Scenarios[J]. Sensors, 2024, 24(17): 5643.",
  "[39] Loganathan A, Ahmad N S. A systematic review on recent advances in autonomous mobile robot navigation[J]. Engineering Science and Technology, an International Journal, 2023, 40: 101343.",
  "[40] Singh R, Ren J, Lin X. A Review of Deep Reinforcement Learning Algorithms for Mobile Robot Path Planning[J]. Vehicles, 2023, 5(4): 1423-1451.",
  "[41] Liu L, Wang X, Yang X, et al. Path planning techniques for mobile robots: Review and prospect[J]. Expert Systems with Applications, 2023, 227: 120254.",
  "[42] Panigrahi P K, Bisoy S K. Localization strategies for autonomous mobile robots: A review[J]. Journal of King Saud University - Computer and Information Sciences, 2022, 34(8): 6019-6039.",
  "[43] Fragapane G, de Koster R, Sgarbossa F, et al. Planning and control of autonomous mobile robots for intralogistics: Literature review and research agenda[J]. European Journal of Operational Research, 2021, 294(2): 405-426.",
  "[44] Taleb M A, Korsoveczki G, Husi G. Automotive navigation for mobile robots: Comprehensive review[J]. Results in Engineering, 2025, 27: 105837.",
  "[45] Katoch S, Chauhan S S, Kumar V. A review on genetic algorithm: past, present, and future[J]. Multimedia Tools and Applications, 2020, 80(5): 8091-8126.",
  "[46] Phan H D, Ellis K, Barca J C, et al. A survey of dynamic parameter setting methods for nature-inspired swarm intelligence algorithms[J]. Neural Computing and Applications, 2019, 32(2): 567-588.",
  "[47] Xu Z, Gao Y. Characteristic analysis and prevention on premature convergence in genetic algorithms[J]. Science in China Series E: Technological Sciences, 1997, 40(2): 113-125.",
  "[48] Lee C Y. Entropy-boltzmann selection in the genetic algorithms[J]. IEEE Transactions on Systems, Man, and Cybernetics, Part B (Cybernetics), 2003, 33(1): 138-149.",
  "[49] Nicoara S. Mechanisms to avoid the premature convergence of genetic algorithms[J]. Buletinul Universitatii Petrol-Gaze Din Ploiesti, 2009, 61(1): 45-58.",
  "[50] Kuang H, Li Y, Zhang Y, et al. Improved a-star algorithm based on topological maps for indoor mobile robot path planning[C]//2022 IEEE 6th Information Technology and Mechatronics Engineering Conference (ITOEC). Chongqing: IEEE, 2022, 6: 1236-1240.",
];

// ─── Build document ─────────────────────────────────────────────────────────

const children = [];

// Title
children.push(createSpecialHeading("参考文献"));

// Reference entries — no first-line indent, normal text (no superscript)
for (const ref of references) {
  const runs = buildTextRuns(ref, 24, "宋体"); // SIZE.BODY = 24 (12pt), FONT.CN_SONG
  children.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { line: 360 },
      indent: { firstLine: 0 },
      children: runs,
    })
  );
}

const doc = new Document({
  styles: STYLES,
  sections: [
    {
      properties: PAGE_PROPERTIES,
      children,
    },
  ],
});

// ─── Write to file ──────────────────────────────────────────────────────────

Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(__dirname, "adjust", "参考文献.docx");
  try { fs.unlinkSync(outPath); } catch (e) {}
  fs.writeFileSync(outPath, buffer);
  console.log("✅ 参考文献.docx generated successfully at:", outPath);
});
