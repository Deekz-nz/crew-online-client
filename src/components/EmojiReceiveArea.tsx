import { Box, Text } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
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

interface EmojiWithPosition extends EmojiPayload {
  leftOffset: number;
}

const DISPLAY_MS = 1_000;  // how long each bubble stays on-screen
const MOVE_PX   = 120;     // how far it drifts down

export default function EmojiReceiveArea() {
  const { room } = useGameContext();
  const [messages, setMessages] = useState<EmojiWithPosition[]>([]);

  /** stable helper so Strict Mode doesn’t duplicate listeners */
  const handleIncoming = useCallback((payload: EmojiPayload) => {
    const id = `${payload.from}-${payload.sentAt}`;

    setMessages(prev => {
      if (prev.some(m => `${m.from}-${m.sentAt}` === id)) return prev;

      const leftOffset = Math.floor(Math.random() * 80); // 10%–90%
      return [...prev, { ...payload, leftOffset }];
    });

    setTimeout(() => {
      setMessages(prev =>
        prev.filter(m => `${m.from}-${m.sentAt}` !== id)
      );
    }, DISPLAY_MS);
  }, []);

  /* subscribe / unsubscribe exactly once per room instance */
  useEffect(() => {
    if (!room) return;
    room.onMessage("player_emoji", handleIncoming);
  }, [room, handleIncoming]);

  return (
    <Box style={{ position: "relative", width: "100%", height: "100%" }}>
      <AnimatePresence>
        {messages.map(msg => (
          <motion.div
            key={`${msg.from}-${msg.sentAt}`}
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: MOVE_PX, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DISPLAY_MS / 1000 }}
            style={{
              position: "absolute",
              left: `${msg.leftOffset}%`,
              marginLeft: "0.75rem",
              fontSize: "1.25rem",
              whiteSpace: "nowrap",
              justifyItems: "center",
            }}
          >
            <Text fw={700} ta="center">
              {msg.name}
            </Text>
            <Text style={{ fontSize: "2.25rem" }}>
                {EMOJI_MAP[msg.emoji] ?? msg.emoji}
            </Text>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
}

