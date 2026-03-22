/**
 * StoryDetailScreen — Full story reader with blocks and narration.
 */

import { View, Text, ScrollView, Image, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Play, Pause, AlertTriangle } from "lucide-react-native";
import { Audio } from "expo-av";
import { useState, useRef } from "react";
import { api } from "@/lib/api";
import type { Story, StoryBlock } from "@shared/types";

export default function StoryDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const { data: story, isLoading } = useQuery({
    queryKey: ["story", slug],
    queryFn: async () => {
      const res = await api.find<Story>("stories", {
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      });
      return res.docs[0] || null;
    },
    enabled: !!slug,
  });

  const toggleAudio = async () => {
    if (!story) return;

    if (isPlaying && soundRef.current) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
      return;
    }

    // Find first audio block
    const audioBlock = story.storyBlocks?.find((b) => b.audioUrl);
    if (!audioBlock?.audioUrl) return;

    if (!soundRef.current) {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioBlock.audioUrl },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
        }
      });
    } else {
      await soundRef.current.playAsync();
    }
    setIsPlaying(true);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!story) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-lg font-bold mb-2">Story not found</Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-indigo-600">Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        {story.coverImage?.url ? (
          <View className="relative">
            <Image
              source={{ uri: story.coverImage.url }}
              className="w-full h-72"
              resizeMode="cover"
            />
            <View className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </View>
        ) : (
          <View className="h-40 bg-amber-50" />
        )}

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          className="absolute top-14 left-4 w-10 h-10 bg-white/80 rounded-full items-center justify-center"
        >
          <ArrowLeft size={20} color="#1a1a2e" />
        </Pressable>

        {/* Content */}
        <View className="px-5 -mt-10 relative">
          {/* Sensitivity warning */}
          {story.sensitivityLevel === "sensitive" && (
            <View className="flex-row items-center gap-2 bg-rose-50 p-3 rounded-xl mb-4">
              <AlertTriangle size={16} color="#ef4444" />
              <Text className="text-xs text-rose-700 flex-1">
                This content discusses sensitive historical events.
              </Text>
            </View>
          )}

          <Text className="text-2xl font-bold leading-tight">{story.title}</Text>

          <View className="flex-row items-center gap-4 mt-3 mb-6">
            {story.estimatedReadMinutes && (
              <View className="flex-row items-center gap-1">
                <Clock size={14} color="#94a3b8" />
                <Text className="text-xs text-slate-500">{story.estimatedReadMinutes} min read</Text>
              </View>
            )}
            <Text className="text-xs text-slate-400 uppercase">{story.language}</Text>

            {/* Audio toggle */}
            {story.storyBlocks?.some((b) => b.audioUrl) && (
              <Pressable
                onPress={toggleAudio}
                className="flex-row items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-full"
              >
                {isPlaying ? (
                  <Pause size={14} color="#6366f1" />
                ) : (
                  <Play size={14} color="#6366f1" />
                )}
                <Text className="text-xs text-indigo-600 font-medium">
                  {isPlaying ? "Pause" : "Listen"}
                </Text>
              </Pressable>
            )}
          </View>

          {/* Story blocks */}
          {story.storyBlocks?.map((block, idx) => (
            <StoryBlockView key={block.id || idx} block={block} />
          ))}

          {/* Fallback: show summary if no blocks */}
          {(!story.storyBlocks || story.storyBlocks.length === 0) && story.summary && (
            <Text className="text-base text-slate-700 leading-7">{story.summary}</Text>
          )}
        </View>

        <View className="h-32" />
      </ScrollView>
    </View>
  );
}

function StoryBlockView({ block }: { block: StoryBlock }) {
  switch (block.blockType) {
    case "text":
      return (
        <Text className="text-base text-slate-700 leading-7 mb-5">
          {block.text}
        </Text>
      );

    case "image":
      return block.image?.url ? (
        <View className="mb-5">
          <Image
            source={{ uri: block.image.url }}
            className="w-full h-52 rounded-xl"
            resizeMode="cover"
          />
          {block.caption && (
            <Text className="text-xs text-slate-400 mt-2 text-center">{block.caption}</Text>
          )}
        </View>
      ) : null;

    case "quote":
    case "pull_quote":
      return (
        <View className="border-l-4 border-amber-400 pl-4 py-2 mb-5">
          <Text className="text-base italic text-slate-600 leading-7">
            "{block.quote}"
          </Text>
          {block.attribution && (
            <Text className="text-sm text-slate-400 mt-2">— {block.attribution}</Text>
          )}
        </View>
      );

    default:
      return null;
  }
}
