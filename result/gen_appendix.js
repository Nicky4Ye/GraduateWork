/**
 * gen_appendix.js — Generate 附录.docx for the thesis appendices
 */

const fs = require("fs");
const { Packer } = require("docx");
const {
  FONT, SIZE, PAGE_PROPERTIES, STYLES, NO_BORDER,
  createBodyParagraph, createH1, createH2, createH3,
  createTable, createTableCaption, createEmptyParagraph,
  buildTextRuns, makeBodyRuns,
  Paragraph, TextRun, AlignmentType, Document,
} = require("./docx_utils");

// ─── Helper: code block ────────────────────────────────────────────────────

/**
 * Render a code block as an array of Paragraphs.
 * Each line becomes its own Paragraph with Consolas 9pt, single spacing, no indent.
 */
function createCodeBlock(code) {
  const lines = code.split("\n");
  // Remove leading/trailing empty lines
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();

  return lines.map(
    (line) =>
      new Paragraph({
        alignment: AlignmentType.LEFT,
        spacing: { line: 240 },
        indent: { firstLine: 0 },
        children: [
          new TextRun({
            text: line || " ", // ensure non-empty for rendering
            font: { name: "Consolas" },
            size: 18, // 小五号 9pt = 18 half-points
          }),
        ],
        shading: {
          type: require("docx").ShadingType.SOLID,
          color: "F2F2F2",
          fill: "F2F2F2",
        },
      })
  );
}

/**
 * Create a bold sub-header paragraph (like "种群初始化与适应度函数：")
 */
function createBoldSubHeader(text) {
  const children = buildTextRuns(text, SIZE.BODY, FONT.CN_SONG, { bold: true });
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 120, after: 60, line: 360 },
    indent: { firstLine: 480 },
    children,
  });
}

// ─── Code content ──────────────────────────────────────────────────────────

const CODE_A1 = `import heapq
import numpy as np

COST_CARDINAL = 1.0
COST_DIAG = np.sqrt(2)

class ImprovedAStar:
    def __init__(self, grid, baseAlpha=None):
        self.m_grid = np.asarray(grid)
        self.m_height, self.m_width = self.m_grid.shape
        self.m_baseAlpha = self.CalculateAlphaFromGrid() \\
            if baseAlpha is None else baseAlpha

    def CalculateAlphaFromGrid(self):
        totalCells = self.m_height * self.m_width
        obstacleCount = totalCells - int(np.sum(self.m_grid))
        rho = obstacleCount / totalCells if totalCells > 0 else 0.0
        return 1.0 + (2.0 * rho) / (1.0 + rho * rho)

    def Heuristic(self, a, b, alpha):
        return alpha * (abs(a[0]-b[0]) + abs(a[1]-b[1]))

    def Plan(self, start, goal, randomAlphaOffset=0.0,
             targetAlpha=None):
        if targetAlpha is not None:
            currentAlpha = min(2.0, max(1.0, float(targetAlpha)))
        elif randomAlphaOffset > 0:
            currentAlpha = min(2.0, max(1.0,
                self.m_baseAlpha + randomAlphaOffset))
        else:
            currentAlpha = self.m_baseAlpha
        gScore = np.full((self.m_height, self.m_width), np.inf)
        gScore[start] = 0
        openList = [(self.Heuristic(start, goal, currentAlpha),
                      0, start)]
        cameFrom = {}
        visited = np.zeros((self.m_height, self.m_width),
                           dtype=bool)
        neighbors = [
            (0,1,COST_CARDINAL), (0,-1,COST_CARDINAL),
            (1,0,COST_CARDINAL), (-1,0,COST_CARDINAL),
            (1,1,COST_DIAG), (1,-1,COST_DIAG),
            (-1,1,COST_DIAG), (-1,-1,COST_DIAG)]
        while openList:
            currentF, currentG, current = \\
                heapq.heappop(openList)
            if visited[current]: continue
            visited[current] = True
            if current == goal:
                path = [current]
                while current in cameFrom:
                    current = cameFrom[current]
                    path.append(current)
                return path[::-1]
            for dr, dc, cost in neighbors:
                nr, nc = current[0]+dr, current[1]+dc
                if not (0<=nr<self.m_height and
                        0<=nc<self.m_width): continue
                if self.m_grid[nr,nc]!=1 or \\
                   visited[nr,nc]: continue
                newG = currentG + cost
                if newG < gScore[nr, nc]:
                    gScore[nr,nc] = newG
                    hVal = self.Heuristic((nr,nc),
                        goal, currentAlpha)
                    cameFrom[(nr,nc)] = current
                    heapq.heappush(openList,
                        (newG+hVal, newG, (nr,nc)))
        return None`;

