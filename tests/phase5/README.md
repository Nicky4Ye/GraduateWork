# Phase5：融合 JPS+GA 与融合 A*+GA 对比

本阶段对比 **Fusion (JPS + GA)** 与 **Fusion (Improved A* + GA)** 两种融合方案。测试为三个用例，与 Phase1 起终点一致（短、中、长距离）。

## 内容说明

- Fusion (JPS + GA)：JPS 生成初始路径，自适应 GA 进化优化。
- Fusion (Improved A* + GA)：改进 A* 生成初始路径，自适应 GA 进化优化。
- 输出两种融合方案的路径长度、平滑度、结点数、耗时等方面的差异。

## 运行

在项目根目录执行：

```bash
python tests/phase5/run.py
```

## 输出

- `result/phase5_results.csv`：各用例下两种融合方案的 time、length、smoothness、turns、nodes、valid、rho。
- `result/phase5_case1.png`、`phase5_case2.png`、`phase5_case3.png`：每个用例下两种融合方案的路径对比图。

## CSV 列说明（phase5_results.csv）

| 列名 | 含义 |
|------|------|
| start | 起点坐标 (y, x)，验证/修复后的可行点。 |
| goal | 终点坐标 (y, x)，验证/修复后的可行点。 |
| algorithm | 融合方案名称：Fusion (JPS + GA)、Fusion (Improved A* + GA)。 |
| time | 单次融合算法耗时（秒）。 |
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

## 扩展说明

算法对比与 map.bytes 验证意义的详细分析见项目根目录 `docs/phase5_analysis.md`。
