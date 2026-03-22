# Phase2：遗传算法融合对比

本阶段对比 **Standard A* + GA** 与 **Improved A* + GA** 两种融合方案。测试为三个用例，与 Phase1 起终点一致（短、中、长距离）。

## 内容说明

- Standard A* + GA：普通A* 生成初始路径，自适应 GA 进化优化。
- Improved A* + GA：改进 A* 生成初始路径，自适应 GA 进化优化。
- 输出每种融合方案的路径长度、平滑度、转折数、有效性及收敛过程。

## 运行

在项目根目录执行：

```bash
python tests/phase2/run.py
```

## 输出

- `result/phase2_results.csv`：各用例的指标（见下表列说明）。
- `result/phase2_case1.png`、`phase2_case2.png`、`phase2_case3.png`：每个用例的两种融合方案路径对比图。

## CSV 列说明（phase2_results.csv）

| 列名 | 含义 |
|------|------|
| start | 起点坐标 (y, x)，验证/修复后的可行点。 |
| goal | 终点坐标 (y, x)，验证/修复后的可行点。 |
| algorithm | 融合方案名称：Standard A* + GA、Improved A* + GA。 |
| time | 单次 GA 进化耗时（秒）。 |
| length | 最终路径几何长度 L：相邻路径点欧氏距离之和。 |
| smoothness | 最终路径平滑度 S：二阶差分范数之和（转角变化量）。 |
| turns | 转折点数：相邻段夹角大于 30° 的路径点个数。 |
| nodes | 最终路径结点数（格点数）。 |
| valid | 路径是否有效：相邻点间均无碰撞为 True。 |
| rho | 地图障碍物密度 ρ。 |
| alpha | 改进 A* 动态权重 α(ρ)，用于 GA 初始种群生成。 |
| **initial_length** | **GA 进化前初始种群的最优路径长度**。 |
| **initial_smoothness** | **GA 进化前初始种群的最优路径平滑度**。 |
| **initial_nodes** | **GA 进化前初始种群的最优路径结点数**。 |
| **convergence_gen** | **达到最优解时的代数（收敛代数）**。 |
| **no_improve_count** | **连续未改进的代数（反映后期停滞情况）**。 |

## 依赖

- path: standard_astar, improved_astar, genetic
- utils: maploader, geometry, point_validator
