import { supabase, type AppRole } from "./supabase";

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function verifyOtp(email: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) throw error;
  return data;
}

export async function resendOtp(email: string) {
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function hasRole(role: AppRole): Promise<boolean> {
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) return false;
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userRes.user.id, _role: role,
  });
  if (error) return false;
  return Boolean(data);
}
