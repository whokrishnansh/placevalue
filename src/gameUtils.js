// Level configurations
export const LEVELS = [
  {
    level: 1,
    name: "Hundreds",
    maxMultiplier: 100,
    digitCount: 3,
    machines: [
      { multiplier: 1, label: "Ones", shortLabel: "O" },
      { multiplier: 10, label: "Tens", shortLabel: "T" },
      { multiplier: 100, label: "Hundreds", shortLabel: "H" },
    ],
  },
  {
    level: 2,
    name: "Thousands",
    maxMultiplier: 1000,
    digitCount: 4,
    machines: [
      { multiplier: 1, label: "Ones", shortLabel: "O" },
      { multiplier: 10, label: "Tens", shortLabel: "T" },
      { multiplier: 100, label: "Hundreds", shortLabel: "H" },
      { multiplier: 1000, label: "Thousands", shortLabel: "Th" },
    ],
  },
  {
    level: 3,
    name: "Ten Thousands",
    maxMultiplier: 10000,
    digitCount: 5,
    machines: [
      { multiplier: 1, label: "Ones", shortLabel: "O" },
      { multiplier: 10, label: "Tens", shortLabel: "T" },
      { multiplier: 100, label: "Hundreds", shortLabel: "H" },
      { multiplier: 1000, label: "Thousands", shortLabel: "Th" },
      { multiplier: 10000, label: "Ten Thousands", shortLabel: "TTh" },
    ],
  },
  {
    level: 4,
    name: "Lakhs",
    maxMultiplier: 100000,
    digitCount: 6,
    machines: [
      { multiplier: 1, label: "Ones", shortLabel: "O" },
      { multiplier: 10, label: "Tens", shortLabel: "T" },
      { multiplier: 100, label: "Hundreds", shortLabel: "H" },
      { multiplier: 1000, label: "Thousands", shortLabel: "Th" },
      { multiplier: 10000, label: "Ten Thousands", shortLabel: "TTh" },
      { multiplier: 100000, label: "Lakhs", shortLabel: "L" },
    ],
  },
  {
    level: 5,
    name: "Ten Lakhs",
    maxMultiplier: 1000000,
    digitCount: 7,
    machines: [
      { multiplier: 1, label: "Ones", shortLabel: "O" },
      { multiplier: 10, label: "Tens", shortLabel: "T" },
      { multiplier: 100, label: "Hundreds", shortLabel: "H" },
      { multiplier: 1000, label: "Thousands", shortLabel: "Th" },
      { multiplier: 10000, label: "Ten Thousands", shortLabel: "TTh" },
      { multiplier: 100000, label: "Lakhs", shortLabel: "L" },
      { multiplier: 1000000, label: "Ten Lakhs", shortLabel: "TL" },
    ],
  },
];

/**
 * Generate a random target number for a given level.
 * The first digit is never 0.
 */
export function generateTarget(level) {
  const config = LEVELS[level - 1];
  const digitCount = config.digitCount;

  // Generate each digit: first digit is 1-9, rest are 0-9
  const digits = [];
  digits.push(Math.floor(Math.random() * 9) + 1); // first digit 1-9
  for (let i = 1; i < digitCount; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }

  // Construct the number
  let target = 0;
  for (let i = 0; i < digits.length; i++) {
    target += digits[i] * Math.pow(10, digitCount - 1 - i);
  }

  return target;
}

/**
 * Generate random digit bubbles for a given level.
 * Includes exactly the digits of the target number, plus some extra distractors.
 */
export function generateBubbles(target, level) {
  const config = LEVELS[level - 1];
  const digitCount = config.digitCount;

  // Extract target digits
  const targetStr = target.toString().padStart(digitCount, "0");
  const targetDigits = targetStr.split("").map(Number);

  // Create bubble list = target digits + a few extra random digits
  const extraCount = Math.max(0, Math.min(3, 7 - digitCount));
  const extras = [];
  for (let i = 0; i < extraCount; i++) {
    extras.push(Math.floor(Math.random() * 10));
  }

  const allDigits = [...targetDigits, ...extras];

  // Shuffle
  for (let i = allDigits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allDigits[i], allDigits[j]] = [allDigits[j], allDigits[i]];
  }

  return allDigits.map((digit, idx) => ({
    id: `bubble-${idx}-${digit}-${Date.now()}`,
    digit,
    colorIndex: idx % 7,
  }));
}

/**
 * Format a multiplier for display: ×1, ×10, ×100, etc.
 */
export function formatMultiplier(multiplier) {
  return `×${multiplier.toLocaleString()}`;
}

/**
 * Build the expanded form expression string from placed digits.
 * Returns something like "600 + 10 + 5"
 */
export function buildExpression(placements, machines) {
  const parts = [];

  // Sort by multiplier descending so largest place value comes first
  const sorted = [...machines]
    .filter((m) => placements[m.multiplier] !== undefined)
    .sort((a, b) => b.multiplier - a.multiplier);

  for (const machine of sorted) {
    const digit = placements[machine.multiplier];
    const value = digit * machine.multiplier;
    if (value > 0) {
      parts.push(value.toLocaleString());
    }
  }

  return parts.length > 0 ? parts.join(" + ") : "";
}

/**
 * Compute the total from current placements.
 */
export function computeTotal(placements) {
  let total = 0;
  for (const [multiplier, digit] of Object.entries(placements)) {
    total += digit * Number(multiplier);
  }
  return total;
}

/**
 * Format a number for display with commas (Indian format for lakhs/ten lakhs).
 */
export function formatNumber(num) {
  if (num === 0) return "0";
  return num.toLocaleString("en-IN");
}