const CODE_A2_INIT = `class AdaptiveGA:
    def __init__(self, grid, baseAlpha, start, goal,
                 pop_size=10, max_gen=20, elite_ratio=0.1,
                 chi=1e6, initial_solver="improved_astar"):
        self.m_grid = grid
        self.m_start = start
        self.m_goal = goal
        self.m_popSize = pop_size
        self.m_maxGen = max_gen
        self.m_eliteRatio = elite_ratio
        self.m_chi = chi  # 碰撞惩罚系数
        self.m_astar = ImprovedAStar(grid, baseAlpha)
        self.m_pcMax, self.m_pcMin = 0.9, 0.4
        self.m_pmMax, self.m_pmMin = 0.5, 0.1
        self.m_w1, self.m_w2, self.m_w3 = 1.0, 1.0, 1.0

    def InitializePopulation(self):
        self.m_population = []
        attempts = 0
        while len(self.m_population) < self.m_popSize \\
              and attempts < self.m_popSize * 10:
            targetAlpha = random.uniform(1.0, 2.0)
            path = self.m_astar.Plan(self.m_start,
                self.m_goal, targetAlpha=targetAlpha)
            if path:
                self.m_population.append(path)
            attempts += 1

    def CalculateFitness(self, path):
        if not path or len(path) < 2:
            return -self.m_chi
        L, S = CalculatePathMetrics(path)
        T = len(path)
        P = self.CalculateCollisionPenalty(path)
        cost = self.m_w1*L + self.m_w2*S + self.m_w3*T + P
        return -cost`;

const CODE_A2_ADAPTIVE = `    def GetAdaptiveRates(self, fVal, fAvg, fMax):
        delta = fMax - fAvg
        if delta < 1e-6:
            return self.m_pcMax, self.m_pmMax
        if fVal > fAvg:  # 优于平均的个体
            pc = self.m_pcMax - (self.m_pcMax-self.m_pcMin) \\
                 * (fMax-fVal) / delta
            pm = self.m_pmMin + (self.m_pmMax-self.m_pmMin) \\
                 * (fMax-fVal) / delta
        else:  # 较差个体：高交叉高变异促进改进
            pc = self.m_pcMax
            pm = self.m_pmMax
        return pc, pm

    def SoftmaxSelection(self, fitnesses):
        arr = np.array(fitnesses)
        expF = np.exp(arr - np.max(arr))
        probs = expF / np.sum(expF)
        idx = np.random.choice(len(self.m_population),
                               p=probs)
        return self.m_population[idx]`;

const CODE_A2_REPAIR = `    def RepairPath(self, path):
        repaired = list(path)
        for _ in range(10):  # 最多迭代10轮修复
            invalidIndices = []
            for i, point in enumerate(repaired):
                y, x = point
                if not (0<=y<self.m_grid.shape[0] and
                        0<=x<self.m_grid.shape[1]):
                    invalidIndices.append(i)
                elif self.m_grid[y,x] == 0:
                    invalidIndices.append(i)
            if not invalidIndices and \\
               self.CheckPathConnectivity(repaired):
                break
            for idx in sorted(invalidIndices, reverse=True):
                if idx == 0 or idx == len(repaired)-1:
                    continue
                prev = repaired[max(0, idx-1)]
                nxt = repaired[min(len(repaired)-1, idx+1)]
                # 优先A*重连
                reconn = self.m_astar.Plan(prev, nxt)
                if reconn and len(reconn) > 2:
                    repaired = repaired[:max(0,idx-1)+1] \\
                        + reconn[1:-1] \\
                        + repaired[min(len(repaired)-1,idx+1):]
                    continue
                # 备选：邻域替代点搜索
                sub = self.FindSubstitutePoint(
                    repaired[idx], prev, nxt)
                if sub:
                    repaired[idx] = sub
                elif CheckLineOfSight(self.m_grid, prev, nxt):
                    repaired.pop(idx)
        return repaired`;

