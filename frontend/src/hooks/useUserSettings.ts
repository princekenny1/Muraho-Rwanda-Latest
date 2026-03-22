/**
 * useUserSettings — User preferences
 *
 * Replaces: Legacy
 */

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api/client";
import { useAuth } from "./useAuth";

export type UserSettings = {
  theme: string;
  language: string;
  story_alerts: boolean;
  location_based: boolean;
  email_digest: boolean;
  sound_enabled: boolean;
};

const defaultSettings: UserSettings = {
  theme: "system",
  language: "en",
  story_alerts: true,
  location_based: true,
  email_digest: false,
  sound_enabled: true,
};

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    try {
      const res = await api.find("user-settings", {
        where: { user: { equals: user.id } },
        limit: 1,
      });

      if (res.docs.length > 0) {
        const d = res.docs[0] as any;
        setSettings({
          theme: d.theme ?? defaultSettings.theme,
          language: d.language ?? defaultSettings.language,
          story_alerts: d.storyAlerts ?? defaultSettings.story_alerts,
          location_based: d.locationBased ?? defaultSettings.location_based,
          email_digest: d.emailDigest ?? defaultSettings.email_digest,
          sound_enabled: d.soundEnabled ?? defaultSettings.sound_enabled,
        });
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return { error: new Error("Not authenticated") };

    setSaving(true);
    const updatedSettings = { ...settings, ...newSettings };

    try {
      // Find existing or create
      const res = await api.find("user-settings", {
        where: { user: { equals: user.id } },
        limit: 1,
      });

      const payload = {
        user: user.id,
        theme: updatedSettings.theme,
        language: updatedSettings.language,
        storyAlerts: updatedSettings.story_alerts,
        locationBased: updatedSettings.location_based,
        emailDigest: updatedSettings.email_digest,
        soundEnabled: updatedSettings.sound_enabled,
      };

      if (res.docs.length > 0) {
        await api.update("user-settings", res.docs[0].id, payload);
      } else {
        await api.create("user-settings", payload);
      }

      setSettings(updatedSettings);
      setSaving(false);
      return { error: null };
    } catch (error) {
      setSaving(false);
      return { error };
    }
  };

  return { settings, loading, saving, updateSettings, refetch: fetchSettings };
}
