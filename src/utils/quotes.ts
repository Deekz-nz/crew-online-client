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
    "Let’s face it, the aliens would’ve beaten us anyway.",
    "Next time try aiming for the cards, not your teammates.",
    "You just set a new record for how fast a crew can implode.",
    "Mission control wants their competency back.",
    "At least you provide the comic relief.",
    "I've seen toddlers manage oxygen levels better.",
    "Congratulations, you're the reason the aliens laugh at humans.",
    "You just discovered a new way to lose.",
    "Maybe space isn't your thing.",
    "If failure was an asteroid, you'd be the best at catching it.",
    "Try again once you remember which end of the rocket is up.",
    "I've seen monkeys pilot a shuttle better.",
    "Were you trying to lose? Because that was top-tier sabotage.",
    "Next mission: learn how to read instructions.",
    "Well, at least no aliens were harmed in this disaster.",
    "Your crew coordination needs a miracle and a manual.",
    "Rookie mistake after rookie mistake. Impressive.",
    "Do us all a favor and stick to cargo missions.",
    "You just put 'crash landing' on your résumé.",
    "Maybe space isn't for you after all.",
    "If failure was a race, you'd win gold every time."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

export function getSuccessQuote(): string {
  const quotes = [
    "Great work, crew!",
    "That was stellar teamwork!",
    "Mission accomplished! You make it look easy.",
    "The galaxy salutes your skills.",
    "You’ve earned a place in the space hall of fame!",
    "Your coordination was out of this world!",
    "Flawless victory, star cadets!",
    "Looks like all that training paid off!",
    "Exceptional job! The universe is safer now.",
    "You crushed it—onward to greater challenges.",
    "You navigated like pros—stellar work.",
    "The cosmos applauds your flawless execution.",
    "You made that look like a training simulation.",
    "Great synergy! Mission success was never in doubt.",
    "You’re one step closer to legend status.",
    "Outstanding teamwork, crew!",
    "Your mission performance deserves a medal.",
    "That was a textbook example of coordination.",
    "The galaxy is safer thanks to you.",
    "Unbelievable precision! Keep reaching for the stars."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
