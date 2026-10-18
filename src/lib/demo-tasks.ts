// Demo mode: completed tasks are stored locally so the UI can show
// "Completed" state and earnings without a backend. Replace with real
// submissions when the API is connected.
const KEY = "ut-demo-subs";

export type DemoSub = { task_id: string; reward: number; at: string };

export function readDemoSubs(): DemoSub[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as DemoSub[];
  } catch {
    return [];
  }
}

export function completeDemoTask(taskId: string, reward: number) {
  const subs = readDemoSubs();
  subs.push({ task_id: taskId, reward, at: new Date().toISOString() });
  try {
    localStorage.setItem(KEY, JSON.stringify(subs));
  } catch {
    /* storage full */
  }
}

export function clearDemoSubs() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
