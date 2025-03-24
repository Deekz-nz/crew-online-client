import { Divider, Paper, Title, Text, Box } from "@mantine/core";
import { Card, SimpleTask } from "../types";
import { GameHand } from "./GameHand";
import { TaskCard } from "./TaskCard";

// Player recap component to display a player's starting hand and tasks
interface PlayerRecapProps {
  playerName: string;
  hand: Card[];
  tasks: SimpleTask[];
}

export const PlayerRecap: React.FC<PlayerRecapProps> = ({ playerName, hand, tasks }) => {
  return (
    <Paper shadow="sm" p="md" mb="md" withBorder>
      <Title order={3} mb="xs">{playerName}</Title>
      <Divider mb="md" />
      
      <Text fw={600} mb="xs">Starting Hand</Text>
      <Box mb="lg">
        <GameHand 
          hand={hand} 
          overlap={true} 
          cardWidth={60} 
          disabled={true}
          lowToHigh={true}
        />
      </Box>
      
      {tasks.length > 0 && (
        <>
          <Text fw={600} mb="xs">Allocated Tasks</Text>
          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {tasks.map((task, index) => (
              <TaskCard 
                key={index} 
                task={task} 
                width={60} 
                disabled={true}
              />
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
};