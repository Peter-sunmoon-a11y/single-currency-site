import { AUTH_QUERY_KEYS, useUnreadNotificationCounter } from "@/hooks/api/useAuth.ts";
import { useMqttTopicMessagesReadonly } from "@/contexts/mqtt";
import { useBoundStore } from "@/store";
import { useEffect } from "react";
import { MessageSquareMore } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function InternalMessageCounter({ onClick }: { onClick: () => void }) {
  const user = useBoundStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: unreadCounter, refetch: unreadCounterRefetch } = useUnreadNotificationCounter();

  // TODO: EMQX - 站内信通知
  const { parsedMessages } = useMqttTopicMessagesReadonly<any>(user?.id ? `user/${user!.id}/notification` : null);

  const latest = parsedMessages?.[0];

  useEffect(() => {
    const parsed_data = latest?.parsed;
    if (!parsed_data) return;

    if (parsed_data) {
      void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.notificationMessage });
      void unreadCounterRefetch();
    }
  }, [latest?.timestamp, queryClient, unreadCounterRefetch]);

  return (
    <div
      className="indicator z-40 h-9 w-9 btn btn-primary btn-soft btn-square border-none"
      onClick={onClick}>
      <MessageSquareMore size={20} />
      {unreadCounter?.unread_count > 0 && (
        <span
          aria-hidden="true"
          className="absolute top-0 right-0 h-2 w-2 rounded-full bg-success z-20"
        />
      )}
    </div>
  );
}
