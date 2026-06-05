import { supabase, type Task, type TaskStatus } from "./supabase";

export async function listTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTask(id: string): Promise<Task> {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createTask(input: { title: string; description?: string }) {
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from("tasks").insert({
    title: input.title,
    description: input.description ?? null,
    user_id: userRes.user.id,
    status: "todo" as TaskStatus,
  }).select().single();
  if (error) throw error;
  return data as Task;
}

export async function updateTask(
  id: string,
  patch: Partial<Pick<Task, "title" | "description" | "completed" | "status">>,
) {
  const { data, error } = await supabase
    .from("tasks").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as Task;
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
