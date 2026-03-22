# Phase4：JPS 与融合方案对比

本阶段对比 **JPS** 与 **Fusion (Improved A* + GA)** 两种方案。测试为三个用例，与 Phase1 起终点一致（短、中、长距离）。

## 内容说明

- JPS：Jump Point Search 算法，快速路径搜索。
- Fusion (Improved A* + GA)：改进 A* 生成初始路径，自适应 GA 进化优化。
- 输出两种方案的路径长度、平滑度、转折数、结点数、耗时等指标及路径对比图。

## 运行

在项目根目录执行：

```bash
python tests/phase4/run.py
```

## 输出

- `result/phase4_results.csv`：各用例下两种方案的 time、length、smoothness、turns、nodes、valid、rho。
- `result/phase4_case1.png`、`phase4_case2.png`、`phase4_case3.png`：每个用例下两种方案的路径对比图。

## CSV 列说明（phase4_results.csv）

| 列名 | 含义 |
|------|------|
| start | 起点坐标 (y, x)，验证/修复后的可行点。 |
| goal | 终点坐标 (y, x)，验证/修复后的可行点。 |
| algorithm | 方案名称：JPS、Fusion (Improved A* + GA)。 |
| time | 单次规划/融合耗时（秒）。 |
| length | 路径几何长度 L。 |
| smoothness | 路径平滑度 S。 |
| turns | 转折点数。 |
| nodes | 路径结点数。 |
| valid | 路径是否有效。 |
| rho | 地图障碍物密度 ρ。 |
| **initial_length** | **GA 进化前初始种群的最优路径长度**。 |
| **initial_smoothness** | **GA 进化前初始种群的最优路径平滑度**。 |
| **initial_nodes** | **GA 进化前初始种群的最优路径结点数**。 |
| **convergence_gen** | **达到最优解时的代数（收敛代数）**。 |
| **no_improve_count** | **连续未改进的代数（反映后期停滞情况）**。 |

## 依赖

- path: improved_astar, jps, genetic
- utils: maploader, geometry, point_validator
