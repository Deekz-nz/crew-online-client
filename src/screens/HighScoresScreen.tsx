import { useEffect } from "react";
import { Button, Stack, Title } from "@mantine/core";
import { Link } from "react-router-dom";
import { HighScore } from "../types";

export default function HighScoresScreen() {
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const wsUrl = import.meta.env.VITE_COLYSEUS_URL as string;
        const httpUrl = wsUrl.replace(/^ws/, "http");
        const res = await fetch(`${httpUrl.replace(/\/$/, "")}/highscores`);
        if (res.ok) {
          const data: HighScore[] = await res.json();
          console.log("Highscores:", data);
        }
      } catch (err) {
        console.error("Failed to fetch high scores", err);
      }
    };

    fetchScores();
  }, []);

  return (
    <Stack align="center" gap="lg" mt="xl">
      <Title order={1}>High Scores</Title>
      <Button component={Link} to="/" variant="light" size="lg">
        Back to Lobby
      </Button>
    </Stack>
  );
}
