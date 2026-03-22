"""
Phase4: JPS 与融合方案对比。运行 JPS 与 Fusion (Improved A* + GA)，输出对比到 result/。
"""
import sys
import time
from pathlib import Path

projectRoot = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(projectRoot))

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from utils.maploader import MapLoader
from utils.geometry import CalculatePathMetrics, CheckLineOfSight
from utils.point_validator import ValidateAndFixPoints, CheckConnectivity
from path.jps import JPSPlanner
from path.improved_astar import ImprovedAStar
from path.genetic import AdaptiveGA

RESULT_DIR = Path(__file__).parent / "result"


def PathMetrics(grid, path):
    if path is None or len(path) < 2:
        return {"length": np.inf, "smoothness": np.inf, "turns": 0, "nodes": 0, "valid": False}
    L, S = CalculatePathMetrics(path)
    turns = 0
    if len(path) > 2:
        for i in range(1, len(path) - 1):
            v1 = np.array(path[i]) - np.array(path[i - 1])
            v2 = np.array(path[i + 1]) - np.array(path[i])
            if np.linalg.norm(v1) > 0 and np.linalg.norm(v2) > 0:
                cosAngle = np.clip(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)), -1, 1)
                if np.arccos(cosAngle) > np.pi / 6:
                    turns += 1
    valid = all(CheckLineOfSight(grid, path[i], path[i + 1]) for i in range(len(path) - 1))
    return {"length": L, "smoothness": S, "turns": turns, "nodes": len(path), "valid": valid}


def RunPhase4(mapPath, scenarios, popSize=10, maxGen=20, outputDir=None):
    outputDir = Path(outputDir or RESULT_DIR)
    outputDir.mkdir(parents=True, exist_ok=True)
    loader = MapLoader(mapPath)
    grid, alpha = loader.Load()
    if grid is None:
        print("Map load failed.")
        return
    rho = loader.m_rho
    results = []
    pathsByScenario = {}
    scenarioEndpoints = {}
    for idx, (start, goal) in enumerate(scenarios, 1):
        name = str(idx)
        fixedStart, fixedGoal, fixInfo = ValidateAndFixPoints(grid, start, goal, autoFix=True, maxRadius=100)
        if fixedStart is None or fixedGoal is None:
            print(f"Skip case {name}: {fixInfo['start_message']}, {fixInfo['goal_message']}")
            continue
        pathsByScenario[name] = {}
        scenarioEndpoints[name] = (fixedStart, fixedGoal)
        # JPS
        jpsPlanner = JPSPlanner(grid, alpha)
        t0 = time.perf_counter()
        pathJps = jpsPlanner.Plan(fixedStart, fixedGoal)
        elapsedJps = time.perf_counter() - t0
        metricsJps = PathMetrics(grid, pathJps)
        results.append({
            "start": str(fixedStart),
            "goal": str(fixedGoal),
            "algorithm": "JPS",
            "time": round(elapsedJps, 4),
            "length": round(metricsJps["length"], 4),
            "smoothness": round(metricsJps["smoothness"], 4),
            "turns": metricsJps["turns"],
            "nodes": metricsJps["nodes"],
            "valid": metricsJps["valid"],
            "rho": rho,
        })
        pathsByScenario[name]["JPS"] = pathJps
        # Fusion (Improved A* + GA)
        gaAstar = AdaptiveGA(grid, alpha, fixedStart, fixedGoal, pop_size=popSize, max_gen=maxGen,
                             initial_solver="improved_astar")
        t0 = time.perf_counter()
        pathAstar, infoAstar = gaAstar.Evolve(track_initial=True)
        elapsedAstar = time.perf_counter() - t0
        metricsAstar = PathMetrics(grid, pathAstar)
        
        # 提取初始质量和收敛信息
        initial_metrics_astar = infoAstar.get('initial_metrics', {})
        conv_gen_astar = infoAstar.get('convergence_gen', 0)
        no_improve_astar = infoAstar.get('no_improve_count', 0)
        
        results.append({
            "start": str(fixedStart),
            "goal": str(fixedGoal),
            "algorithm": "Fusion (Improved A* + GA)",
            "time": round(elapsedAstar, 4),
            "length": round(metricsAstar["length"], 4),
            "smoothness": round(metricsAstar["smoothness"], 4),
            "turns": metricsAstar["turns"],
            "nodes": metricsAstar["nodes"],
            "valid": metricsAstar["valid"],
            "rho": rho,
            "initial_length": round(initial_metrics_astar.get('initial_length', 0), 4),
            "initial_smoothness": round(initial_metrics_astar.get('initial_smoothness', 0), 4),
            "initial_nodes": initial_metrics_astar.get('initial_nodes', 0),
            "convergence_gen": conv_gen_astar,
            "no_improve_count": no_improve_astar,
        })
        pathsByScenario[name]["Fusion (Improved A* + GA)"] = pathAstar
    df = pd.DataFrame(results)
    csvPath = outputDir / "phase4_results.csv"
    df.to_csv(csvPath, index=False, encoding="utf-8-sig")
    print(f"Saved {csvPath}")
    ALGO_COLORS = {
        "JPS": "#17becf",
        "Fusion (Improved A* + GA)": "#2ca02c",
    }
    jpsPlanner = JPSPlanner(grid, alpha)
    for name, paths in pathsByScenario.items():
        endpoints = scenarioEndpoints.get(name)
        if endpoints is None:
            continue
        fixedStart, fixedGoal = endpoints
        fig, ax = plt.subplots(1, 1, figsize=(10, 10))
        ax.imshow(grid, cmap="gray", vmin=0, vmax=1)
        for algoName, path in paths.items():
            if path and len(path) > 0:
                pathToPlot = jpsPlanner.GetDensePath(path) if algoName == "JPS" else path
                if len(pathToPlot) > 0:
                    py, px = zip(*pathToPlot)
                    color = ALGO_COLORS.get(algoName, "#333333")
                    ax.plot(px, py, color=color, linewidth=2.5, label=f"{algoName} (n={len(path)})")
        ax.scatter(fixedStart[1], fixedStart[0], c="lime", s=120, marker="o", edgecolors="black", linewidths=2, label="Start", zorder=5)
        ax.scatter(fixedGoal[1], fixedGoal[0], c="red", s=120, marker="*", edgecolors="black", linewidths=2, label="Goal", zorder=5)
        ax.set_title(f"Phase4 JPS vs Fusion - Case {name} (rho={rho:.4f})")
        ax.legend(loc="upper left", fontsize=9)
        ax.axis("off")
        plt.tight_layout()
        plt.savefig(outputDir / f"phase4_case{name}.png", dpi=150, bbox_inches="tight")
        plt.close()
    return df


def main():
    mapPath = projectRoot / "data" / "map.bytes"
    if not mapPath.exists():
        print(f"Map not found: {mapPath}")
        return
    h, w = 1500, 1500
    scenarios = [
        ((h // 4, w // 4), (h // 3, w // 3)),
        ((h // 5, w // 5), (h * 4 // 5, w * 4 // 5)),
        ((412, 118), (1382, 1490)),
    ]
    RunPhase4(str(mapPath), scenarios, popSize=10, maxGen=20, outputDir=RESULT_DIR)
    print("Phase4 done.")


if __name__ == "__main__":
    main()
