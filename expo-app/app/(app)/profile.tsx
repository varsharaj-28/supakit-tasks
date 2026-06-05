import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { signOut, hasRole } from "@/lib/auth";

export default function Profile() {
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    hasRole("admin").then(setIsAdmin);
  }, []);

  return (
    <View style={s.container}>
      <Text style={s.h1}>Profile</Text>
      <View style={s.card}>
        <Text style={s.label}>Email</Text><Text style={s.value}>{email ?? "—"}</Text>
        <Text style={s.label}>Role</Text><Text style={s.value}>{isAdmin ? "Admin" : "User"}</Text>
      </View>
      <Pressable style={s.btn} onPress={() =>
        Alert.alert("Sign out?", "", [
          { text: "Cancel", style: "cancel" },
          { text: "Sign out", style: "destructive", onPress: () => signOut() },
        ])
      }>
        <Text style={s.btnText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  h1: { fontSize: 28, fontWeight: "700", marginVertical: 16 },
  card: { backgroundColor: "#f8f8f8", borderRadius: 12, padding: 16, marginBottom: 16 },
  label: { fontSize: 12, color: "#888", marginTop: 8 },
  value: { fontSize: 16, fontWeight: "500" },
  btn: { backgroundColor: "#dc2626", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
