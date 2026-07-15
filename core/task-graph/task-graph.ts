import { TaskSchema, type Task } from "../shared/schemas.js";

export class TaskGraph {
  readonly tasks: Map<string, Task>;

  constructor(tasks: Task[] = []) {
    this.tasks = new Map(tasks.map((task) => [task.id, TaskSchema.parse(task)]));
    this.validate();
  }

  add(task: Task): void {
    const parsed = TaskSchema.parse(task);
    if (this.tasks.has(parsed.id)) throw new Error(`Task already exists: ${parsed.id}`);
    this.tasks.set(parsed.id, parsed);
    try {
      this.validate();
    } catch (error) {
      this.tasks.delete(parsed.id);
      throw error;
    }
  }

  update(id: string, patch: Partial<Task>): Task {
    const current = this.require(id);
    const next = TaskSchema.parse({ ...current, ...patch, id, updatedAt: new Date().toISOString() });
    this.tasks.set(id, next);
    try {
      this.validate();
    } catch (error) {
      this.tasks.set(id, current);
      throw error;
    }
    return next;
  }

  require(id: string): Task {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`Unknown task: ${id}`);
    return task;
  }

  ready(): Task[] {
    return [...this.tasks.values()]
      .filter((task) => task.status === "pending" || task.status === "ready")
      .filter((task) => task.dependencies.every((dependency) => this.require(dependency).status === "completed"))
      .sort((left, right) => right.priority - left.priority || left.createdAt.localeCompare(right.createdAt));
  }

  blocked(): Task[] {
    return [...this.tasks.values()].filter((task) =>
      task.status === "blocked" ||
      (task.status === "pending" && task.dependencies.some((dependency) => {
        const status = this.require(dependency).status;
        return status === "failed" || status === "cancelled" || status === "blocked";
      })),
    );
  }

  criticalPath(): string[] {
    const memo = new Map<string, { cost: number; path: string[] }>();
    const visit = (id: string): { cost: number; path: string[] } => {
      const cached = memo.get(id);
      if (cached) return cached;
      const task = this.require(id);
      const parents = task.dependencies.map(visit);
      const longest = parents.sort((a, b) => b.cost - a.cost)[0] ?? { cost: 0, path: [] };
      const result = { cost: longest.cost + task.estimatedUsage, path: [...longest.path, id] };
      memo.set(id, result);
      return result;
    };

    return [...this.tasks.keys()].map(visit).sort((a, b) => b.cost - a.cost)[0]?.path ?? [];
  }

  serialize(): Task[] {
    return [...this.tasks.values()];
  }

  validate(): void {
    for (const task of this.tasks.values()) {
      for (const dependency of task.dependencies) {
        if (!this.tasks.has(dependency)) throw new Error(`Task ${task.id} depends on missing task ${dependency}`);
        if (dependency === task.id) throw new Error(`Task ${task.id} depends on itself`);
      }
    }

    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string): void => {
      if (visiting.has(id)) throw new Error(`Task graph contains a cycle at ${id}`);
      if (visited.has(id)) return;
      visiting.add(id);
      for (const dependency of this.require(id).dependencies) visit(dependency);
      visiting.delete(id);
      visited.add(id);
    };
    for (const id of this.tasks.keys()) visit(id);
  }
}
