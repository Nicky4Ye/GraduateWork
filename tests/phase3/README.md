# Phase3：融合方案与多算法对比

本阶段运行 **融合方案（Improved A* + 自适应 GA）**，并与 **Improved A***、**Dijkstra** 对比。

## 内容说明

- 在同一地图与起终点下运行三种方法，输出各算法的指标与路径对比图。
- 融合方案为改进 A* 生成初始路径，经自适应 GA 优化后得到最终路径。
- 本阶段重点展示融合算法相对于传统算法的优势。

## 运行

在项目根目录执行：

```bash
python tests/phase3/run.py
```

## 输出

- `result/phase3_results.csv`：各场景下各算法（含 Fusion）的起点、终点及指标。
- `result/phase3_<场景名>.png`：各场景下三种方法的路径对比图。

## CSV 列说明（phase3_results.csv）

| 列名 | 含义 |
|------|------|
| start | 起点坐标 (y, x)，验证/修复后的可行点。 |
| goal | 终点坐标 (y, x)，验证/修复后的可行点。 |
| algorithm | 算法名称：Improved A*、Dijkstra、Fusion (Improved A* + GA)。 |
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

- path: improved_astar, dijkstra, genetic
- utils: maploader, geometry, point_validator
