import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@/lib/tasks";

export default function NewTask() {
  const router = useRouter();
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const m = useMutation({
    mutationFn: () => createTask({ title: title.trim(), description: description.trim() || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); router.back(); },
    onError: (e: any) => Alert.alert("Error", e.message),
  });

  return (
    <View style={s.container}>
      <Text style={s.h1}>New task</Text>
      <TextInput style={s.input} placeholder="Title" value={title} onChangeText={setTitle} placeholderTextColor="#888" />
      <TextInput style={[s.input, { height: 120, textAlignVertical: "top" }]} placeholder="Description (optional)"
        multiline value={description} onChangeText={setDescription} placeholderTextColor="#888" />
      <Pressable style={[s.btn, !title.trim() && { opacity: 0.4 }]}
        disabled={!title.trim() || m.isPending} onPress={() => m.mutate()}>
        <Text style={s.btnText}>{m.isPending ? "Saving…" : "Create"}</Text>
      </Pressable>
      <Pressable onPress={() => router.back()}><Text style={s.cancel}>Cancel</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  h1: { fontSize: 24, fontWeight: "700", marginVertical: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  btn: { backgroundColor: "#111", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  cancel: { textAlign: "center", color: "#666", marginTop: 16 },
});
