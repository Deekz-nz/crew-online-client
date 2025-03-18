import "@mantine/core/styles.css";
import { MantineProvider, Text } from "@mantine/core";
import { theme } from "./theme";

export default function App() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark" forceColorScheme="dark">
      <Text>Home</Text>
    </MantineProvider>);
}
