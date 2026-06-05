import { useEffect } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listNotifications, markRead, subscribeNotifications } from "@/lib/notifications";
import { supabase } from "@/lib/supabase";

export default function Notifications() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({ queryKey: ["notifications"], queryFn: listNotifications });

  useEffect(() => {
    let unsub: (() => void) | undefined;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) unsub = subscribeNotifications(data.user.id,
        () => qc.invalidateQueries({ queryKey: ["notifications"] }));
    });
    return () => unsub?.();
  }, [qc]);

  if (isLoading) return <View style={s.center}><ActivityIndicator /></View>;

  return (
    <View style={s.container}>
      <Text style={s.h1}>Notifications</Text>
      <FlatList
        data={data}
        keyExtractor={(n) => n.id}
        ListEmptyComponent={<Text style={s.empty}>No notifications</Text>}
        renderItem={({ item }) => (
          <Pressable style={[s.row, !item.read && s.unread]}
            onPress={async () => { if (!item.read) { await markRead(item.id); qc.invalidateQueries({ queryKey: ["notifications"] }); } }}>
            <Text style={s.msg}>{item.message}</Text>
            <Text style={s.time}>{new Date(item.created_at).toLocaleString()}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingTop: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  h1: { fontSize: 28, fontWeight: "700", paddingHorizontal: 16, marginBottom: 8 },
  empty: { textAlign: "center", color: "#888", marginTop: 48 },
  row: { padding: 16, borderBottomWidth: 1, borderColor: "#f0f0f0" },
  unread: { backgroundColor: "#f0f9ff" },
  msg: { fontSize: 15 },
  time: { fontSize: 12, color: "#888", marginTop: 4 },
});
