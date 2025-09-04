import { useEffect, useState } from "react";
import { Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { useGameContext } from "../hooks/GameProvider";

interface AvailableRoom {
  roomId: string;
  clients: number;
  maxClients: number;
  metadata: Record<string, unknown>;
}

interface RoomListProps {
  displayName: string;
}

export function RoomList({ displayName }: RoomListProps) {
  const { joinRoom, joinPending } = useGameContext();
  const [rooms, setRooms] = useState<AvailableRoom[]>([]);

  const fetchRooms = async () => {
    try {
      const wsUrl = import.meta.env.VITE_COLYSEUS_URL as string;
      const httpUrl = wsUrl.replace(/^ws/, "http");
      const response = await fetch(`${httpUrl.replace(/\/$/, "")}/available_rooms`);
      if (response.ok) {
        const data = await response.json();
        setRooms(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleJoin = (roomId: string) => {
    if (displayName.trim()) {
      localStorage.setItem("displayName", displayName);
      joinRoom(displayName, roomId);
    }
  };

  return (
    <Stack align="center" gap="sm" mt="lg">
      <Title order={3}>Available Rooms</Title>
      {rooms.map((room) => (
        <Card key={room.roomId} withBorder w={300}>
          <Group justify="space-between">
            <Text fw={600}>{room.roomId}</Text>
            <Text>
              {room.clients}/{room.maxClients}
            </Text>
          </Group>
          <Button size="xl" mt="sm" fullWidth onClick={() => handleJoin(room.roomId)} loading={joinPending} disabled={joinPending}>
            Join Room
          </Button>
        </Card>
      ))}
      {rooms.length === 0 && <Text size="sm">No rooms available.</Text>}
    </Stack>
  );
}
