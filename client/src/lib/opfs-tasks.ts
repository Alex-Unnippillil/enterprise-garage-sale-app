export interface Task {
  id: string;
  text: string;
  filePath?: string;
}

const TASKS_FILE = 'tasks.json';

async function getRootDir() {
  // Origin Private File System root
  return await (navigator as any).storage.getDirectory();
}

async function getTasksFileHandle() {
  const root = await getRootDir();
  try {
    return await root.getFileHandle(TASKS_FILE);
  } catch {
    const handle = await root.getFileHandle(TASKS_FILE, { create: true });
    const writable = await handle.createWritable();
    await writable.write('[]');
    await writable.close();
    return handle;
  }
}

async function readTasks(): Promise<Task[]> {
  const handle = await getTasksFileHandle();
  const file = await handle.getFile();
  const text = await file.text();
  try {
    return JSON.parse(text) as Task[];
  } catch {
    return [];
  }
}

async function writeTasks(tasks: Task[]) {
  const handle = await getTasksFileHandle();
  const writable = await handle.createWritable();
  await writable.write(JSON.stringify(tasks));
  await writable.close();
}

export async function listTasks() {
  return await readTasks();
}

export async function addTask(data: { text: string; file?: File }) {
  const tasks = await readTasks();
  const id = crypto.randomUUID();
  let filePath: string | undefined;
  if (data.file) {
    const root = await getRootDir();
    const fileHandle = await root.getFileHandle(`${id}-${data.file.name}`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(await data.file.arrayBuffer());
    await writable.close();
    filePath = fileHandle.name;
  }
  const newTask: Task = { id, text: data.text, filePath };
  tasks.push(newTask);
  await writeTasks(tasks);
  return newTask;
}

export async function updateTask(id: string, updates: { text?: string }) {
  const tasks = await readTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return;
  tasks[idx] = { ...tasks[idx], ...updates };
  await writeTasks(tasks);
}

export async function deleteTask(id: string) {
  const tasks = await readTasks();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return;
  const [task] = tasks.splice(idx, 1);
  await writeTasks(tasks);
  if (task.filePath) {
    const root = await getRootDir();
    try {
      await root.removeEntry(task.filePath);
    } catch {}
  }
}
