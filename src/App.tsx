import "@mantine/core/styles.css";
import { MantineProvider, Container } from "@mantine/core";
import { theme } from "./theme";
import { Notifications } from '@mantine/notifications';
import { GameProvider, useGameContext } from "./hooks/GameProvider";
import LobbyScreen from "./screens/LobbyScreen";
import GameSetupScreen from "./screens/GameSetupScreen";
import GameplayScreen from "./screens/GameplayScreen";

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

  // Fullscreen layout for gameplay
  return <GameplayScreen />;
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
