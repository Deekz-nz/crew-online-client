import { Button, Divider, Group, Stack, TextInput, Title } from "@mantine/core";
import { useState, useEffect } from "react";
import { useGameContext } from "../hooks/GameProvider";
import { useLocation } from "react-router-dom";

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
      setRoomCode(pathCode); // ✅ Pre-fill only
    }
  }, [location.pathname]);

  const handleJoin = () => {
    if (displayName.trim()) {
      localStorage.setItem("displayName", displayName);
      joinRoom(displayName, roomCode);
    }
  };

  const handleCreate = () => {
    if (displayName.trim()) {
      localStorage.setItem("displayName", displayName);
      createRoom(displayName);
    }
  };

  // Same width for both rows
  const inputGroupWidth = 380;

  return (
    <Stack align="center" gap="lg" mt="xl">
      <Title order={1}>Join The Crew</Title>

      <TextInput
        placeholder="Enter your display name"
        value={displayName}
        onChange={(e) => setDisplayName(e.currentTarget.value)}
        size="lg"
        w={inputGroupWidth}
        label="Display name"
      />

      <Group gap="sm" align="flex-end" w={inputGroupWidth}>
        <TextInput
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.currentTarget.value.toUpperCase())}
          size="lg"
          flex="1"
          label="Room code"
        />
        <Button size="lg" onClick={handleJoin}>Join</Button>
      </Group>

      <Divider label="or" labelPosition="center" w={inputGroupWidth} />

      <Button size="lg" color="blue" onClick={handleCreate}>Create New Room</Button>
    </Stack>
  );
}
