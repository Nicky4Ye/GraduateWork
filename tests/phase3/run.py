"""
Phase3: 融合方案与多算法对比。运行 Fusion（Improved A* + GA）、Improved A*、Dijkstra，输出对比到 result/。
"""
import os
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
from path.improved_astar import ImprovedAStar
from path.dijkstra import Dijkstra
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


def RunPhase3(mapPath, scenarios, popSize=10, maxGen=20, outputDir=None):
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
    for name, start, goal in scenarios:
        fixedStart, fixedGoal, fixInfo = ValidateAndFixPoints(grid, start, goal, autoFix=True, maxRadius=100)
        if fixedStart is None or fixedGoal is None:
            print(f"Skip {name}: {fixInfo['start_message']}, {fixInfo['goal_message']}")
            continue
        pathsByScenario[name] = {}
        scenarioEndpoints[name] = (fixedStart, fixedGoal)
        algos = [
            ("Improved A*", lambda: ImprovedAStar(grid, alpha).Plan(fixedStart, fixedGoal)),
            ("Dijkstra", lambda: Dijkstra(grid).Plan(fixedStart, fixedGoal)),
        ]
        for algoName, runAlgo in algos:
            t0 = time.perf_counter()
            path = runAlgo()
            elapsed = time.perf_counter() - t0
            metrics = PathMetrics(grid, path)
            results.append({
                "start": str(fixedStart),
                "goal": str(fixedGoal),
                "algorithm": algoName,
                "time": round(elapsed, 4),
                "length": round(metrics["length"], 4),
                "smoothness": round(metrics["smoothness"], 4),
                "turns": metrics["turns"],
                "nodes": metrics["nodes"],
                "valid": metrics["valid"],
                "rho": rho,
            })
            pathsByScenario[name][algoName] = path
        t0 = time.perf_counter()
        ga = AdaptiveGA(grid, alpha, fixedStart, fixedGoal, pop_size=popSize, max_gen=maxGen)
        fusionPath, info = ga.Evolve(track_initial=True)
        elapsed = time.perf_counter() - t0
        metrics = PathMetrics(grid, fusionPath)
        
        # 提取初始质量和收敛信息
        initial_metrics = info.get('initial_metrics', {})
        conv_gen = info.get('convergence_gen', 0)
        no_improve = info.get('no_improve_count', 0)
        
        results.append({
            "start": str(fixedStart),
            "goal": str(fixedGoal),
            "algorithm": "Fusion (Improved A* + GA)",
            "time": round(elapsed, 4),
            "length": round(metrics["length"], 4),
            "smoothness": round(metrics["smoothness"], 4),
            "turns": metrics["turns"],
            "nodes": metrics["nodes"],
            "valid": metrics["valid"],
            "rho": rho,
            "initial_length": round(initial_metrics.get('initial_length', 0), 4),
            "initial_smoothness": round(initial_metrics.get('initial_smoothness', 0), 4),
            "initial_nodes": initial_metrics.get('initial_nodes', 0),
            "convergence_gen": conv_gen,
            "no_improve_count": no_improve,
        })
        pathsByScenario[name]["Fusion (Improved A* + GA)"] = fusionPath
    df = pd.DataFrame(results)
    csvPath = outputDir / "phase3_results.csv"
    df.to_csv(csvPath, index=False, encoding="utf-8-sig")
    print(f"Saved {csvPath}")
    ALGO_COLORS = {
        "Improved A*": "#ff7f0e",
        "Dijkstra": "#9467bd",
        "Fusion (Improved A* + GA)": "#2ca02c",
    }
    for name, paths in pathsByScenario.items():
        endpoints = scenarioEndpoints.get(name)
        if endpoints is None:
            continue
        fixedStart, fixedGoal = endpoints
        fig, ax = plt.subplots(1, 1, figsize=(10, 10))
        ax.imshow(grid, cmap="gray", vmin=0, vmax=1)
        for algoName, path in paths.items():
            if path and len(path) > 0:
                py, px = zip(*path)
                color = ALGO_COLORS.get(algoName, "#333333")
                ax.plot(px, py, color=color, linewidth=2.5, label=f"{algoName} (n={len(path)})")
        ax.scatter(fixedStart[1], fixedStart[0], c="lime", s=120, marker="o", edgecolors="black", linewidths=2, label="Start", zorder=5)
        ax.scatter(fixedGoal[1], fixedGoal[0], c="red", s=120, marker="*", edgecolors="black", linewidths=2, label="Goal", zorder=5)
        ax.set_title(f"Phase3 - Case {name} (rho={rho:.4f})")
        ax.legend(loc="upper left", fontsize=8)
        ax.axis("off")
        plt.tight_layout()
        safeName = name.replace(" ", "_").replace("/", "_")
        plt.savefig(outputDir / f"phase3_{safeName}.png", dpi=150, bbox_inches="tight")
        plt.close()
    return df


def main():
    mapPath = projectRoot / "data" / "map.bytes"
    if not mapPath.exists():
        print(f"Map not found: {mapPath}")
        return
    h, w = 1500, 1500
    scenarios = [
        ("Short", (h // 4, w // 4), (h // 3, w // 3)),
        ("Main", (412, 118), (1382, 1490)),
    ]
    RunPhase3(str(mapPath), scenarios, popSize=10, maxGen=20, outputDir=RESULT_DIR)
    print("Phase3 done.")


if __name__ == "__main__":
    main()
