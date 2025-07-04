import { Modal, Stack, Text, Button, Code } from '@mantine/core';

interface DisconnectModalProps {
  opened: boolean;
  reason?: string | null;
  logs: string[];
  onReconnect: () => void;
}

export default function DisconnectModal({ opened, reason, logs, onReconnect }: DisconnectModalProps) {
  return (
    <Modal opened={opened} onClose={() => {}} title="Connection Lost" centered closeOnClickOutside={false} closeOnEscape={false}>
      <Stack>
        <Text c="red" fw={600}>Disconnected{reason ? `: ${reason}` : ''}</Text>
        {logs.length > 0 && (
          <Code block>{logs.join('\n')}</Code>
        )}
        <Button mt="sm" onClick={onReconnect}>Reconnect</Button>
      </Stack>
    </Modal>
  );
}
