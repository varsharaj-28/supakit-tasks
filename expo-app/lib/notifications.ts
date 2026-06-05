import { supabase, type Notification } from "./supabase";

export async function listNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function markRead(id: string) {
  const { error } = await supabase.from("notifications").update({ read: true }).eq("id", id);
  if (error) throw error;
}

export function subscribeNotifications(userId: string, onInsert: (n: Notification) => void) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on("postgres_changes",
      { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
      (payload) => onInsert(payload.new as Notification))
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
