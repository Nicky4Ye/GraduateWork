"""
标准A*：固定权重 α=1，曼哈顿距离启发式，用于对比实验。
"""
import heapq
import numpy as np

COST_CARDINAL = 1.0
COST_DIAG = np.sqrt(2)


class StandardAStar:
    def __init__(self, grid):
        self.m_grid = np.asarray(grid)
        self.m_height, self.m_width = self.m_grid.shape

    def Heuristic(self, a, b):
        return abs(a[0] - b[0]) + abs(a[1] - b[1])

    def Plan(self, start, goal):
        gScore = np.full((self.m_height, self.m_width), np.inf)
        gScore[start] = 0
        startF = self.Heuristic(start, goal)
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
                    hVal = self.Heuristic((nr, nc), goal)
                    newF = newG + hVal
                    cameFrom[(nr, nc)] = current
                    heapq.heappush(openList, (newF, newG, (nr, nc)))

        return None
