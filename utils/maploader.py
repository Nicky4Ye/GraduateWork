"""
栅格地图加载：map.bytes 大端序头 [HighRow][LowRow][HighCol][LowCol] + 数据体。
"""
import os
import struct
import numpy as np


class MapLoader:
    def __init__(self, filepath):
        self.m_filepath = filepath
        self.m_grid = None
        self.m_width = 0
        self.m_height = 0
        self.m_rho = 0.0
        self.m_alpha = 1.0

    def Load(self):
        if not os.path.exists(self.m_filepath):
            print(f"File not found: {self.m_filepath}")
            return None, 1.0
        try:
            with open(self.m_filepath, "rb") as f:
                headerData = f.read(4)
                if len(headerData) < 4:
                    raise ValueError("Invalid header")
                self.m_height, self.m_width = struct.unpack(">HH", headerData)
                bodyData = f.read()
                expectedSize = self.m_height * self.m_width
                if len(bodyData) != expectedSize:
                    bodyData = bodyData[:expectedSize]
                rawGrid = np.frombuffer(bodyData, dtype=np.uint8)
                rawGrid = rawGrid.reshape((self.m_height, self.m_width))
                self.m_grid = np.zeros((self.m_height, self.m_width), dtype=np.int8)
                self.m_grid[rawGrid == 0] = 1
        except Exception as e:
            print(f"Load failed: {e}")
            self.m_width, self.m_height = 1500, 1500
            self.m_grid = np.random.choice([0, 1], size=(self.m_height, self.m_width), p=[0.3, 0.7]).astype(np.int8)
        totalCells = self.m_width * self.m_height
        obstacleCount = totalCells - int(np.sum(self.m_grid))
        self.m_rho = obstacleCount / totalCells if totalCells > 0 else 0
        self.m_alpha = 1.0 + (2.0 * self.m_rho) / (1.0 + self.m_rho ** 2)
        return self.m_grid, self.m_alpha
