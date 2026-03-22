"""
栅格几何：Bresenham 视线检测，路径长度与平滑度。
"""
import numpy as np


def CheckLineOfSight(grid, p1, p2):
    if grid[p1[0], p1[1]] == 0 or grid[p2[0], p2[1]] == 0:
        return False
    y1, x1 = p1
    y2, x2 = p2
    isSteep = abs(y2 - y1) > abs(x2 - x1)
    if isSteep:
        x1, y1 = y1, x1
        x2, y2 = y2, x2
    if x1 > x2:
        x1, x2 = x2, x1
        y1, y2 = y2, y1
    dx = x2 - x1
    dy = abs(y2 - y1)
    err = int(dx / 2.0)
    ystep = 1 if y1 < y2 else -1
    y = y1
    for x in range(x1, x2 + 1):
        coordY, coordX = (x, y) if isSteep else (y, x)
        if grid[coordY, coordX] == 0:
            return False
        err -= dy
        if err < 0:
            y += ystep
            err += dx
    return True


def CalculatePathMetrics(path):
    if not path or len(path) < 2:
        return 0.0, 0.0
    arr = np.array(path)
    diffs = np.diff(arr, axis=0)
    distances = np.sqrt(np.sum(diffs ** 2, axis=1))
    L = float(np.sum(distances))
    S = 0.0
    if len(arr) > 2:
        vecDiffs = np.diff(diffs, axis=0)
        S = float(np.sum(np.sqrt(np.sum(vecDiffs ** 2, axis=1))))
    return L, S
