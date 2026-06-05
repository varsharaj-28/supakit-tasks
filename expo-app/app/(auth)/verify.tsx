import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { verifyOtp, resendOtp } from "@/lib/auth";

export default function Verify() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    if (code.length < 6) return Alert.alert("Invalid", "Enter the 6-digit code");
    setLoading(true);
    try { await verifyOtp(email!, code); router.replace("/(app)"); }
    catch (e: any) { Alert.alert("Verification failed", e.message); }
    finally { setLoading(false); }
  };

  const onResend = async () => {
    try { await resendOtp(email!); Alert.alert("Sent", "New code emailed"); }
    catch (e: any) { Alert.alert("Error", e.message); }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>Verify your email</Text>
      <Text style={s.subtitle}>Code sent to {email}</Text>
      <TextInput style={s.input} placeholder="123456" keyboardType="number-pad" maxLength={6}
        value={code} onChangeText={setCode} placeholderTextColor="#888" />
      <Pressable style={s.btn} onPress={onVerify} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Verify</Text>}
      </Pressable>
      <Pressable onPress={onResend}><Text style={s.link}>Resend code</Text></Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 4 },
  subtitle: { color: "#666", marginBottom: 24 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 24, textAlign: "center", letterSpacing: 8 },
  btn: { backgroundColor: "#111", padding: 14, borderRadius: 8, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { marginTop: 16, color: "#2563eb", textAlign: "center" },
});
