import { Modal, Stack, Text, Button, Code } from '@mantine/core';

interface DisconnectModalProps {
  opened: boolean;
  reason?: string | null;
  logs: string[];
  onReconnect: () => void;
  onClose: () => void;
  joinPending: boolean;
}

export default function DisconnectModal({ opened, reason, logs, onReconnect, onClose, joinPending }: DisconnectModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="Connection Lost" centered>
      <Stack>
        <Text c="red" fw={600}>Disconnected{reason ? `: ${reason}` : ''}</Text>
        {logs.length > 0 && (
          <Code block>{logs.join('\n')}</Code>
        )}
        <Button mt="sm" onClick={onReconnect} loading={joinPending} disabled={joinPending}>Reconnect</Button>
      </Stack>
    </Modal>
  );
}
