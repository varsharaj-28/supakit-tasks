import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ScrollView, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTask, updateTask, deleteTask } from "@/lib/tasks";
import type { TaskStatus } from "@/lib/supabase";

const STATUSES: TaskStatus[] = ["draft", "todo", "in_progress", "review", "completed", "archived"];

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: task, isLoading } = useQuery({ queryKey: ["task", id], queryFn: () => getTask(id!) });
  const [title, setTitle] = useState(""); const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");

  useEffect(() => {
    if (task) { setTitle(task.title); setDescription(task.description ?? ""); setStatus(task.status); }
  }, [task]);

  const save = useMutation({
    mutationFn: () => updateTask(id!, { title: title.trim(), description: description.trim() || null, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["task", id] });
      router.back();
    },
    onError: (e: any) => Alert.alert("Error", e.message),
  });

  const remove = useMutation({
    mutationFn: () => deleteTask(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); router.back(); },
  });

  if (isLoading || !task) return <View style={s.center}><ActivityIndicator /></View>;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={s.h1}>Edit task</Text>
      <TextInput style={s.input} value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor="#888" />
      <TextInput style={[s.input, { height: 120, textAlignVertical: "top" }]} multiline
        value={description} onChangeText={setDescription} placeholder="Description" placeholderTextColor="#888" />
      <Text style={s.label}>Status</Text>
      <View style={s.statusRow}>
        {STATUSES.map((st) => (
          <Pressable key={st} style={[s.chip, status === st && s.chipActive]} onPress={() => setStatus(st)}>
            <Text style={[s.chipText, status === st && s.chipTextActive]}>{st.replace("_", " ")}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={s.btn} onPress={() => save.mutate()} disabled={save.isPending}>
        <Text style={s.btnText}>{save.isPending ? "Saving…" : "Save"}</Text>
      </Pressable>
      <Pressable style={s.btnDanger} onPress={() =>
        Alert.alert("Delete task?", "", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => remove.mutate() },
        ])
      }>
        <Text style={s.btnText}>Delete</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  h1: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  label: { fontWeight: "600", marginTop: 8, marginBottom: 8 },
  statusRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, borderColor: "#ddd" },
  chipActive: { backgroundColor: "#111", borderColor: "#111" },
  chipText: { color: "#333", fontSize: 13, textTransform: "capitalize" },
  chipTextActive: { color: "#fff" },
  btn: { backgroundColor: "#111", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  btnDanger: { backgroundColor: "#dc2626", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 12 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
