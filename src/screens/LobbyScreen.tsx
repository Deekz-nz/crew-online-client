import { Button, Group, Input, Stack, Title } from "@mantine/core";
import { useState } from "react";
import { useGameContext } from "../hooks/GameProvider";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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
  const { joinRoom, createRoom } = useGameContext();
  const location = useLocation();
  
  const [displayName, setDisplayName] = useState(() => {
    return localStorage.getItem("displayName") || "";
  });
  
  const [roomCode, setRoomCode] = useState("");

  useEffect(() => {
    const pathCode = location.pathname.slice(1).toUpperCase();
    if (pathCode && pathCode.length === 6 && /^[A-Z]+$/.test(pathCode)) {
      setRoomCode(pathCode);
  
      const savedName = localStorage.getItem("displayName");
      if (savedName) {
        // Auto-join room
        joinRoom(savedName, pathCode);
      }
    }
  }, [location.pathname]);

  return (
    <Stack>
      <Title order={2}>Join The Crew</Title>
      <Input
        placeholder="Enter your display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.currentTarget.value)}
      />

      <Group grow>
        <Button onClick={() => createRoom(displayName)}>Create Room</Button>
        <Input
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.currentTarget.value.toUpperCase())}
        />
        <Button
          onClick={() => {
            if (displayName.trim()) {
              localStorage.setItem("displayName", displayName);
              joinRoom(displayName, roomCode);
            }
          }}
        >
          Join Room
        </Button>
      </Group>
    </Stack>
  );
}
