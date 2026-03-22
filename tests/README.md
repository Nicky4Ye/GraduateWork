# 测试目录说明

测试按阶段划分为五个子目录，各阶段独立运行并输出到对应 `result/` 目录。

## 目录结构

| 目录       | 内容                         | 输出                     |
|------------|------------------------------|--------------------------|
| `phase1/`  | A* 与路径算法对比             | `phase1/result/`         |
| `phase2/`  | 遗传算法单独验证             | `phase2/result/`         |
| `phase3/`  | 融合方案与多算法对比         | `phase3/result/`         |
| `phase4/`  | JPS+GA 与改进 A*+GA 融合对比  | `phase4/result/`          |
| `phase5/`  | 融合 A*+自适应 GA 与 JPS 对比 | `phase5/result/`         |

## Phase1：A* 与路径算法对比

- **算法**：Standard A*、Improved A*、Dijkstra、JPS。
- **运行**：`python tests/phase1/run.py`
- **结果**：`phase1/result/phase1_results.csv`、`phase1_case1.png`、`phase1_case2.png`、`phase1_case3.png`。
- 详见 [phase1/README.md](phase1/README.md)。

## Phase2：遗传算法单独验证

- **算法**：自适应 GA。
- **运行**：`python tests/phase2/run.py`
- **结果**：`phase2/result/phase2_results.csv`、`phase2_case1.png`、`phase2_case2.png`、`phase2_case3.png`。
- 详见 [phase2/README.md](phase2/README.md)。

## Phase3：融合方案与多算法对比

- **算法**：Fusion（Improved A* + GA）、Standard A*、Improved A*、Dijkstra、JPS。
- **运行**：`python tests/phase3/run.py`
- **结果**：`phase3/result/phase3_results.csv`、`phase3_<场景名>.png`。
- 详见 [phase3/README.md](phase3/README.md)。

## Phase4：JPS+GA 与改进 A*+GA 融合对比

- **算法**：Fusion (Improved A* + GA)、Fusion (JPS + GA)。
- **运行**：`python tests/phase4/run.py`
- **结果**：`phase4/result/phase4_results.csv`、`phase4_case1.png`、`phase4_case2.png`、`phase4_case3.png`。
- 详见 [phase4/README.md](phase4/README.md)。

## Phase5：融合 A*+自适应 GA 与 JPS 对比

- **算法**：Fusion (Improved A* + GA)、JPS。
- **运行**：`python tests/phase5/run.py`
- **结果**：`phase5/result/phase5_results.csv`、`phase5_case1.png`、`phase5_case2.png`、`phase5_case3.png`。
- 详见 [phase5/README.md](phase5/README.md)。
