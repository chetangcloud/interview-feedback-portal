import { prisma } from "@/lib/db";
import type { Question } from "@prisma/client";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Computes a target Easy/Medium/Hard distribution for a given question count.
 * Default POC distribution for count=5 is 1 Easy / 3 Medium / 1 Hard.
 * For other counts, distributes roughly 20% Easy / 60% Medium / 20% Hard,
 * guaranteeing at least 1 of each when count >= 3.
 */
export function targetDistribution(count: number): { easy: number; medium: number; hard: number } {
  if (count === 5) return { easy: 1, medium: 3, hard: 1 };
  if (count <= 0) return { easy: 0, medium: 0, hard: 0 };
  if (count === 1) return { easy: 0, medium: 1, hard: 0 };
  if (count === 2) return { easy: 1, medium: 1, hard: 0 };

  let easy = Math.max(1, Math.round(count * 0.2));
  let hard = Math.max(1, Math.round(count * 0.2));
  let medium = count - easy - hard;
  if (medium < 1) {
    medium = 1;
    const remainder = count - medium;
    easy = Math.ceil(remainder / 2);
    hard = remainder - easy;
  }
  return { easy, medium, hard };
}

/**
 * Selects up to `count` active questions for a technology, honoring the
 * Easy/Medium/Hard target distribution, while excluding any question ids
 * already used in the current interview session (no repeats).
 */
export async function selectQuestionsForTechnology(
  technologyId: string,
  count: number,
  excludeQuestionIds: string[] = []
): Promise<Question[]> {
  const pool = await prisma.question.findMany({
    where: {
      technologyId,
      active: true,
      id: { notIn: excludeQuestionIds },
    },
  });

  const byDifficulty = {
    easy: shuffle(pool.filter((q) => q.difficulty === "easy")),
    medium: shuffle(pool.filter((q) => q.difficulty === "medium")),
    hard: shuffle(pool.filter((q) => q.difficulty === "hard")),
  };

  const target = targetDistribution(count);
  const selected: Question[] = [];
  const used = new Set<string>();

  const takeFrom = (bucket: Question[], n: number) => {
    let taken = 0;
    for (const q of bucket) {
      if (taken >= n) break;
      if (used.has(q.id)) continue;
      selected.push(q);
      used.add(q.id);
      taken++;
    }
  };

  takeFrom(byDifficulty.easy, target.easy);
  takeFrom(byDifficulty.medium, target.medium);
  takeFrom(byDifficulty.hard, target.hard);

  if (selected.length < count) {
    const remaining = shuffle(pool.filter((q) => !used.has(q.id)));
    takeFrom(remaining, count - selected.length);
  }

  return shuffle(selected).slice(0, count);
}
