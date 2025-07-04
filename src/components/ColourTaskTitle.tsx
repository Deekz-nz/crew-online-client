import { Text } from '@mantine/core';

interface ColorizedTaskTitleProps {
  text: string;
  size?: string;
}

const colorMap: Record<string, string> = {
  green: '#2E7D32',
  yellow: '#F57F17',
  blue: '#0D47A1',
  pink: '#AD1457',
  black: 'black',
};

export function ColorizedTaskTitle({ text, size = 'md' }: ColorizedTaskTitleProps) {
  const words = text.split(' ');

  return (
    <Text
      size={size}
      ta="center"
      c="black"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 4,
      }}
    >
      {words.map((word, index) => {
        const cleanWord = word.replace(/[^a-zA-Z]/g, ''); // strip punctuation for matching
        const color = colorMap[cleanWord.toLowerCase()];

        return (
          <span
            key={index}
            style={{
              color: color || undefined,
              fontWeight: color ? 700 : 600,
            }}
          >
            {color ? word.toUpperCase() : word}
          </span>
        );
      })}
    </Text>
  );
}
