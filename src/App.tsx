import "@mantine/core/styles.css";
import { MantineProvider, Container } from "@mantine/core";
import { theme } from "./theme";
import { Notifications } from '@mantine/notifications';
import { GameProvider, useGameContext } from "./hooks/GameProvider";
import LobbyScreen from "./screens/LobbyScreen";
import GameSetupScreen from "./screens/GameSetupScreen";
import TaskPhaseScreen from "./screens/TaskPhaseScreen";
import TrickPhaseScreen from "./screens/TrickPhaseScreen";
import GameOverScreen from "./screens/GameOverScreen";

function AppContent() {
  const { room, gameStage } = useGameContext();
  const isJoined = !!room;

  if (!isJoined) {
    return (
      <Container>
        <LobbyScreen />
      </Container>
    );
  }

  if (gameStage === "not_started") {
    return (
      <Container>
        <GameSetupScreen />
      </Container>
    );
  }

  // Gameplay Phases
  if (gameStage === "game_setup") {
    return <TaskPhaseScreen />;
  }

  if (gameStage === "game_end") {
    return <GameOverScreen />;
  }
  
  return <TrickPhaseScreen />;
}

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
      <Notifications />
      <GameProvider>
        <AppContent />
      </GameProvider>
    </MantineProvider>
  );
}
