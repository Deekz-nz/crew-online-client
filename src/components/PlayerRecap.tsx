import { Paper, Title, Box } from "@mantine/core";
import { Card } from "../types";
import { GameHand } from "./GameHand";

// Player recap component to display a player's starting hand and tasks
interface PlayerRecapProps {
  playerName: string;
  hand: Card[];
}

export const PlayerRecap: React.FC<PlayerRecapProps> = ({ playerName, hand }) => {
  return (
    <Paper shadow="sm" p="md" withBorder style={{ textAlign: 'center' }}>
      <Title order={4} mb="sm">{playerName}</Title>
      <Box>
        <GameHand 
          hand={hand} 
          overlap={true} 
          cardWidth={60} 
          disabled={true}
          lowToHigh={true}
          disableShadow
        />
      </Box>
    </Paper>
  );
};