const CODE_A2_EVOLVE = `    def Evolve(self):
        self.InitializePopulation()
        fitnesses = [self.CalculateFitness(p)
                     for p in self.m_population]
        bestIdx = int(np.argmax(fitnesses))
        bestPath = copy.deepcopy(
            self.m_population[bestIdx])
        bestFit = fitnesses[bestIdx]
        for gen in range(1, self.m_maxGen + 1):
            fAvg = np.mean(fitnesses)
            fMax = np.max(fitnesses)
            eliteCount = max(1,
                int(self.m_eliteRatio * self.m_popSize))
            sortedIdx = np.argsort(fitnesses)[::-1]
            newPop = [copy.deepcopy(
                self.m_population[i])
                for i in sortedIdx[:eliteCount]]
            while len(newPop) < self.m_popSize:
                p1 = self.SoftmaxSelection(fitnesses)
                p2 = self.SoftmaxSelection(fitnesses)
                f1 = self.CalculateFitness(p1)
                pc, pm = self.GetAdaptiveRates(
                    f1, fAvg, fMax)
                child = self.Crossover(p1, p2) \\
                    if random.random() < pc \\
                    else copy.deepcopy(p1)
                if random.random() < pm:
                    child = self.Mutate(child)
                child = self.RepairPath(child)
                newPop.append(child)
            self.m_population = newPop
            fitnesses = [self.CalculateFitness(p)
                         for p in self.m_population]
            currBest = int(np.argmax(fitnesses))
            if fitnesses[currBest] > bestFit:
                bestFit = fitnesses[currBest]
                bestPath = copy.deepcopy(
                    self.m_population[currBest])
        return bestPath`;

const CODE_B1 = `def CheckLineOfSight(grid, p1, p2):
    if grid[p1[0],p1[1]] == 0 or grid[p2[0],p2[1]] == 0:
        return False
    y1, x1 = p1
    y2, x2 = p2
    isSteep = abs(y2-y1) > abs(x2-x1)
    if isSteep:
        x1, y1 = y1, x1
        x2, y2 = y2, x2
    if x1 > x2:
        x1, x2 = x2, x1
        y1, y2 = y2, y1
    dx = x2 - x1
    dy = abs(y2 - y1)
    err = int(dx / 2.0)
    ystep = 1 if y1 < y2 else -1
    y = y1
    for x in range(x1, x2 + 1):
        cY, cX = (x,y) if isSteep else (y,x)
        if grid[cY, cX] == 0:
            return False
        err -= dy
        if err < 0:
            y += ystep
            err += dx
    return True`;

const CODE_B2 = `def CalculatePathMetrics(path):
    if not path or len(path) < 2:
        return 0.0, 0.0
    arr = np.array(path)
    diffs = np.diff(arr, axis=0)
    distances = np.sqrt(np.sum(diffs**2, axis=1))
    L = float(np.sum(distances))
    S = 0.0
    if len(arr) > 2:
        vecDiffs = np.diff(diffs, axis=0)
        S = float(np.sum(
            np.sqrt(np.sum(vecDiffs**2, axis=1))))
    return L, S`;

