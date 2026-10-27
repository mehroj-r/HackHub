// Keyboard entry for the scorecard's number buttons: keys 0–9 set the focused
// criterion. Scores can have two digits (max 10, or more), so digits typed
// quickly one after another build one number, like typing in a field. Pure, so
// Vitest covers it; the scorecard owns the timer.

/** How long after a digit the next one still extends the same number. */
export const DIGIT_WINDOW_MS = 800;

/**
 * The score after typing `digit`, given what was typed just before (`buffer`,
 * "" when the window has passed). Extends the buffer while the number stays
 * within 0–max; otherwise starts again from the new digit. Returns null when
 * even the digit alone is out of range (e.g. "7" with max 5).
 */
export function typeDigit(
  buffer: string,
  digit: string,
  max: number,
): { value: number; buffer: string } | null {
  if (!/^\d$/.test(digit)) return null;
  const extended = `${buffer}${digit}`.replace(/^0+(?=\d)/, "");
  if (buffer !== "" && Number(extended) <= max) {
    return { value: Number(extended), buffer: extended };
  }
  if (Number(digit) <= max) return { value: Number(digit), buffer: digit };
  return null;
}

/** Whether another digit could still extend `buffer` within 0–max. */
export function canExtend(buffer: string, max: number): boolean {
  return buffer !== "" && Number(buffer) !== 0 && Number(buffer) * 10 <= max;
}
