// utils/quotes.ts
export function getInspirationalQuote(): string {
  const quotes = [
    "Failure is just success... delayed. Very, very delayed.",
    "Maybe try not playing like a space potato next time.",
    "Every mission teaches you something. Mostly, what *not* to do.",
    "Even astronauts have bad days. You just have them more often.",
    "Success is just a few dozen retries away!",
    "Hey, at least you didn’t eject the captain. Yet.",
    "That round went so badly NASA called to revoke your license.",
    "Progress! You failed faster than last time.",
    "Maybe the real win was the chaos we caused along the way.",
    "Don't worry, no one else knew what was going on either.",
    "If at first you don’t succeed, blame your teammate's signal.",
    "You can’t spell *team* without *a mess*.",
    "It’s not failure. It’s *creative problem discovery*.",
    "The universe is vast, and so is your potential. Probably.",
    "Every great crew was once a bad crew that didn’t give up.",
    "Mistakes were made. Mostly by you. But we grow.",
    "You're just one mission away from greatness. Or another fail.",
    "That was... a choice. Let’s try again with less confusion.",
    "Failure builds character. Yours is now very, very built.",
    "Let’s face it, the aliens would’ve beaten us anyway."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