const CODE_B3 = `class MapLoader:
    def __init__(self, filepath):
        self.m_filepath = filepath
        self.m_grid = None
        self.m_width = self.m_height = 0
        self.m_rho = 0.0
        self.m_alpha = 1.0

    def Load(self):
        with open(self.m_filepath, "rb") as f:
            headerData = f.read(4)
            self.m_height, self.m_width = \\
                struct.unpack(">HH", headerData)
            bodyData = f.read()
            rawGrid = np.frombuffer(bodyData,
                dtype=np.uint8).reshape(
                (self.m_height, self.m_width))
            self.m_grid = np.zeros(
                (self.m_height, self.m_width),
                dtype=np.int8)
            self.m_grid[rawGrid == 0] = 1
        total = self.m_width * self.m_height
        obs = total - int(np.sum(self.m_grid))
        self.m_rho = obs/total if total > 0 else 0
        self.m_alpha = 1.0 + (2.0*self.m_rho) \\
            / (1.0 + self.m_rho**2)
        return self.m_grid, self.m_alpha`;

const FILE_TREE = `GraduateWork/
├── main.py                  # 主程序入口
├── algorithm.md             # 算法设计文档
├── data/
│   └── map.bytes            # 栅格地图数据
├── path/
│   ├── improved_astar.py    # 改进A*算法
│   ├── standard_astar.py    # 标准A*算法
│   ├── dijkstra.py          # Dijkstra算法
│   ├── jps.py               # JPS算法
│   └── genetic.py           # 自适应遗传算法
├── utils/
│   ├── geometry.py           # 几何工具函数
│   ├── maploader.py          # 地图加载器
│   └── point_validator.py    # 点位验证器
└── tests/
    ├── phase1/run.py         # 基础算法对比
    ├── phase2/run.py         # GA融合验证
    ├── phase3/run.py         # 融合方案对比
    ├── phase4/run.py         # JPS与融合对比
    └── phase5/run.py         # 两种融合对比`;

// ─── Build document sections ───────────────────────────────────────────────

const children = [];

// ═══════════════════════════════════════════════════════════════════════════
// 附录A
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH1("附录A 核心算法源代码"));

// A.1
children.push(createH2("A.1 改进A*算法（improved_astar.py）"));
children.push(
  createBodyParagraph(
    "以下为基于障碍物密度动态权重的改进A*算法完整实现。核心改进在于 CalculateAlphaFromGrid 方法自动计算 $\\alpha(\\rho)$，以及 Plan 方法中支持通过 targetAlpha 参数指定不同权重值，为遗传算法种群初始化提供多样化路径。"
  )
);
children.push(...createCodeBlock(CODE_A1));

// A.2
children.push(createH2("A.2 自适应遗传算法核心方法（genetic.py）"));
children.push(
  createBodyParagraph(
    "以下为自适应遗传算法的核心方法，包括种群初始化、适应度计算、自适应交叉变异率、Softmax选择算子和进化主循环。"
  )
);

children.push(createBoldSubHeader("种群初始化与适应度函数："));
children.push(...createCodeBlock(CODE_A2_INIT));

children.push(createBoldSubHeader("自适应交叉变异率："));
children.push(...createCodeBlock(CODE_A2_ADAPTIVE));

children.push(createBoldSubHeader("路径修复机制（A*重连优先）："));
children.push(...createCodeBlock(CODE_A2_REPAIR));

children.push(createBoldSubHeader("进化主循环："));
children.push(...createCodeBlock(CODE_A2_EVOLVE));

// ═══════════════════════════════════════════════════════════════════════════
// 附录B
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH1("附录B 工具函数源代码"));

// B.1
children.push(createH2("B.1 Bresenham视线检测（geometry.py）"));
children.push(
  createBodyParagraph(
    "视线检测函数用于判断两点之间是否存在无碰撞通路，是路径有效性验证和路径修复的基础。采用Bresenham直线算法遍历两点间的所有栅格，若任一栅格为障碍物则返回False。"
  )
);
children.push(...createCodeBlock(CODE_B1));

// B.2
children.push(createH2("B.2 路径评价指标计算（geometry.py）"));
children.push(
  createBodyParagraph(
    "路径评价函数计算路径长度 $L$（相邻点欧氏距离之和）和平滑度 $S$（二阶差分范数之和），是适应度函数和实验评价体系的基础。"
  )
);
children.push(...createCodeBlock(CODE_B2));

