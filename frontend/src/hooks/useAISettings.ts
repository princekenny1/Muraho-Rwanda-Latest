/**
 * useAISettings — AI configuration management hooks
 *
 * Replaces: Legacy
 *   - ai_safety_settings
 *   - ai_source_rules
 *   - ai_mode_configs
 *   - ai_tone_profiles
 *   - ai_model_settings
 *
 * Backend: Payload CMS globals + collections
 *   - GET/PUT  /api/globals/ai-safety-settings
 *   - CRUD     /api/ai-source-rules
 *   - CRUD     /api/ai-mode-configs
 *   - CRUD     /api/ai-tone-profiles
 *   - GET/PUT  /api/globals/ai-model-settings
 *
 * Used by: SafetySettingsPanel, SourceRulesPanel, LocationOverridesPanel,
 *          ModeConfigPanel, ToneProfilesPanel, ModelSettingsPanel, AIPreviewPanel
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// ─── Shared types ────────────────────────────────────────────────────

export type AIMode = "standard" | "personal_voices" | "kid_friendly";

// ─── Safety Settings (Payload global) ────────────────────────────────

export interface AISafetySettings {
  id: string;
  enable_harm_sensitivity: boolean;
  enable_trauma_aware_language: boolean;
  hide_graphic_in_kid_mode: boolean;
  allow_raw_testimonies: boolean;
  safety_guidelines: string;
  sensitive_themes: string[];
}

interface PayloadSafetyGlobal {
  id: string;
  enableHarmSensitivity: boolean;
  enableTraumaAwareLanguage: boolean;
  hideGraphicInKidMode: boolean;
  allowRawTestimonies: boolean;
  safetyGuidelines: string;
  sensitiveThemes: string[];
}

function mapSafetySettings(raw: PayloadSafetyGlobal): AISafetySettings {
  return {
    id: raw.id,
    enable_harm_sensitivity: raw.enableHarmSensitivity,
    enable_trauma_aware_language: raw.enableTraumaAwareLanguage,
    hide_graphic_in_kid_mode: raw.hideGraphicInKidMode,
    allow_raw_testimonies: raw.allowRawTestimonies,
    safety_guidelines: raw.safetyGuidelines || "",
    sensitive_themes: raw.sensitiveThemes || [],
  };
}

export function useAISafetySettings() {
  return useQuery({
    queryKey: ["ai-safety-settings"],
    queryFn: async () => {
      const raw = await api.getGlobal("ai-safety-settings");
      return mapSafetySettings(raw as PayloadSafetyGlobal);
    },
  });
}

export function useUpdateSafetySettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<AISafetySettings>;
    }) => {
      const payload: Record<string, unknown> = {};
      if (updates.enable_harm_sensitivity !== undefined)
        payload.enableHarmSensitivity = updates.enable_harm_sensitivity;
      if (updates.enable_trauma_aware_language !== undefined)
        payload.enableTraumaAwareLanguage =
          updates.enable_trauma_aware_language;
      if (updates.hide_graphic_in_kid_mode !== undefined)
        payload.hideGraphicInKidMode = updates.hide_graphic_in_kid_mode;
      if (updates.allow_raw_testimonies !== undefined)
        payload.allowRawTestimonies = updates.allow_raw_testimonies;
      if (updates.safety_guidelines !== undefined)
        payload.safetyGuidelines = updates.safety_guidelines;
      if (updates.sensitive_themes !== undefined)
        payload.sensitiveThemes = updates.sensitive_themes;

      // Payload globals use POST to the global slug endpoint
      const res = await fetch(`${api.baseURL}/globals/ai-safety-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update safety settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-safety-settings"] });
    },
  });
}

// ─── Source Rules (Payload collection) ───────────────────────────────

export interface AISourceRule {
  id: string;
  rule_name: string;
  rule_type: string;
  target_mode?: AIMode;
  target_id?: string;
  tone_override?: AIMode | null;
  include_stories: boolean;
  include_panels: boolean;
  include_testimonies: boolean;
  include_routes: boolean;
  include_ar_content: boolean;
  include_drafts: boolean;
  is_active: boolean;
  custom_instructions?: string;
}

interface PayloadSourceRule {
  id: string;
  ruleName: string;
  ruleType: string;
  targetMode?: AIMode;
  targetId?: string;
  toneOverride?: AIMode | null;
  includeStories: boolean;
  includePanels: boolean;
  includeTestimonies: boolean;
  includeRoutes: boolean;
  includeArContent: boolean;
  includeDrafts: boolean;
  isActive: boolean;
  customInstructions?: string;
}

function mapSourceRule(raw: PayloadSourceRule): AISourceRule {
  return {
    id: raw.id,
    rule_name: raw.ruleName,
    rule_type: raw.ruleType,
    target_mode: raw.targetMode,
    target_id: raw.targetId,
    tone_override: raw.toneOverride ?? null,
    include_stories: raw.includeStories,
    include_panels: raw.includePanels,
    include_testimonies: raw.includeTestimonies,
    include_routes: raw.includeRoutes,
    include_ar_content: raw.includeArContent,
    include_drafts: raw.includeDrafts,
    is_active: raw.isActive,
    custom_instructions: raw.customInstructions,
  };
}

function sourceRuleToPayload(
  data: Partial<AISourceRule>,
): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  if (data.rule_name !== undefined) p.ruleName = data.rule_name;
  if (data.rule_type !== undefined) p.ruleType = data.rule_type;
  if (data.target_mode !== undefined) p.targetMode = data.target_mode;
  if (data.target_id !== undefined) p.targetId = data.target_id;
  if (data.tone_override !== undefined) p.toneOverride = data.tone_override;
  if (data.include_stories !== undefined)
    p.includeStories = data.include_stories;
  if (data.include_panels !== undefined) p.includePanels = data.include_panels;
  if (data.include_testimonies !== undefined)
    p.includeTestimonies = data.include_testimonies;
  if (data.include_routes !== undefined) p.includeRoutes = data.include_routes;
  if (data.include_ar_content !== undefined)
    p.includeArContent = data.include_ar_content;
  if (data.include_drafts !== undefined) p.includeDrafts = data.include_drafts;
  if (data.is_active !== undefined) p.isActive = data.is_active;
  if (data.custom_instructions !== undefined)
    p.customInstructions = data.custom_instructions;
  return p;
}

export function useAISourceRules() {
  return useQuery({
    queryKey: ["ai-source-rules"],
    queryFn: async () => {
      const res = await api.find("ai-source-rules", {
        sort: "ruleName",
        limit: 100,
      });
      return (res.docs as PayloadSourceRule[]).map(mapSourceRule);
    },
  });
}

export function useCreateSourceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AISourceRule>) => {
      return api.create("ai-source-rules", sourceRuleToPayload(data));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-source-rules"] });
    },
  });
}

export function useUpdateSourceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<AISourceRule>;
    }) => {
      return api.update("ai-source-rules", id, sourceRuleToPayload(updates));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-source-rules"] });
    },
  });
}

export function useDeleteSourceRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return api.delete("ai-source-rules", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-source-rules"] });
    },
  });
}

// ─── Mode Configs (Payload collection) ───────────────────────────────

export interface AIModeConfig {
  id: string;
  mode: AIMode;
  max_answer_tokens: number;
  temperature: number;
  include_stories: boolean;
  include_panels: boolean;
  include_testimonies: boolean;
  include_routes: boolean;
  prefer_testimonies: boolean;
  block_sensitive_content: boolean;
  use_simplified_language: boolean;
}

interface PayloadModeConfig {
  id: string;
  mode: AIMode;
  maxAnswerTokens: number;
  temperature: number;
  includeStories: boolean;
  includePanels: boolean;
  includeTestimonies: boolean;
  includeRoutes: boolean;
  preferTestimonies: boolean;
  blockSensitiveContent: boolean;
  useSimplifiedLanguage: boolean;
}

function mapModeConfig(raw: PayloadModeConfig): AIModeConfig {
  return {
    id: raw.id,
    mode: raw.mode,
    max_answer_tokens: raw.maxAnswerTokens,
    temperature: raw.temperature,
    include_stories: raw.includeStories,
    include_panels: raw.includePanels,
    include_testimonies: raw.includeTestimonies,
    include_routes: raw.includeRoutes,
    prefer_testimonies: raw.preferTestimonies,
    block_sensitive_content: raw.blockSensitiveContent,
    use_simplified_language: raw.useSimplifiedLanguage,
  };
}

export function useAIModeConfigs() {
  return useQuery({
    queryKey: ["ai-mode-configs"],
    queryFn: async () => {
      const res = await api.find("ai-mode-configs", { limit: 10 });
      return (res.docs as PayloadModeConfig[]).map(mapModeConfig);
    },
  });
}

export function useUpdateModeConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<AIModeConfig>;
    }) => {
      const p: Record<string, unknown> = {};
      if (updates.max_answer_tokens !== undefined)
        p.maxAnswerTokens = updates.max_answer_tokens;
      if (updates.temperature !== undefined)
        p.temperature = updates.temperature;
      if (updates.include_stories !== undefined)
        p.includeStories = updates.include_stories;
      if (updates.include_panels !== undefined)
        p.includePanels = updates.include_panels;
      if (updates.include_testimonies !== undefined)
        p.includeTestimonies = updates.include_testimonies;
      if (updates.include_routes !== undefined)
        p.includeRoutes = updates.include_routes;
      if (updates.prefer_testimonies !== undefined)
        p.preferTestimonies = updates.prefer_testimonies;
      if (updates.block_sensitive_content !== undefined)
        p.blockSensitiveContent = updates.block_sensitive_content;
      if (updates.use_simplified_language !== undefined)
        p.useSimplifiedLanguage = updates.use_simplified_language;

      return api.update("ai-mode-configs", id, p);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-mode-configs"] });
    },
  });
}

// ─── Tone Profiles (Payload collection) ──────────────────────────────

export interface AIToneProfile {
  id: string;
  name: string;
  mode: AIMode;
  description?: string;
  system_prompt: string;
  example_response?: string;
  is_active: boolean;
}

interface PayloadToneProfile {
  id: string;
  name: string;
  mode: AIMode;
  description?: string;
  systemPrompt: string;
  exampleResponse?: string;
  isActive: boolean;
}

function mapToneProfile(raw: PayloadToneProfile): AIToneProfile {
  return {
    id: raw.id,
    name: raw.name,
    mode: raw.mode,
    description: raw.description,
    system_prompt: raw.systemPrompt,
    example_response: raw.exampleResponse,
    is_active: raw.isActive,
  };
}

export function useAIToneProfiles() {
  return useQuery({
    queryKey: ["ai-tone-profiles"],
    queryFn: async () => {
      const res = await api.find("ai-tone-profiles", {
        sort: "mode",
        limit: 20,
      });
      return (res.docs as PayloadToneProfile[]).map(mapToneProfile);
    },
  });
}

export function useUpdateToneProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<AIToneProfile>;
    }) => {
      const p: Record<string, unknown> = {};
      if (updates.name !== undefined) p.name = updates.name;
      if (updates.description !== undefined)
        p.description = updates.description;
      if (updates.system_prompt !== undefined)
        p.systemPrompt = updates.system_prompt;
      if (updates.example_response !== undefined)
        p.exampleResponse = updates.example_response;
      if (updates.is_active !== undefined) p.isActive = updates.is_active;

      return api.update("ai-tone-profiles", id, p);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-tone-profiles"] });
    },
  });
}

// ─── Model Settings (Payload global) ─────────────────────────────────

export interface AIModelSettings {
  id: string;
  model_name: string;
  context_window: number;
  default_temperature: number;
  default_max_tokens: number;
  embedding_model: string;
  vector_similarity: string;
}

interface PayloadModelGlobal {
  id: string;
  modelName: string;
  contextWindow: number;
  defaultTemperature: number;
  defaultMaxTokens: number;
  embeddingModel: string;
  vectorSimilarity: string;
}

function mapModelSettings(raw: PayloadModelGlobal): AIModelSettings {
  return {
    id: raw.id,
    model_name: raw.modelName,
    context_window: raw.contextWindow,
    default_temperature: raw.defaultTemperature,
    default_max_tokens: raw.defaultMaxTokens,
    embedding_model: raw.embeddingModel,
    vector_similarity: raw.vectorSimilarity,
  };
}

export function useAIModelSettings() {
  return useQuery({
    queryKey: ["ai-model-settings"],
    queryFn: async () => {
      const raw = await api.getGlobal("ai-model-settings");
      return mapModelSettings(raw as PayloadModelGlobal);
    },
  });
}

export function useUpdateModelSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<AIModelSettings>;
    }) => {
      const p: Record<string, unknown> = {};
      if (updates.model_name !== undefined) p.modelName = updates.model_name;
      if (updates.context_window !== undefined)
        p.contextWindow = updates.context_window;
      if (updates.default_temperature !== undefined)
        p.defaultTemperature = updates.default_temperature;
      if (updates.default_max_tokens !== undefined)
        p.defaultMaxTokens = updates.default_max_tokens;

      const res = await fetch(`${api.baseURL}/globals/ai-model-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(p),
      });
      if (!res.ok) throw new Error("Failed to update model settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-model-settings"] });
    },
  });
}
