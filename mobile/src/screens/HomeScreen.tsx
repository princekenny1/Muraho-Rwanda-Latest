/**
 * HomeScreen — Landing screen with featured content + nearby locations.
 */

import { useEffect } from "react";
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import * as ExpoLocation from "expo-location";
import { MapPin, ChevronRight, Sparkles } from "lucide-react-native";
import { api } from "@/lib/api";
import { useAuthStore } from "@/hooks/useAuthStore";
import type { Story, Museum, MapPoint } from "@shared/types";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Featured stories
  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ["featured-stories"],
    queryFn: async () => {
      const res = await api.find<Story>("stories", {
        where: { isFeatured: { equals: true }, status: { equals: "published" } },
        sort: "-createdAt",
        limit: 5,
      });
      return res.docs;
    },
  });

  // Featured museums
  const { data: museums } = useQuery({
    queryKey: ["featured-museums"],
    queryFn: async () => {
      const res = await api.find<Museum>("museums", {
        where: { isFeatured: { equals: true }, isActive: { equals: true } },
        limit: 4,
      });
      return res.docs;
    },
  });

  // Nearby points (if location granted)
  const { data: nearby } = useQuery({
    queryKey: ["nearby-points"],
    queryFn: async () => {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") return [];
      const loc = await ExpoLocation.getCurrentPositionAsync({});
      const result = await api.nearby(loc.coords.latitude, loc.coords.longitude, 15);
      return (result.points || []).slice(0, 8) as MapPoint[];
    },
  });

  return (
    <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View className="bg-slate-900 pt-16 pb-10 px-6">
        <Text className="text-white/60 text-sm">
          {user ? `Murakaza neza, ${user.fullName || "explorer"}` : "Murakaza neza"}
        </Text>
        <Text className="text-white text-3xl font-bold mt-1">Muraho Rwanda</Text>
        <Text className="text-white/70 text-base mt-2">
          Discover Rwanda's heritage, stories, and memorials
        </Text>

        {/* Search bar */}
        <Pressable
          onPress={() => router.push("/search")}
          className="mt-5 bg-white/10 rounded-2xl px-4 py-3.5 flex-row items-center gap-3"
        >
          <MapPin size={18} color="rgba(255,255,255,0.5)" />
          <Text className="text-white/50 text-sm flex-1">Search Rwanda...</Text>
        </Pressable>
      </View>

      {/* Featured Stories */}
      <View className="px-5 mt-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-lg font-bold">Featured Stories</Text>
          <Pressable onPress={() => router.push("/stories")} className="flex-row items-center">
            <Text className="text-sm text-indigo-600">See all</Text>
            <ChevronRight size={16} color="#4f46e5" />
          </Pressable>
        </View>

        {storiesLoading ? (
          <ActivityIndicator className="py-8" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-1">
            {stories?.map((story) => (
              <Pressable
                key={story.id}
                onPress={() => router.push(`/stories/${story.slug}`)}
                className="w-64 mr-4 rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-100"
              >
                {story.coverImage?.url ? (
                  <Image
                    source={{ uri: story.coverImage.url }}
                    className="w-full h-36"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-36 bg-slate-100 items-center justify-center">
                    <Sparkles size={24} color="#94a3b8" />
                  </View>
                )}
                <View className="p-3.5">
                  <Text className="font-semibold text-sm" numberOfLines={2}>
                    {story.title}
                  </Text>
                  {story.summary && (
                    <Text className="text-xs text-slate-500 mt-1" numberOfLines={2}>
                      {story.summary}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Museums */}
      {museums && museums.length > 0 && (
        <View className="px-5 mt-8">
          <Text className="text-lg font-bold mb-4">Museums & Memorials</Text>
          {museums.map((museum) => (
            <Pressable
              key={museum.id}
              onPress={() => router.push(`/museums/${museum.slug}`)}
              className="flex-row items-center gap-4 py-3 border-b border-slate-100"
            >
              {museum.coverImage?.url ? (
                <Image
                  source={{ uri: museum.coverImage.url }}
                  className="w-14 h-14 rounded-xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-14 h-14 rounded-xl bg-indigo-50 items-center justify-center">
                  <MapPin size={20} color="#6366f1" />
                </View>
              )}
              <View className="flex-1">
                <Text className="font-semibold text-sm">{museum.name}</Text>
                {museum.description && (
                  <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={1}>
                    {museum.description}
                  </Text>
                )}
              </View>
              <ChevronRight size={18} color="#94a3b8" />
            </Pressable>
          ))}
        </View>
      )}

      {/* Nearby */}
      {nearby && nearby.length > 0 && (
        <View className="px-5 mt-8 mb-10">
          <Text className="text-lg font-bold mb-4">Nearby</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {nearby.map((point) => (
              <Pressable
                key={point.id}
                onPress={() => router.push(`/map?focus=${point.id}`)}
                className="w-40 mr-3 p-3.5 rounded-xl bg-teal-50 border border-teal-100"
              >
                <MapPin size={18} color="#0d9488" />
                <Text className="font-medium text-sm mt-2" numberOfLines={2}>
                  {point.title}
                </Text>
                {point.distanceKm !== undefined && (
                  <Text className="text-xs text-teal-700 mt-1">
                    {point.distanceKm.toFixed(1)} km away
                  </Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Bottom spacer for tab bar */}
      <View className="h-24" />
    </ScrollView>
  );
}