// B.3
children.push(createH2("B.3 栅格地图加载（maploader.py）"));
children.push(
  createBodyParagraph(
    "地图加载器负责读取二进制栅格地图文件（map.bytes），解析大端序头信息获取地图尺寸，并自动计算障碍物密度 $\\rho$ 和初始动态权重 $\\alpha$。"
  )
);
children.push(...createCodeBlock(CODE_B3));

// ═══════════════════════════════════════════════════════════════════════════
// 附录C
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH1("附录C 实验配置与参数汇总"));

// C.1
children.push(createH2("C.1 实验环境配置"));
children.push(
  createBodyParagraph("本文实验所使用的软硬件环境配置如下表所示。")
);
children.push(createTableCaption("表C-1 实验环境配置"));
children.push(
  createTable(
    ["配置项", "详细信息"],
    [
      ["操作系统", "Windows 11"],
      ["编程语言", "Python 3.12"],
      ["依赖库", "NumPy 1.26, Matplotlib 3.8, Pandas 2.1"],
      ["实验地图", "1500×1500二维栅格（map.bytes）"],
      ["障碍物密度", "ρ = 0.1927"],
      ["动态权重", "α(ρ) = 1.3717"],
    ],
    { columnWidths: [30, 70] }
  )
);

// C.2
children.push(createH2("C.2 算法参数汇总"));
children.push(
  createBodyParagraph("各算法的参数设置如下表所示。")
);
children.push(createTableCaption("表C-2 算法参数设置"));
children.push(
  createTable(
    ["算法", "参数", "值"],
    [
      ["改进A*", "启发式权重 α", "1.3717（自动计算）"],
      ["改进A*", "启发式函数", "曼哈顿距离"],
      ["改进A*", "邻域模式", "8邻域"],
      ["自适应GA", "种群大小 Nₚ", "10"],
      ["自适应GA", "最大进化代数 N_gen", "20"],
      ["自适应GA", "精英保留比例 η", "0.1"],
      ["自适应GA", "交叉率范围 Pc", "[0.4, 0.9]"],
      ["自适应GA", "变异率范围 Pm", "[0.1, 0.5]"],
      ["自适应GA", "碰撞惩罚系数 χ", "1×10⁶"],
      ["自适应GA", "权重 ω₁/ω₂/ω₃", "1.0/1.0/1.0"],
      ["自适应GA", "α 初始化范围", "[1.0, 2.0]"],
    ],
    { columnWidths: [25, 35, 40] }
  )
);

// C.3
children.push(createH2("C.3 测试用例坐标"));
children.push(
  createBodyParagraph("五阶段实验所使用的测试用例起终点坐标如下表所示。")
);
children.push(createTableCaption("表C-3 测试用例坐标"));
children.push(
  createTable(
    ["用例", "类型", "起点(row, col)", "终点(row, col)"],
    [
      ["1", "短距离", "(375, 375)", "(497, 500)"],
      ["2", "中距离", "(300, 301)", "(1200, 1200)"],
      ["3", "长距离", "(412, 118)", "(1382, 1490)"],
    ],
    { columnWidths: [15, 20, 30, 35] }
  )
);

// ═══════════════════════════════════════════════════════════════════════════
// 附录D
// ═══════════════════════════════════════════════════════════════════════════
children.push(createH1("附录D 项目文件结构"));
children.push(
  createBodyParagraph(
    "本项目的完整文件结构如下所示，包含算法实现、工具函数、测试脚本和实验结果。"
  )
);
children.push(...createCodeBlock(FILE_TREE));

// ─── Create & save document ────────────────────────────────────────────────

const doc = new Document({
  ...STYLES,
  sections: [
    {
      ...PAGE_PROPERTIES,
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = require("path").join(__dirname, "附录.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("✅ 附录.docx generated successfully at:", outPath);
}).catch((err) => {
  console.error("❌ Error generating 附录.docx:", err);
  process.exit(1);
});
