// components/SettingsModal.tsx
import { Modal, Stack, Text, Divider, Switch, Slider } from '@mantine/core';
import { useUserSettings } from '../hooks/useUserSettings';

export interface SettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const confirmWhenPlayingCard = useUserSettings((s) => s.confirmWhenPlayingCard);
  const cardHoverScale = useUserSettings((s) => s.cardHoverScale);
  const showReactionPanel = useUserSettings((s) => s.showReactionPanel);
  const handCardSize = useUserSettings((s) => s.handCardSize);
  const communicateCardSize = useUserSettings((s) => s.communicateCardSize);
  const setSetting = useUserSettings((s) => s.setSetting);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Settings"
      centered
    >
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

        {/* Card hover scale */}
        <Stack gap={2}>
          <Text size="md" fw={500}>
            Card hover scale: {cardHoverScale?.toFixed(2)}×
          </Text>
          <Slider
            size="md"
            value={cardHoverScale ?? 1.2}
            onChange={(v) => setSetting('cardHoverScale', v)}
            min={1}
            max={2}
            step={0.05}
            aria-label="Card hover scale"
            // ticks only, no text labels to avoid overlap
            marks={[{ value: 1 }, { value: 1.2 }, { value: 1.5 }, { value: 2 }]}
            mt={4}
            mb="sm"
          />
        </Stack>

        {/* Hand card size */}
        <Stack gap={2}>
          <Text size="md" fw={500}>
            Hand card size: {handCardSize}px
          </Text>
          <Slider
            size="md"
            value={handCardSize ?? 120}
            onChange={(v) => setSetting('handCardSize', v)}
            min={80}
            max={200}
            step={1}
            aria-label="Hand card size"
            marks={[{ value: 80 }, { value: 120 }, { value: 160 }, { value: 200 }]}
            mt={4}
            mb="sm"
          />
        </Stack>

        {/* Communicated card size */}
        <Stack gap={2}>
          <Text size="md" fw={500}>
            Communicated card size: {communicateCardSize}px
          </Text>
          <Slider
            size="md"
            value={communicateCardSize ?? 80}
            onChange={(v) => setSetting('communicateCardSize', v)}
            min={60}
            max={160}
            step={1}
            aria-label="Communicated card size"
            marks={[{ value: 60 }, { value: 100 }, { value: 130 }, { value: 160 }]}
            mt={4}
            mb="sm"
          />
        </Stack>

        <Divider />

        {/* Move this to the end as requested */}
        <Switch
          size="md"
          checked={showReactionPanel}
          onChange={(e) => setSetting('showReactionPanel', e.currentTarget.checked)}
          label="Show reaction panel"
          aria-label="Show reaction panel"
        />
      </Stack>
    </Modal>
  );
}
