import { Tabs } from "expo-router";
import { ListTodo, Bell, User } from "lucide-react-native";

export default function AppLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "#111" }}>
      <Tabs.Screen name="index" options={{ title: "Tasks", tabBarIcon: ({ color, size }) => <ListTodo color={color} size={size} /> }} />
      <Tabs.Screen name="notifications" options={{ title: "Notifications", tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
      <Tabs.Screen name="task/[id]" options={{ href: null }} />
      <Tabs.Screen name="task/new" options={{ href: null }} />
    </Tabs>
  );
}
