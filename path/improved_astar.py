"""
改进A*：基于障碍物密度的动态权重 α(ρ)，曼哈顿距离启发式。
f(n) = g(n) + α(ρ) * h(n)，详见 algorithm.md。
"""
import heapq
import numpy as np

COST_CARDINAL = 1.0
COST_DIAG = np.sqrt(2)


class ImprovedAStar:
    def __init__(self, grid, baseAlpha=None):
        self.m_grid = np.asarray(grid)
        self.m_height, self.m_width = self.m_grid.shape
        self.m_baseAlpha = self.CalculateAlphaFromGrid() if baseAlpha is None else baseAlpha

    def CalculateAlphaFromGrid(self):
        totalCells = self.m_height * self.m_width
        obstacleCount = totalCells - int(np.sum(self.m_grid))
        rho = obstacleCount / totalCells if totalCells > 0 else 0.0
        return 1.0 + (2.0 * rho) / (1.0 + rho * rho)

    def Heuristic(self, a, b, alpha):
        return alpha * (abs(a[0] - b[0]) + abs(a[1] - b[1]))

    def Plan(self, start, goal, randomAlphaOffset=0.0, targetAlpha=None):
        if targetAlpha is not None:
            currentAlpha = min(2.0, max(1.0, float(targetAlpha)))
        elif randomAlphaOffset > 0:
            currentAlpha = min(2.0, max(1.0, self.m_baseAlpha + randomAlphaOffset))
        else:
            currentAlpha = self.m_baseAlpha

        gScore = np.full((self.m_height, self.m_width), np.inf)
        gScore[start] = 0
        startF = self.Heuristic(start, goal, currentAlpha)
        openList = [(startF, 0, start)]
        cameFrom = {}
        visited = np.zeros((self.m_height, self.m_width), dtype=bool)

        neighbors = [
            (0, 1, COST_CARDINAL), (0, -1, COST_CARDINAL), (1, 0, COST_CARDINAL), (-1, 0, COST_CARDINAL),
            (1, 1, COST_DIAG), (1, -1, COST_DIAG), (-1, 1, COST_DIAG), (-1, -1, COST_DIAG),
        ]

        while openList:
            currentF, currentG, current = heapq.heappop(openList)
            if visited[current]:
                continue
            visited[current] = True

            if current == goal:
                path = [current]
                while current in cameFrom:
                    current = cameFrom[current]
                    path.append(current)
                return path[::-1]

            for dr, dc, cost in neighbors:
                nr, nc = current[0] + dr, current[1] + dc
                if not (0 <= nr < self.m_height and 0 <= nc < self.m_width):
                    continue
                if self.m_grid[nr, nc] != 1 or visited[nr, nc]:
                    continue
                newG = currentG + cost
                if newG < gScore[nr, nc]:
                    gScore[nr, nc] = newG
                    hVal = self.Heuristic((nr, nc), goal, currentAlpha)
                    newF = newG + hVal
                    cameFrom[(nr, nc)] = current
                    heapq.heappush(openList, (newF, newG, (nr, nc)))

        return None
