/**
 * AskScreen — AI chat interface for Rwanda questions.
 */

import { useState, useRef } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { Send, Bot, User, Sparkles } from "lucide-react-native";
import { api } from "@/lib/api";
import type { Language } from "@shared/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function AskScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"standard" | "kid_friendly">("standard");
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    const query = input.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await api.askRwanda(query, mode);
      const answer = response.answer || response.content?.[0]?.text || "I couldn't find an answer.";

      const assistantMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: answer,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View className="bg-slate-900 pt-16 pb-5 px-5">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 bg-indigo-500 rounded-full items-center justify-center">
            <Bot size={20} color="white" />
          </View>
          <View>
            <Text className="text-white font-bold text-lg">Ask Rwanda</Text>
            <Text className="text-white/60 text-xs">Your AI heritage guide</Text>
          </View>
        </View>

        {/* Mode toggle */}
        <View className="flex-row gap-2 mt-4">
          {(["standard", "kid_friendly"] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMode(m)}
              className={`px-3.5 py-1.5 rounded-full ${
                mode === m ? "bg-white" : "bg-white/10"
              }`}
            >
              <Text className={`text-xs font-medium ${
                mode === m ? "text-slate-900" : "text-white/70"
              }`}>
                {m === "standard" ? "Standard" : "Kid Friendly"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View className="items-center py-16">
            <Sparkles size={32} color="#c7d2fe" />
            <Text className="text-slate-400 text-sm mt-4 text-center">
              Ask me anything about Rwanda's{"\n"}history, culture, and heritage
            </Text>
            <View className="flex-row flex-wrap justify-center gap-2 mt-6">
              {[
                "What is Umuganda?",
                "Tell me about Kigali Memorial",
                "Imigongo art tradition",
              ].map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => { setInput(suggestion); }}
                  className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <Text className="text-xs text-slate-600">{suggestion}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`mb-4 max-w-[85%] ${
              msg.role === "user" ? "self-end" : "self-start"
            }`}
          >
            <View
              className={`p-3.5 rounded-2xl ${
                msg.role === "user"
                  ? "bg-indigo-600 rounded-br-md"
                  : "bg-slate-100 rounded-bl-md"
              }`}
            >
              <Text
                className={`text-sm leading-5 ${
                  msg.role === "user" ? "text-white" : "text-slate-800"
                }`}
              >
                {msg.content}
              </Text>
            </View>
          </View>
        ))}

        {isLoading && (
          <View className="self-start mb-4 px-4 py-3 bg-slate-100 rounded-2xl rounded-bl-md">
            <ActivityIndicator size="small" color="#6366f1" />
          </View>
        )}

        <View className="h-4" />
      </ScrollView>

      {/* Input */}
      <View className="px-4 pb-8 pt-3 border-t border-slate-100 bg-white">
        <View className="flex-row items-end gap-2">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask about Rwanda..."
            multiline
            maxLength={500}
            className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 text-sm max-h-24"
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              input.trim() && !isLoading ? "bg-indigo-600" : "bg-slate-200"
            }`}
          >
            <Send size={18} color={input.trim() && !isLoading ? "white" : "#94a3b8"} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
