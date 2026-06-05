import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { signIn } from "@/lib/auth";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) return Alert.alert("Missing fields", "Email and password required");
    setLoading(true);
    try { await signIn(email.trim(), password); router.replace("/(app)"); }
    catch (e: any) {
      if (e.message?.toLowerCase().includes("not confirmed")) {
        router.push({ pathname: "/(auth)/verify", params: { email } });
      } else Alert.alert("Login failed", e.message);
    } finally { setLoading(false); }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Welcome back</Text>
      <Text style={s.subtitle}>Sign in to your tasks</Text>
      <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail} placeholderTextColor="#888" />
      <TextInput style={s.input} placeholder="Password" secureTextEntry
        value={password} onChangeText={setPassword} placeholderTextColor="#888" />
      <Pressable style={s.btn} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Sign in</Text>}
      </Pressable>
      <Link href="/(auth)/register" style={s.link}>Don't have an account? Register</Link>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "#666", marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  btn: { backgroundColor: "#111", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 4 },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { marginTop: 16, color: "#2563eb", textAlign: "center" },
});
