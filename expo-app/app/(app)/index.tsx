import { View, Text, FlatList, Pressable, StyleSheet, RefreshControl, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react-native";
import { listTasks } from "@/lib/tasks";
import type { Task } from "@/lib/supabase";

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8", todo: "#3b82f6", in_progress: "#f59e0b",
  review: "#8b5cf6", completed: "#10b981", archived: "#6b7280",
};

export default function TaskList() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data = [], isLoading, refetch, isRefetching } =
    useQuery({ queryKey: ["tasks"], queryFn: listTasks });

  if (isLoading) return <View style={s.center}><ActivityIndicator /></View>;

  return (
    <View style={s.container}>
      <Text style={s.h1}>Your tasks</Text>
      <FlatList
        data={data}
        keyExtractor={(t) => t.id}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<Text style={s.empty}>No tasks yet. Tap + to add.</Text>}
        renderItem={({ item }) => <TaskRow task={item} onPress={() => router.push(`/(app)/task/${item.id}`)} />}
        contentContainerStyle={{ paddingBottom: 96 }}
      />
      <Pressable style={s.fab} onPress={() => router.push("/(app)/task/new")}>
        <Plus color="#fff" size={24} />
      </Pressable>
    </View>
  );
}

function TaskRow({ task, onPress }: { task: Task; onPress: () => void }) {
  return (
    <Pressable style={s.row} onPress={onPress}>
      <View style={[s.dot, { backgroundColor: STATUS_COLORS[task.status] ?? "#999" }]} />
      <View style={{ flex: 1 }}>
        <Text style={[s.title, task.completed && s.done]} numberOfLines={1}>{task.title}</Text>
        {task.description ? <Text style={s.desc} numberOfLines={1}>{task.description}</Text> : null}
        <Text style={s.status}>{task.status.replace("_", " ")}</Text>
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  h1: { fontSize: 28, fontWeight: "700", paddingHorizontal: 16, marginBottom: 8 },
  empty: { textAlign: "center", color: "#888", marginTop: 48 },
  row: { flexDirection: "row", padding: 16, borderBottomWidth: 1, borderColor: "#f0f0f0", alignItems: "center", gap: 12 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  title: { fontSize: 16, fontWeight: "600" },
  done: { textDecorationLine: "line-through", color: "#999" },
  desc: { color: "#666", marginTop: 2 },
  status: { fontSize: 11, color: "#888", marginTop: 4, textTransform: "uppercase" },
  fab: { position: "absolute", right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: "#111", justifyContent: "center", alignItems: "center", elevation: 4 },
});
