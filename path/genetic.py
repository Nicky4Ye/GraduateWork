"""
自适应遗传算法：支持改进A*或JPS初始化种群，自适应Pc/Pm，精英保留，路径修复（A*重连优先）。
详见 algorithm.md。
"""
import numpy as np
import random
import copy
from path.improved_astar import ImprovedAStar
from path.jps import JPSPlanner
from utils.geometry import CheckLineOfSight, CalculatePathMetrics


class AdaptiveGA:
    def __init__(self, grid, baseAlpha, start, goal, pop_size=10, max_gen=20, elite_ratio=0.1, chi=1e6,
                 initial_solver="improved_astar"):
        self.m_grid = grid
        self.m_start = start
        self.m_goal = goal
        self.m_popSize = pop_size
        self.m_maxGen = max_gen
        self.m_eliteRatio = elite_ratio
        self.m_chi = chi
        self.m_population = []
        self.m_astar = ImprovedAStar(grid, baseAlpha)
        self.m_initialSolver = initial_solver
        if initial_solver == "jps":
            self.m_jps = JPSPlanner(grid, baseAlpha)
        else:
            self.m_jps = None
        self.m_pcMax, self.m_pcMin = 0.9, 0.4
        self.m_pmMax, self.m_pmMin = 0.5, 0.1
        self.m_w1 = 1.0
        self.m_w2 = 1.0
        self.m_w3 = 1.0

    def InitializePopulation(self):
        self.m_population = []
        attempts = 0
        maxAttempts = self.m_popSize * 10
        if self.m_initialSolver == "jps":
            while len(self.m_population) < self.m_popSize and attempts < maxAttempts:
                randomAlphaOffset = random.uniform(0.0, 1.0)
                path = self.m_jps.Plan(self.m_start, self.m_goal, randomAlphaOffset=randomAlphaOffset)
                if path:
                    if path[0] != self.m_start or path[-1] != self.m_goal:
                        path = self.EnsureStartGoal(path)
                    self.m_population.append(path)
                attempts += 1
        else:
            while len(self.m_population) < self.m_popSize and attempts < maxAttempts:
                targetAlpha = random.uniform(1.0, 2.0)
                path = self.m_astar.Plan(self.m_start, self.m_goal, targetAlpha=targetAlpha)
                if path:
                    if path[0] != self.m_start or path[-1] != self.m_goal:
                        path = self.EnsureStartGoal(path)
                    self.m_population.append(path)
                attempts += 1
        if self.m_population:
            while len(self.m_population) < self.m_popSize:
                basePath = copy.deepcopy(random.choice(self.m_population))
                self.m_population.append(basePath)
        else:
            raise RuntimeError("无法生成初始路径，请检查起点和终点是否可达")

    def EnsureStartGoal(self, path):
        if not path:
            return path
        if path[0] != self.m_start:
            path = [self.m_start] + path
        if path[-1] != self.m_goal:
            path = path + [self.m_goal]
        return path

    def CalculateFitness(self, path):
        if not path or len(path) < 2:
            return -self.m_chi
        L, S = CalculatePathMetrics(path)
        T = len(path)
        P = self.CalculateCollisionPenalty(path)
        cost = self.m_w1 * L + self.m_w2 * S + self.m_w3 * T + P
        return -cost

    def CalculateCollisionPenalty(self, path):
        penalty = 0.0
        for point in path:
            y, x = point
            if not (0 <= y < self.m_grid.shape[0] and 0 <= x < self.m_grid.shape[1]):
                penalty += self.m_chi
                continue
            if self.m_grid[y, x] == 0:
                penalty += self.m_chi
        for i in range(len(path) - 1):
            if not CheckLineOfSight(self.m_grid, path[i], path[i + 1]):
                penalty += self.m_chi
        return penalty

    def SoftmaxSelection(self, fitnesses):
        arr = np.array(fitnesses)
        expF = np.exp(arr - np.max(arr))
        probs = expF / np.sum(expF)
        idx = np.random.choice(len(self.m_population), p=probs)
        return self.m_population[idx]

    def GetAdaptiveRates(self, fVal, fAvg, fMax):
        delta = fMax - fAvg
        if delta < 1e-6:
            return self.m_pcMax, self.m_pmMax
        if fVal > fAvg:
            pc = self.m_pcMax - (self.m_pcMax - self.m_pcMin) * (fMax - fVal) / delta
            pm = self.m_pmMin + (self.m_pmMax - self.m_pmMin) * (fMax - fVal) / delta
        else:
            pc = self.m_pcMax
            pm = self.m_pmMax
        return pc, pm

    def RepairPath(self, path):
        if not path or len(path) < 2:
            return path
        repaired = list(path)
        for _ in range(10):
            invalidIndices = []
            for i, point in enumerate(repaired):
                y, x = point
                if not (0 <= y < self.m_grid.shape[0] and 0 <= x < self.m_grid.shape[1]):
                    invalidIndices.append(i)
                elif self.m_grid[y, x] == 0:
                    invalidIndices.append(i)
            if not invalidIndices and self.CheckPathConnectivity(repaired):
                break
            for invalidIdx in sorted(invalidIndices, reverse=True):
                if invalidIdx == 0 or invalidIdx == len(repaired) - 1:
                    continue
                prevIdx = max(0, invalidIdx - 1)
                nextIdx = min(len(repaired) - 1, invalidIdx + 1)
                prevPoint = repaired[prevIdx]
                nextPoint = repaired[nextIdx]
                reconnectPath = self.m_astar.Plan(prevPoint, nextPoint)
                if reconnectPath and len(reconnectPath) > 2:
                    repaired = repaired[: prevIdx + 1] + reconnectPath[1:-1] + repaired[nextIdx:]
                    continue
                substitute = self.FindSubstitutePoint(repaired[invalidIdx], prevPoint, nextPoint)
                if substitute:
                    repaired[invalidIdx] = substitute
                elif CheckLineOfSight(self.m_grid, prevPoint, nextPoint):
                    repaired.pop(invalidIdx)
        return repaired

    def CheckPathConnectivity(self, path):
        if len(path) < 2:
            return True
        for i in range(len(path) - 1):
            if not CheckLineOfSight(self.m_grid, path[i], path[i + 1]):
                return False
        return True

    def FindSubstitutePoint(self, invalidPoint, prevPoint, nextPoint, radius=5):
        yInv, xInv = invalidPoint
        bestPoint = None
        bestDist = float("inf")
        for dy in range(-radius, radius + 1):
            for dx in range(-radius, radius + 1):
                yCand = yInv + dy
                xCand = xInv + dx
                if not (0 <= yCand < self.m_grid.shape[0] and 0 <= xCand < self.m_grid.shape[1]):
                    continue
                if self.m_grid[yCand, xCand] == 0:
                    continue
                cand = (yCand, xCand)
                if CheckLineOfSight(self.m_grid, prevPoint, cand) and CheckLineOfSight(
                    self.m_grid, cand, nextPoint
                ):
                    dist = abs(dy) + abs(dx)
                    if dist < bestDist:
                        bestDist = dist
                        bestPoint = cand
        return bestPoint

    def Crossover(self, parent1, parent2):
        if len(parent1) < 3 or len(parent2) < 3:
            return parent1
        cut1 = random.randint(1, len(parent1) - 2)
        targetPoint = parent1[cut1]
        bestDist = float("inf")
        cut2 = -1
        for i in range(1, len(parent2) - 1):
            d = abs(parent2[i][0] - targetPoint[0]) + abs(parent2[i][1] - targetPoint[1])
            if d < bestDist:
                bestDist = d
                cut2 = i
        if cut2 == -1:
            return parent1
        child = parent1[:cut1] + parent2[cut2:]
        return self.RepairPath(child)

    def Mutate(self, path):
        if len(path) < 4:
            return path
        newPath = list(path)
        for _ in range(min(50, len(path) // 10)):
            startIdx = random.randint(0, len(newPath) - 3)
            for stride in [min(100, len(newPath) - startIdx - 1), min(50, len(newPath) - startIdx - 1),
                          min(20, len(newPath) - startIdx - 1), min(10, len(newPath) - startIdx - 1)]:
                if startIdx + stride >= len(newPath):
                    continue
                if CheckLineOfSight(self.m_grid, newPath[startIdx], newPath[startIdx + stride]):
                    newPath = newPath[: startIdx + 1] + newPath[startIdx + stride :]
                    break
        return self.RepairPath(newPath)

    def Evolve(self, track_initial=False):
        """
        执行 GA 进化。
        
        Args:
            track_initial: 是否记录初始种群的最优质量（用于对比）
        
        Returns:
            bestPath: 最优路径
            info: 额外信息字典（当 track_initial=True 时包含 initial_metrics 和 convergence_gen）
        """
        self.InitializePopulation()
        fitnesses = [self.CalculateFitness(p) for p in self.m_population]
        bestIdx = int(np.argmax(fitnesses))
        bestPath = copy.deepcopy(self.m_population[bestIdx])
        bestFit = fitnesses[bestIdx]
        L, S = CalculatePathMetrics(bestPath)
        
        # 记录初始质量
        initial_info = None
        if track_initial:
            initial_info = {
                'initial_length': L,
                'initial_smoothness': S,
                'initial_nodes': len(bestPath),
                'initial_fitness': bestFit
            }
        
        print(f"Gen 0: Best Fitness = {bestFit:.2f}, Len = {L:.2f}, Smooth = {S:.2f}, Nodes = {len(bestPath)}")
        
        # 收敛信息
        convergence_gen = 0
        prev_best_fit = bestFit
        no_improve_count = 0
        
        for gen in range(1, self.m_maxGen + 1):
            fAvg = np.mean(fitnesses)
            fMax = np.max(fitnesses)
            eliteCount = max(1, int(self.m_eliteRatio * self.m_popSize))
            sortedIndices = np.argsort(fitnesses)[::-1]
            newPopulation = [copy.deepcopy(self.m_population[i]) for i in sortedIndices[:eliteCount]]
            while len(newPopulation) < self.m_popSize:
                parent1 = self.SoftmaxSelection(fitnesses)
                parent2 = self.SoftmaxSelection(fitnesses)
                f1 = self.CalculateFitness(parent1)
                pc, pm = self.GetAdaptiveRates(f1, fAvg, fMax)
                child = self.Crossover(parent1, parent2) if random.random() < pc else copy.deepcopy(parent1)
                if random.random() < pm:
                    child = self.Mutate(child)
                child = self.RepairPath(child)
                child = self.EnsureStartGoal(child)
                newPopulation.append(child)
            self.m_population = newPopulation
            fitnesses = [self.CalculateFitness(p) for p in self.m_population]
            currBestIdx = int(np.argmax(fitnesses))
            if fitnesses[currBestIdx] > bestFit:
                bestFit = fitnesses[currBestIdx]
                bestPath = copy.deepcopy(self.m_population[currBestIdx])
                # 记录收敛代数（有改进就重置）
                no_improve_count = 0
                convergence_gen = gen
            else:
                no_improve_count += 1
            L, S = CalculatePathMetrics(bestPath)
            print(f"Gen {gen}: Best Fitness = {bestFit:.2f}, Len = {L:.2f}, Smooth = {S:.2f}, "
                  f"Nodes = {len(bestPath)}, f_avg = {fAvg:.2f}, f_max = {fMax:.2f}")
        
        # 构建返回信息
        info = {}
        if track_initial and initial_info:
            info['initial_metrics'] = initial_info
            info['convergence_gen'] = convergence_gen
            info['no_improve_count'] = no_improve_count
        
        return bestPath, info
