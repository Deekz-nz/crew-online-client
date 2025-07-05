import { SimpleGrid, Button } from "@mantine/core";
import { useGameContext } from "../hooks/GameProvider";

const EMOJIS: { label: string; symbol: string }[] = [
  { label: "ANGRY", symbol: "😡" },
  { label: "PARTY", symbol: "🎉" },
  { label: "CONFUSED", symbol: "❓" },
  { label: "LOVE", symbol: "❤" },
];

export default function EmojiSendPanel() {
  const { sendEmoji } = useGameContext();

  return (
    <SimpleGrid cols={2} spacing="xs" w="100%">
      {EMOJIS.map(({ label, symbol }) => (
        <Button
          key={label}
          variant="outline"
          size="md"
          onClick={() => sendEmoji(label)}
          style={{ fontSize: "1.5rem", padding: 4 }}
        >
          {symbol}
        </Button>
      ))}
    </SimpleGrid>
  );
}
