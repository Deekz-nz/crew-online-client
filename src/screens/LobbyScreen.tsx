import { Button, Input, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { useGameContext } from "../hooks/GameProvider";

/**
 * LobbyScreen
 * -----------
 * First screen shown before joining a game.
 *
 * - Allows player to enter a display name.
 * - Calls joinRoom() from GameProvider when the "Join Room" button is clicked.
 *
 * Placeholder for future enhancements:
 * - Room list, game settings, or room creation.
 */

export default function LobbyScreen() {
  const { joinRoom } = useGameContext();
  const [displayName, setDisplayName] = useState("");

  return (
    <Stack>
      <Title order={2}>Join The Crew</Title>
      <Input
        placeholder="Enter your display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.currentTarget.value)}
      />
      <Button onClick={() => joinRoom(displayName)}>Join Room</Button>
    </Stack>
  );
}
