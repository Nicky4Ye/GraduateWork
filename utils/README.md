# utils 工具目录

- **maploader.py**：栅格地图加载（map.bytes），计算障碍物密度 ρ 与动态权重 α。`MapLoader(filepath).Load()` 返回 `(grid, alpha)`。
- **geometry.py**：Bresenham 视线检测 `CheckLineOfSight(grid, p1, p2)`，路径长度与平滑度 `CalculatePathMetrics(path)`。
- **point_validator.py**：起终点验证与修复 `ValidateAndFixPoints(grid, start, goal, ...)`，连通性检查 `CheckConnectivity(grid, start, goal)`。
