"""
Dijkstra：无启发式最短路径，用于对比实验。
"""
import heapq
import numpy as np

COST_CARDINAL = 1.0
COST_DIAG = np.sqrt(2)


class Dijkstra:
    def __init__(self, grid):
        self.m_grid = np.asarray(grid)
        self.m_height, self.m_width = self.m_grid.shape

    def Plan(self, start, goal):
        dist = np.full((self.m_height, self.m_width), np.inf)
        dist[start] = 0
        pq = [(0, start)]
        cameFrom = {}
        visited = np.zeros((self.m_height, self.m_width), dtype=bool)
        neighbors = [
            (0, 1, COST_CARDINAL), (0, -1, COST_CARDINAL), (1, 0, COST_CARDINAL), (-1, 0, COST_CARDINAL),
            (1, 1, COST_DIAG), (1, -1, COST_DIAG), (-1, 1, COST_DIAG), (-1, -1, COST_DIAG),
        ]
        while pq:
            currentDist, current = heapq.heappop(pq)
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
                newDist = currentDist + cost
                if newDist < dist[nr, nc]:
                    dist[nr, nc] = newDist
                    cameFrom[(nr, nc)] = current
                    heapq.heappush(pq, (newDist, (nr, nc)))
        return None
