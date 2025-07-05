import { Box, Text } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGameContext } from "../hooks/GameProvider";

const EMOJI_MAP: Record<string, string> = {
  ANGRY: "😡",
  PARTY: "🎉",
  CONFUSED: "❓",
  LOVE: "❤",
};

interface EmojiPayload {
  from: string;
  name: string;
  emoji: string;
  sentAt: number;
}

export default function EmojiReceiveArea() {
  const { room } = useGameContext();
  const [messages, setMessages] = useState<EmojiPayload[]>([]);

  useEffect(() => {
    if (!room) return;

    const handler = (payload: EmojiPayload) => {
      setMessages((msgs) => [...msgs, payload]);
      setTimeout(() => {
        setMessages((msgs) => msgs.filter((m) => m.sentAt !== payload.sentAt));
      }, 2500);
    };

    room.onMessage("player_emoji", handler);
    return () => {
      // @ts-ignore remove listener if available
      room.off?.("player_emoji", handler);
    };
  }, [room]);

  return (
    <Box style={{ position: "relative", width: "100%", height: "100%" }}>
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.sentAt}
            initial={{ y: -10, opacity: 1 }}
            animate={{ y: 40, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "1.5rem",
              whiteSpace: "nowrap",
            }}
          >
            <Text fw={700}>{msg.name}: {EMOJI_MAP[msg.emoji] ?? msg.emoji}</Text>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
}
