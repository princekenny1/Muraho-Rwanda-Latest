/**
 * StoriesScreen — Paginated story listing.
 */

import { View, Text, Pressable, Image, FlatList, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { BookOpen, Clock } from "lucide-react-native";
import { api } from "@/lib/api";
import type { Story } from "@shared/types";

export default function StoriesScreen() {
  const router = useRouter();

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["stories-list"],
    queryFn: async ({ pageParam = 1 }) => {
      return api.find<Story>("stories", {
        where: { status: { equals: "published" } },
        sort: "-createdAt",
        limit: 10,
        page: pageParam,
      });
    },
    getNextPageParam: (last) => (last.hasNextPage ? (last.page || 1) + 1 : undefined),
    initialPageParam: 1,
  });

  const stories = data?.pages.flatMap((p) => p.docs) || [];

  const renderStory = ({ item: story }: { item: Story }) => (
    <Pressable
      onPress={() => router.push(`/stories/${story.slug}`)}
      className="flex-row items-center gap-4 px-5 py-4 border-b border-slate-50"
    >
      {story.coverImage?.url ? (
        <Image
          source={{ uri: story.coverImage.url }}
          className="w-20 h-20 rounded-xl"
          resizeMode="cover"
        />
      ) : (
        <View className="w-20 h-20 rounded-xl bg-amber-50 items-center justify-center">
          <BookOpen size={24} color="#f59e0b" />
        </View>
      )}
      <View className="flex-1">
        {story.sensitivityLevel === "sensitive" && (
          <Text className="text-xs text-rose-500 font-medium mb-0.5">Sensitive content</Text>
        )}
        <Text className="font-semibold text-sm" numberOfLines={2}>{story.title}</Text>
        {story.summary && (
          <Text className="text-xs text-slate-500 mt-1" numberOfLines={2}>{story.summary}</Text>
        )}
        <View className="flex-row items-center gap-2 mt-2">
          {story.estimatedReadMinutes && (
            <View className="flex-row items-center gap-1">
              <Clock size={12} color="#94a3b8" />
              <Text className="text-xs text-slate-400">{story.estimatedReadMinutes} min</Text>
            </View>
          )}
          <Text className="text-xs text-slate-300 uppercase">{story.language}</Text>
        </View>
      </View>
    </Pressable>
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white pt-16 pb-4 px-5 border-b border-slate-100">
        <Text className="text-2xl font-bold">Stories</Text>
        <Text className="text-sm text-slate-500 mt-1">
          Discover Rwanda through its people and heritage
        </Text>
      </View>

      <FlatList
        data={stories}
        renderItem={renderStory}
        keyExtractor={(item) => item.id}
        onEndReached={() => { if (hasNextPage) fetchNextPage(); }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? <ActivityIndicator className="py-4" /> : null
        }
        ListEmptyComponent={
          <View className="items-center py-20">
            <BookOpen size={32} color="#cbd5e1" />
            <Text className="text-slate-400 mt-3">No stories yet</Text>
          </View>
        }
      />
    </View>
  );
}
