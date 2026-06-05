import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { signUp } from "@/lib/auth";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || password.length < 6) return Alert.alert("Invalid", "Password ≥ 6 chars");
    setLoading(true);
    try {
      await signUp(email.trim(), password);
      router.replace({ pathname: "/(auth)/verify", params: { email } });
    } catch (e: any) { Alert.alert("Sign-up failed", e.message); }
    finally { setLoading(false); }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Create account</Text>
      <Text style={s.subtitle}>We'll email you a verification code</Text>
      <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail} placeholderTextColor="#888" />
      <TextInput style={s.input} placeholder="Password (min 6)" secureTextEntry
        value={password} onChangeText={setPassword} placeholderTextColor="#888" />
      <Pressable style={s.btn} onPress={onSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Register</Text>}
      </Pressable>
      <Link href="/(auth)/login" style={s.link}>Already have an account? Sign in</Link>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "#666", marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
  btn: { backgroundColor: "#111", padding: 14, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { marginTop: 16, color: "#2563eb", textAlign: "center" },
});
