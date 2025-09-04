// components/SettingsModal.tsx
import { Modal, Stack, Text, Divider, Switch, NumberInput } from '@mantine/core';
import { useUserSettings } from '../hooks/useUserSettings';

export interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const confirmWhenPlayingCard = useUserSettings(s => s.confirmWhenPlayingCard);
  const cardHoverScale = useUserSettings(s => s.cardHoverScale);
  const showReactionPanel = useUserSettings(s => s.showReactionPanel);
  const handCardSize = useUserSettings(s => s.handCardSize);
  const communicateCardSize = useUserSettings(s => s.communicateCardSize);
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

        <Text fw={700}>Display</Text>
        <NumberInput
          label="Card hover scale"
          value={cardHoverScale}
          onChange={(v) => setSetting('cardHoverScale', Number(v) || 1.2)}
          min={1}
          max={2}
          step={0.1}
        />
        <Switch
          checked={showReactionPanel}
          onChange={(e) => setSetting('showReactionPanel', e.currentTarget.checked)}
          label="Show reaction panel"
          aria-label="Show reaction panel"
        />
        <NumberInput
          label="Hand card size"
          value={handCardSize}
          onChange={(v) => setSetting('handCardSize', Number(v) || 120)}
          min={80}
          max={200}
        />
        <NumberInput
          label="Communicated card size"
          value={communicateCardSize}
          onChange={(v) => setSetting('communicateCardSize', Number(v) || 80)}
          min={60}
          max={160}
        />
      </Stack>
    </Modal>
  );
}
