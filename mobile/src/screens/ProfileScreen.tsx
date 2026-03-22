/**
 * ProfileScreen — User profile, auth, settings, and offline management.
 */

import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Alert } from "react-native";
import {
  User, LogOut, LogIn, Settings, Download, Globe, Shield, ChevronRight,
} from "lucide-react-native";
import { useAuthStore } from "@/hooks/useAuthStore";
import type { Language } from "@shared/types";

export default function ProfileScreen() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuthStore();

  if (!isAuthenticated) {
    return <LoginView onLogin={signIn} />;
  }

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="bg-slate-900 pt-16 pb-8 px-5 items-center">
        <View className="w-20 h-20 bg-indigo-500 rounded-full items-center justify-center mb-3">
          <Text className="text-white text-2xl font-bold">
            {(user?.fullName || user?.email || "?")[0].toUpperCase()}
          </Text>
        </View>
        <Text className="text-white font-bold text-lg">
          {user?.fullName || "Explorer"}
        </Text>
        <Text className="text-white/60 text-sm">{user?.email}</Text>
        <View className="mt-2 px-3 py-1 bg-white/10 rounded-full">
          <Text className="text-white/80 text-xs capitalize">
            {user?.accessTier?.replace("_", " ") || "Free"}
          </Text>
        </View>
      </View>

      {/* Menu sections */}
      <View className="px-5 mt-6">
        <Text className="text-xs text-slate-400 uppercase tracking-wide mb-3">Account</Text>

        <MenuItem icon={Globe} label="Language" value={user?.preferredLanguage?.toUpperCase() || "EN"} />
        <MenuItem icon={Shield} label="Access Tier" value={user?.accessTier?.replace("_", " ") || "Free"} />
        <MenuItem icon={Download} label="Offline Downloads" value="0 items" />
        <MenuItem icon={Settings} label="Settings" />
      </View>

      <View className="px-5 mt-8">
        <Pressable
          onPress={() => {
            Alert.alert("Sign Out", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: signOut },
            ]);
          }}
          className="flex-row items-center gap-3 py-4"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 font-medium">Sign Out</Text>
        </Pressable>
      </View>

      <View className="h-32" />
    </ScrollView>
  );
}

// ── Login sub-view ───────────────────────────────────────

function LoginView({ onLogin }: { onLogin: (e: string, p: string) => Promise<{ error?: string }> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    const result = await onLogin(email, password);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  return (
    <View className="flex-1 bg-white px-6 pt-24">
      <View className="w-16 h-16 bg-indigo-50 rounded-2xl items-center justify-center mb-6">
        <LogIn size={28} color="#6366f1" />
      </View>
      <Text className="text-2xl font-bold mb-2">Welcome Back</Text>
      <Text className="text-slate-500 mb-8">Sign in to access your saved content and subscriptions</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        className="bg-slate-50 rounded-xl px-4 py-3.5 text-sm mb-3"
      />
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        className="bg-slate-50 rounded-xl px-4 py-3.5 text-sm mb-4"
      />

      {error ? <Text className="text-red-500 text-sm mb-3">{error}</Text> : null}

      <Pressable
        onPress={handleLogin}
        disabled={loading || !email || !password}
        className={`py-3.5 rounded-xl items-center ${
          loading ? "bg-slate-300" : "bg-indigo-600"
        }`}
      >
        <Text className="text-white font-semibold">
          {loading ? "Signing in..." : "Sign In"}
        </Text>
      </Pressable>
    </View>
  );
}

// ── Menu item ────────────────────────────────────────────

function MenuItem({ icon: Icon, label, value }: {
  icon: typeof User;
  label: string;
  value?: string;
}) {
  return (
    <Pressable className="flex-row items-center gap-3 py-4 border-b border-slate-50">
      <Icon size={20} color="#64748b" />
      <Text className="flex-1 text-sm">{label}</Text>
      {value && <Text className="text-xs text-slate-400 capitalize">{value}</Text>}
      <ChevronRight size={16} color="#cbd5e1" />
    </Pressable>
  );
}
