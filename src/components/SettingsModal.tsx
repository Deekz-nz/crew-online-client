// components/SettingsModal.tsx
import { Modal, Stack, Text, Divider, Switch } from '@mantine/core';
import { useUserSettings } from '../hooks/useUserSettings';

export interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const confirmWhenPlayingCard = useUserSettings(s => s.confirmWhenPlayingCard);
  const setSetting = useUserSettings(s => s.setSetting);

  return (
    <Modal opened={opened} onClose={onClose} title="Settings" centered>
      <Stack gap="sm">
        <Text fw={700}>Gameplay</Text>
        <Switch
          checked={confirmWhenPlayingCard}
          onChange={(e) => setSetting('confirmWhenPlayingCard', e.currentTarget.checked)}
          label="Confirm before playing a card"
          aria-label="Confirm before playing a card"
        />
        <Divider />

        {/* Future settings go here
        <Text fw={700}>Display</Text>
        <Switch label="Show card hints" />
        */}
      </Stack>
    </Modal>
  );
}
