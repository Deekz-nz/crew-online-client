/* src/screens/HighScoresScreen.tsx */
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Button,
  Checkbox,
  Group,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { HighScore } from "../types";
import { HighScoreItem } from "../components/HighScoreItem";

export default function HighScoresScreen() {
  const [scores, setScores] = useState<HighScore[]>([]);
  const [playerCount, setPlayerCount] = useState<"ALL" | "3" | "4" | "5">(
    "ALL"
  );
  const [includeUndo, setIncludeUndo] = useState<boolean>(false);

  const wsUrl = import.meta.env.VITE_COLYSEUS_URL as string;
  const httpUrl = wsUrl.replace(/^ws/, "http").replace(/\/$/, "");

  /** GET */
  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch(`${httpUrl}/highscores`);
      if (res.ok) setScores(await res.json());
    } catch (err) {
      console.error("Failed to fetch high scores", err);
    }
  }, [httpUrl]);

  /** POST (debug) */
  const addRandomScore = async () => {
    try {
      const res = await fetch(`${httpUrl}/highscores/random`, {
        method: "POST",
      });
      if (res.ok) await fetchScores();
    } catch (err) {
      console.error("Failed to create random highscore", err);
    }
  };

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  // ─────── derived, filtered + sorted list ───────
  const visibleScores = useMemo(() => {
    return scores
      .filter((s) => {
        if (!includeUndo && s.undoUsed) return false;
        if (playerCount !== "ALL" && s.players.length !== Number(playerCount))
          return false;
        return true;
      })
      .sort((a, b) => {
        if (b.difficulty !== a.difficulty)
          return b.difficulty - a.difficulty; // higher first
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ); // newer first
      });
  }, [scores, playerCount, includeUndo]);

  // ─────── UI ───────
  return (
    <Stack p="md" gap="md">
      {/* Top-left controls */}
      <Group gap="xs">
        <Button component={Link} to="/" variant="light" size="sm">
          ← Lobby
        </Button>
        <Button onClick={addRandomScore} variant="light" size="sm">
          + Random
        </Button>
      </Group>

      <Title order={2} mt="xs">
        Expansion High Scores
      </Title>
      <Text>
        Only the expansion variant of the game stores highscores.
      </Text>

      {/* Filters */}
      <Group>
        <SegmentedControl
          value={playerCount}
          onChange={(v) => setPlayerCount(v as any)}
          data={[
            { label: "All", value: "ALL" },
            { label: "Three", value: "3" },
            { label: "Four", value: "4" },
            { label: "Five", value: "5" },
          ]}
          size="sm"
        />
        <Checkbox
          label="Include games with Undo"
          checked={includeUndo}
          onChange={(e) => setIncludeUndo(e.currentTarget.checked)}
        />
      </Group>

      {/* List */}
      <ScrollArea h="65vh" pr="sm" type="always" offsetScrollbars>
        <Stack gap="sm">
          {visibleScores.map((s) => (
            <HighScoreItem key={s.id} score={s} />
          ))}
          {visibleScores.length === 0 && (
            <Text c="dimmed">No scores match those filters.</Text>
          )}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}
