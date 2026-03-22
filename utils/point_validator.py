"""
起终点验证与修复：检查可行、BFS 最近可行点、连通性。
"""
from collections import deque


def IsValidPoint(grid, point):
    y, x = point
    h, w = grid.shape
    if not (0 <= y < h and 0 <= x < w):
        return False
    if grid[y, x] == 0:
        return False
    return True


def FindNearestValidPoint(grid, point, maxRadius=50):
    y, x = point
    h, w = grid.shape
    if IsValidPoint(grid, point):
        return point, True
    visited = set()
    queue = deque([(y, x, 0)])
    visited.add((y, x))
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)]
    while queue:
        cy, cx, dist = queue.popleft()
        if dist > maxRadius:
            break
        if 0 <= cy < h and 0 <= cx < w and grid[cy, cx] == 1:
            return (cy, cx), True
        for dy, dx in directions:
            ny, nx = cy + dy, cx + dx
            if (ny, nx) not in visited:
                visited.add((ny, nx))
                queue.append((ny, nx, dist + 1))
    return None, False


def ValidateAndFixPoints(grid, start, goal, autoFix=True, maxRadius=50):
    fixedStart = start
    fixedGoal = goal
    fixInfo = {
        "start_fixed": False,
        "goal_fixed": False,
        "start_message": "",
        "goal_message": "",
    }
    if not IsValidPoint(grid, start):
        if autoFix:
            fixedStart, found = FindNearestValidPoint(grid, start, maxRadius)
            if found:
                fixInfo["start_fixed"] = True
                fixInfo["start_message"] = f"Start {start} fixed to {fixedStart}"
            else:
                fixInfo["start_message"] = f"Start {start} unreachable (radius {maxRadius})"
                return None, None, fixInfo
        else:
            fixInfo["start_message"] = f"Start {start} unreachable"
            return None, None, fixInfo
    else:
        fixInfo["start_message"] = f"Start {start} valid"
    if not IsValidPoint(grid, goal):
        if autoFix:
            fixedGoal, found = FindNearestValidPoint(grid, goal, maxRadius)
            if found:
                fixInfo["goal_fixed"] = True
                fixInfo["goal_message"] = f"Goal {goal} fixed to {fixedGoal}"
            else:
                fixInfo["goal_message"] = f"Goal {goal} unreachable (radius {maxRadius})"
                return None, None, fixInfo
        else:
            fixInfo["goal_message"] = f"Goal {goal} unreachable"
            return None, None, fixInfo
    else:
        fixInfo["goal_message"] = f"Goal {goal} valid"
    return fixedStart, fixedGoal, fixInfo


def CheckConnectivity(grid, start, goal):
    if not IsValidPoint(grid, start) or not IsValidPoint(grid, goal):
        return False
    h, w = grid.shape
    visited = set()
    queue = deque([start])
    visited.add(start)
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0), (1, 1), (1, -1), (-1, 1), (-1, -1)]
    while queue:
        cy, cx = queue.popleft()
        if (cy, cx) == goal:
            return True
        for dy, dx in directions:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and grid[ny, nx] == 1 and (ny, nx) not in visited:
                visited.add((ny, nx))
                queue.append((ny, nx))
    return False
