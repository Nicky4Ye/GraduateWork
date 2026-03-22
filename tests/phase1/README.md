# Phase1：A* 与路径算法对比

本阶段对比 **Standard A***、**Improved A***、**Dijkstra** 三种基础路径规划算法。测试为三个用例，分别覆盖短、中、长距离起终点。

## 内容说明

- 对比 A* 与改进 A*（基于障碍物密度 α(ρ) 的动态权重）。
- 与 Dijkstra 在同一地图与起终点下输出指标与路径图。
- 本阶段不包含 JPS 和遗传算法。

## 运行

在项目根目录执行：

```bash
python tests/phase1/run.py
```

## 输出

- `result/phase1_results.csv`：各场景、各算法的指标（见下表列说明）。
- `result/phase1_case1.png`、`phase1_case2.png`、`phase1_case3.png`：三个用例下三种算法的路径对比图。

## CSV 列说明（phase1_results.csv）

| 列名 | 含义 |
|------|------|
| start | 起点坐标 (y, x)，验证/修复后的可行点。 |
| goal | 终点坐标 (y, x)，验证/修复后的可行点。 |
| algorithm | 算法名称：Standard A*、Improved A*、Dijkstra。 |
| time | 单次规划耗时（秒）。 |
| length | 路径几何长度 L：相邻路径点欧氏距离之和。 |
| smoothness | 路径平滑度 S：二阶差分范数之和（转角变化量）。 |
| turns | 转折点数：相邻段夹角大于 30° 的路径点个数。 |
| nodes | 路径结点数：A* / 改进 A* / Dijkstra 为路径格点数。 |
| valid | 路径是否有效：相邻点间均无碰撞为 True。 |
| rho | 地图障碍物密度 ρ。 |

## 依赖

- path: standard_astar, improved_astar, dijkstra
- utils: maploader, geometry, point_validator
