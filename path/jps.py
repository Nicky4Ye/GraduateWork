"""
JPS (Jump Point Search)：跳点搜索，仅扩展跳点；路径仅含跳点，结点数最少。
参考 jps.cpp，8 邻域使用 octile 启发式与代价以保证最优。
"""
import heapq
import math
import numpy as np

COST_CARDINAL = 1.0
COST_DIAG = np.sqrt(2)


def OctileCost(dr, dc):
    dr, dc = abs(dr), abs(dc)
    return COST_DIAG * min(dr, dc) + COST_CARDINAL * abs(dr - dc)


def OctileHeuristic(node, goal, alpha=1.0):
    dr = abs(node[0] - goal[0])
    dc = abs(node[1] - goal[1])
    return alpha * (COST_DIAG * min(dr, dc) + COST_CARDINAL * abs(dr - dc))


class JPSPlanner:
    def __init__(self, grid, baseAlpha=1.0):
        self.m_grid = np.asarray(grid)
        self.m_height, self.m_width = self.m_grid.shape
        self.m_baseAlpha = baseAlpha
        self.m_motions = [
            (-1, 0), (1, 0), (0, -1), (0, 1),
            (-1, -1), (-1, 1), (1, -1), (1, 1),
        ]

    def Heuristic(self, node, goal, alpha):
        return OctileHeuristic(node, goal, alpha)

    def IsPassable(self, r, c):
        return 0 <= r < self.m_height and 0 <= c < self.m_width and self.m_grid[r, c] == 1

    def GetForcedNeighbors(self, p, parent):
        neighbors = []
        if parent is None:
            for dy, dx in self.m_motions:
                if self.IsPassable(p[0] + dy, p[1] + dx):
                    neighbors.append((dy, dx))
            return neighbors
        dy = int(np.sign(p[0] - parent[0]))
        dx = int(np.sign(p[1] - parent[1]))
        if dy != 0 and dx != 0:
            if self.IsPassable(p[0] + dy, p[1] + dx):
                neighbors.append((dy, dx))
            if self.IsPassable(p[0] + dy, p[1]):
                neighbors.append((dy, 0))
            if self.IsPassable(p[0], p[1] + dx):
                neighbors.append((0, dx))
            if not self.IsPassable(p[0] - dy, p[1]) and self.IsPassable(p[0] - dy, p[1] + dx):
                neighbors.append((-dy, dx))
            if not self.IsPassable(p[0], p[1] - dx) and self.IsPassable(p[0] + dy, p[1] - dx):
                neighbors.append((dy, -dx))
        else:
            if dy == 0:
                if self.IsPassable(p[0], p[1] + dx):
                    neighbors.append((0, dx))
                if not self.IsPassable(p[0] - 1, p[1]) and self.IsPassable(p[0] - 1, p[1] + dx):
                    neighbors.append((-1, dx))
                if not self.IsPassable(p[0] + 1, p[1]) and self.IsPassable(p[0] + 1, p[1] + dx):
                    neighbors.append((1, dx))
            else:
                if self.IsPassable(p[0] + dy, p[1]):
                    neighbors.append((dy, 0))
                if not self.IsPassable(p[0], p[1] - 1) and self.IsPassable(p[0] + dy, p[1] - 1):
                    neighbors.append((dy, -1))
                if not self.IsPassable(p[0], p[1] + 1) and self.IsPassable(p[0] + dy, p[1] + 1):
                    neighbors.append((dy, 1))
        return neighbors

    def Jump(self, p, direction, goal):
        dy, dx = direction
        curr = [p[0], p[1]]
        while True:
            curr[0] += dy
            curr[1] += dx
            if not self.IsPassable(curr[0], curr[1]):
                return None
            if (curr[0], curr[1]) == goal:
                return (curr[0], curr[1])
            if dy != 0 and dx != 0:
                if (not self.IsPassable(curr[0] - dy, curr[1]) and self.IsPassable(curr[0] - dy, curr[1] + dx)) or \
                   (not self.IsPassable(curr[0], curr[1] - dx) and self.IsPassable(curr[0] + dy, curr[1] - dx)):
                    return (curr[0], curr[1])
                if self.JumpStraightHasGoal((curr[0], curr[1]), (dy, 0), goal) or \
                   self.JumpStraightHasGoal((curr[0], curr[1]), (0, dx), goal):
                    return (curr[0], curr[1])
            else:
                if dy == 0:
                    if (not self.IsPassable(curr[0] - 1, curr[1]) and self.IsPassable(curr[0] - 1, curr[1] + dx)) or \
                       (not self.IsPassable(curr[0] + 1, curr[1]) and self.IsPassable(curr[0] + 1, curr[1] + dx)):
                        return (curr[0], curr[1])
                else:
                    if (not self.IsPassable(curr[0], curr[1] - 1) and self.IsPassable(curr[0] + dy, curr[1] - 1)) or \
                       (not self.IsPassable(curr[0], curr[1] + 1) and self.IsPassable(curr[0] + dy, curr[1] + 1)):
                        return (curr[0], curr[1])

    def JumpStraightHasGoal(self, p, direction, goal):
        dy, dx = direction
        curr = [p[0], p[1]]
        while True:
            curr[0] += dy
            curr[1] += dx
            if not self.IsPassable(curr[0], curr[1]):
                return False
            if (curr[0], curr[1]) == goal:
                return True
            if dy == 0:
                if (not self.IsPassable(curr[0] - 1, curr[1]) and self.IsPassable(curr[0] - 1, curr[1] + dx)) or \
                   (not self.IsPassable(curr[0] + 1, curr[1]) and self.IsPassable(curr[0] + 1, curr[1] + dx)):
                    return True
            else:
                if (not self.IsPassable(curr[0], curr[1] - 1) and self.IsPassable(curr[0] + dy, curr[1] - 1)) or \
                   (not self.IsPassable(curr[0], curr[1] + 1) and self.IsPassable(curr[0] + dy, curr[1] + 1)):
                    return True

    def Plan(self, start, goal, randomAlphaOffset=0.0):
        currentAlpha = self.m_baseAlpha + randomAlphaOffset
        pq = []
        heapq.heappush(pq, (0, 0, start, None))
        cameFrom = {}
        gScore = {start: 0}
        closedSet = set()
        while pq:
            f, g, curr, parent = heapq.heappop(pq)
            if curr in closedSet:
                continue
            closedSet.add(curr)
            cameFrom[curr] = parent
            if curr == goal:
                return self.ReconstructPath(cameFrom, curr)
            for direction in self.GetForcedNeighbors(curr, parent):
                jumpPoint = self.Jump(curr, direction, goal)
                if jumpPoint:
                    dr = jumpPoint[0] - curr[0]
                    dc = jumpPoint[1] - curr[1]
                    dist = OctileCost(dr, dc)
                    newG = g + dist
                    if jumpPoint not in gScore or newG < gScore[jumpPoint]:
                        gScore[jumpPoint] = newG
                        h = self.Heuristic(jumpPoint, goal, currentAlpha)
                        heapq.heappush(pq, (newG + h, newG, jumpPoint, curr))
        return None

    def ReconstructPath(self, cameFrom, current):
        path = [current]
        while current in cameFrom:
            parent = cameFrom[current]
            if parent is None:
                break
            path.append(parent)
            current = parent
        return path[::-1]

    def GetDensePath(self, waypointPath):
        if not waypointPath or len(waypointPath) < 2:
            return list(waypointPath) if waypointPath else []
        dense = [waypointPath[0]]
        for i in range(1, len(waypointPath)):
            self.FillLine(dense, waypointPath[i], waypointPath[i - 1])
            dense.append(waypointPath[i])
        return dense

    def FillLine(self, path, p1, p2):
        steps = max(abs(p1[0] - p2[0]), abs(p1[1] - p2[1]))
        if steps == 0:
            return
        for i in range(1, steps):
            r = int(p2[0] + (p1[0] - p2[0]) * i / steps)
            c = int(p2[1] + (p1[1] - p2[1]) * i / steps)
            path.append((r, c))
