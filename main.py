import matplotlib.pyplot as plt
import numpy as np
from utils.maploader import MapLoader
from path.improved_astar import ImprovedAStar
from path.genetic import AdaptiveGA


def main():
    mapFile = "data/map.bytes"
    loader = MapLoader(mapFile)
    gridMap, alpha = loader.Load()
    if gridMap is None:
        return
    startPos = (412, 118)
    goalPos = (1382, 1490)
    print(f"Obstacle density Rho={loader.m_rho:.4f}, base Alpha={alpha:.4f}")
    gaSolver = AdaptiveGA(gridMap, alpha, startPos, goalPos, pop_size=10, max_gen=20)
    bestPath = gaSolver.Evolve()
    Visualize(gridMap, bestPath, startPos, goalPos)


def Visualize(grid, path, start, goal):
    plt.figure(figsize=(10, 10))
    plt.imshow(grid, cmap='gray', vmin=0, vmax=1)
    if path:
        py, px = zip(*path)
        plt.plot(px, py, color='#00FF00', linewidth=2, label='Fusion path')
    plt.scatter(start[1], start[0], c='blue', s=100, label='Start')
    plt.scatter(goal[1], goal[0], c='red', s=100, label='Goal')
    plt.legend()
    plt.title("Fusion: Improved A* + Adaptive GA")
    plt.axis('off')
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()