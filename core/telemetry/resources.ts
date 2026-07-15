import { freemem, loadavg, totalmem } from "node:os";
import { statfs } from "node:fs/promises";

export type ResourceSnapshot = {
  capturedAt: string;
  loadAverage: [number, number, number];
  memoryTotalBytes: number;
  memoryFreeBytes: number;
  diskTotalBytes: number;
  diskFreeBytes: number;
};

export async function captureResources(path = process.cwd()): Promise<ResourceSnapshot> {
  const disk = await statfs(path);
  const load = loadavg();
  return {
    capturedAt: new Date().toISOString(),
    loadAverage: [load[0] ?? 0, load[1] ?? 0, load[2] ?? 0],
    memoryTotalBytes: totalmem(),
    memoryFreeBytes: freemem(),
    diskTotalBytes: disk.blocks * disk.bsize,
    diskFreeBytes: disk.bavail * disk.bsize,
  };
}
