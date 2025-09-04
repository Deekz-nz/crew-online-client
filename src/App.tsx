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
import HighScoresScreen from "./screens/HighScoresScreen";
import DisconnectModal from "./components/DisconnectModal";
import { Routes, Route } from "react-router-dom";

function AppContent() {
  const { room, gameStage, disconnectReason, connectionLogs, reconnect, clearDisconnectReason, joinPending } = useGameContext();
  const isJoined = !!room;

  let screen;
  if (!isJoined) {
    screen = (
      <Container>
        <Routes>
          <Route path="/highscores" element={<HighScoresScreen />} />
          <Route path="*" element={<LobbyScreen />} />
        </Routes>
      </Container>
    );
  } else if (gameStage === "not_started") {
    screen = (
      <Container>
        <GameSetupScreen />
      </Container>
    );
  } else if (gameStage === "game_setup") {
    screen = <TaskPhaseScreen />;
  } else if (gameStage === "game_end") {
    screen = <GameOverScreen />;
  } else {
    screen = <TrickPhaseScreen />;
  }

  return (
    <>
      {screen}
      <DisconnectModal
        opened={!!disconnectReason}
        reason={disconnectReason}
        logs={connectionLogs}
        onReconnect={reconnect}
        onClose={clearDisconnectReason}
        joinPending={joinPending}
      />
    </>
  );
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
