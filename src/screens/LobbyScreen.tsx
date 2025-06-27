import { Button, Divider, Group, Stack, TextInput, Title } from "@mantine/core";
import { useState, useEffect } from "react";
import { useGameContext } from "../hooks/GameProvider";
import { useLocation } from "react-router-dom";
import { CardStack, Direction } from "../components/CardStack";
import { Card } from "../types";

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

  const cardStackData: Partial<Record<Direction, Card>> = {
    bottom: { color: 'yellow', number: 3 },
    left: { color: 'green', number: 5 },
    'top-middle': { color: 'blue', number: 9 },
    right: { color: 'pink', number: 1 },
  };
  const fiveCardExample: Partial<Record<Direction, Card>> = {
    bottom: { color: 'yellow', number: 2 },
    left: { color: 'green', number: 4 },
    'top-left': { color: 'pink', number: 6 },
    'top-right': { color: 'blue', number: 8 },
    right: { color: 'black', number: 1 },
  };
  const threeCardExample: Partial<Record<Direction, Card>> = {
    bottom: { color: 'yellow', number: 7 },
    'top-left': { color: 'green', number: 5 },
    'top-right': { color: 'blue', number: 3 },
  };
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
      <CardStack 
        startingDirection="bottom"
        cardFromThisDirection={cardStackData}
        width={100}
      />
      <CardStack
        startingDirection="left"
        cardFromThisDirection={fiveCardExample}
        width={100}
      />
      <CardStack
        startingDirection="top-left"
        cardFromThisDirection={threeCardExample}
        width={100}
      />
    </Stack>
  );
}
