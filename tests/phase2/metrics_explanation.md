# Phase 2 新增指标说明

## 背景

在对比 Standard A* + GA 和 Improved A* + GA 两种融合方案时，仅比较最终结果可能无法充分反映差异。由于 GA 的强大优化能力（特别是路径修复机制），两种方案的最终结果往往趋于相似。

为了更好地理解两种初始化的差异，我们增加了以下四个新指标：

## 新增指标

### 1. **initial_length** - 初始路径长度
- **定义**: GA 进化前（Gen 0）初始种群中最优个体的路径长度
- **意义**: 反映不同初始化方法提供的起点质量
- **预期**: Improved A* 初始化的 initial_length 应该更短（因为改进 A*考虑了障碍物密度）

### 2. **initial_smoothness** - 初始路径平滑度
- **定义**: GA 进化前初始种群中最优个体的路径平滑度（二阶差分范数之和）
- **意义**: 反映初始路径的平滑程度
- **预期**: 两种方案的差异可能不大，因为都使用相同的平滑度计算方式

### 3. **convergence_gen** - 收敛代数
- **定义**: 达到全局最优解时的代数（最后一次有改进的代数）
- **意义**: 反映算法找到最优解的速度
- **预期**: 
  - 如果 Improved A* 初始化更好，可能收敛更早
  - 如果两者相差不大，说明初始质量对收敛速度影响有限

### 4. **no_improve_count** - 未改进代数
- **定义**: 从最后一次改进到进化结束的连续未改进代数
- **意义**: 反映算法后期的搜索停滞情况
- **预期**: 
  - 较大的 no_improve_count 表示算法早熟收敛或已找到全局最优
  - 如果两种方案的 no_improve_count 相近，说明 GA 的最终搜索状态相似

## 使用方法

运行 Phase 2 测试后，查看生成的 `result/phase2_results.csv` 文件，将包含以上四个新列。

示例输出：
```csv
start,goal,algorithm,time,length,smoothness,turns,nodes,valid,rho,alpha,initial_length,initial_smoothness,initial_nodes,convergence_gen,no_improve_count
"(125, 375)","(500, 500)","Standard A* + GA",2.5,850.5,125.3,15,45,True,0.35,1.5,920.8,145.2,52,12,8
"(125, 375)","(500, 500)","Improved A* + GA",2.3,848.2,123.8,14,44,True,0.35,1.5,865.3,138.5,48,10,10
```

## 分析建议

### 1. 初始质量对比
计算初始质量的提升比例：
```
initial_length_improvement = (initial_length_std - initial_length_imp) / initial_length_std * 100%
```

### 2. 收敛速度对比
比较收敛代数：
```
convergence_speedup = (convergence_gen_std - convergence_gen_imp) / convergence_gen_std * 100%
```

### 3. GA 优化效果
计算 GA 的优化幅度：
```
length_optimization_std = (initial_length_std - final_length_std) / initial_length_std * 100%
length_optimization_imp = (initial_length_imp - final_length_imp) / initial_length_imp * 100%
```

### 4. 停滞期分析
比较未改进代数占比：
```
stagnation_ratio_std = no_improve_count_std / max_gen * 100%
stagnation_ratio_imp = no_improve_count_imp / max_gen * 100%
```

## 预期发现

基于之前的观察，我们可能发现：

1. **Initial nodes**: Improved A* 初始化的路径节点数略少（5-15%）
2. **Convergence gen**: 两者相差不大（±2 代内）
3. **No improve count**: 两者相近（都在 8-12 代左右开始停滞）
4. **GA optimization**: GA 对 Standard A* 的优化幅度更大（因为初始质量较差）

## 进一步研究

如果这些指标仍不能充分区分两种方案，可以考虑：

1. **减少最大代数**（如从 20 降到 10）- 放大初始质量的影响
2. **增加测试用例数量** - 提高统计显著性
3. **可视化收敛曲线** - 绘制每代的最优适应度变化
4. **分析路径几何特征** - 不仅是长度和平滑度，还可以考虑其他特征

## 代码修改说明

### genetic.py
- `Evolve()` 方法新增 `track_initial` 参数
- 返回类型改为 `(bestPath, info)` 元组
- `info` 字典包含 `initial_metrics`、`convergence_gen`、`no_improve_count`

### phase2/run.py
- 调用 `Evolve(track_initial=True)` 启用跟踪
- 提取并记录所有新指标到 CSV
- 控制台输出关键对比信息

### phase2/README.md
- 更新 CSV 列说明，添加四个新指标的解释
