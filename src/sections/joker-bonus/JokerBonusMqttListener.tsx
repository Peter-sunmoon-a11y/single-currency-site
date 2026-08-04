import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import type { JokerMqttPayload } from "./types";
import { readJokerState, upsertJokerPending, writeJokerState } from "./storage";

export function JokerBonusMqttListener() {
  const processedRef = useRef<Set<number>>(new Set());

  const { user } = useAuth();

  const { parsedMessages } = useMqttTopicMessagesReadonly<JokerMqttPayload>(user?.id ? `user/${user?.id}/joker_bonus` : null);

  useEffect(() => {
    if (!user?.id || !parsedMessages.length) return;

    let state = readJokerState(user?.id);
    let changed = false;
    for (const msg of parsedMessages) {
      const payload = msg.parsed;
      if (!payload || payload.event !== "joker_bonus_instance_created") continue;
      const instanceId = Number(payload.instance_id ?? 0);
      if (!instanceId || processedRef.current.has(instanceId)) continue;
      processedRef.current.add(instanceId);
      state = upsertJokerPending(state, payload, "mqtt", msg.timestamp);
      changed = true;
    }

    if (changed) writeJokerState(user?.id, state);
  }, [parsedMessages, user?.id]);

  return null;
}
