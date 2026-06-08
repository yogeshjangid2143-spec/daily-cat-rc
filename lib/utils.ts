import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getDifficultyLabel(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return "Moderate";
    case 2:
      return "Hard";
    case 3:
      return "Very Hard";
    default:
      return "Unknown";
  }
}

export function getDifficultyColor(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-800/50";
    case 2:
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50";
    case 3:
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/50";
    default:
      return "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-400 border-gray-200 dark:border-gray-800";
  }
}

export function getISTDateString(): string {
  // Developer override: Simulate a specific date
  if (process.env.NEXT_PUBLIC_SIMULATE_DATE) {
    return process.env.NEXT_PUBLIC_SIMULATE_DATE;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const parts = formatter.formatToParts(new Date());
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  return `${year}-${month}-${day}`;
}
