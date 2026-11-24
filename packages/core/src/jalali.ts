// Jalali calendar contract and adapters.
// Strict format contract: "YYYY-MM-DD" or "YYYY/MM/DD" (with 4-digit year, 2-digit month, 2-digit day).
// Range separator: " تا ".
// Supports Persian digits (۰-۹) and Arabic digits (٠-٩).

export interface JalaliDateAdapter {
  // Convert a Jalali date string "jYYYY/jMM/jDD" or "jYYYY-jMM-jDD" to a Gregorian ISO date "YYYY-MM-DD".
  toGregorian(jalali: string): string | null;
  // Convert a Gregorian ISO date "YYYY-MM-DD" to a Jalali date string "jYYYY/jMM/jDD".
  toJalali(gregorianISO: string): string | null;
  // Format a Jalali date for display (locale aware).
  format(jalali: string, options?: Intl.DateTimeFormatOptions): string;
  // Split a range value "from تا to" into [from, to] Jalali date strings.
  splitRange(value: string): [string | null, string | null];
  // Join two Jalali dates into a range value "from تا to".
  joinRange(from: string | null, to: string | null): string;
}

export const RANGE_SEPARATOR = " تا ";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/**
 * Normalize Persian and Arabic digits to standard ASCII digits (0-9).
 */
export function normalizeDigits(input: string): string {
  if (!input) return "";
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.split(PERSIAN_DIGITS[i]).join(String(i));
    result = result.split(ARABIC_DIGITS[i]).join(String(i));
  }
  return result;
}

const STRICT_DATE_REGEX = /^(\d{4})[-/](\d{2})[-/](\d{2})$/;
const LOOSE_DATE_REGEX = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/;

/**
 * Validate that a date string matches strict YYYY-MM-DD or YYYY/MM/DD format.
 */
export function isValidDateFormat(value: string): boolean {
  const normalized = normalizeDigits(value.trim());
  return STRICT_DATE_REGEX.test(normalized);
}

/**
 * Parse a date string into year, month, and day integers.
 */
export function parseDateParts(
  value: string,
  strict = false
): { year: number; month: number; day: number } | null {
  const normalized = normalizeDigits(value.trim());
  const regex = strict ? STRICT_DATE_REGEX : LOOSE_DATE_REGEX;
  const match = normalized.match(regex);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

/**
 * Pad a number with leading zeroes to 2 digits.
 */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * Standard production-grade Jalali date adapter with bidirectional conversion,
 * Persian digit normalization, and range parsing.
 */
export class StandardJalaliDateAdapter implements JalaliDateAdapter {
  toGregorian(jalali: string): string | null {
    if (!jalali) return null;
    const parts = parseDateParts(jalali);
    if (!parts) return null;
    const { year: jy, month: jm, day: jd } = parts;

    // Day of year in Jalali calendar
    const dayOfYear =
      jm <= 6 ? (jm - 1) * 31 + jd : 186 + (jm - 7) * 30 + jd;
    const base = Date.UTC(jy + 621, 2, 20);
    const approx = new Date(base + (dayOfYear - 1) * 86400000);

    const formatter = new Intl.DateTimeFormat("en-u-ca-persian", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    for (let offset = -4; offset <= 4; offset++) {
      const testDate = new Date(approx.getTime() + offset * 86400000);
      const fparts = formatter.formatToParts(testDate);
      const py = Number(fparts.find((p) => p.type === "year")?.value);
      const pm = Number(fparts.find((p) => p.type === "month")?.value);
      const pd = Number(fparts.find((p) => p.type === "day")?.value);
      if (py === jy && pm === jm && pd === jd) {
        return testDate.toISOString().slice(0, 10);
      }
    }

    return null;
  }

  toJalali(gregorianISO: string): string | null {
    if (!gregorianISO) return null;
    const parts = parseDateParts(gregorianISO);
    if (!parts) return null;
    const { year: gy, month: gm, day: gd } = parts;

    const date = new Date(Date.UTC(gy, gm - 1, gd));
    if (isNaN(date.getTime())) return null;

    const formatter = new Intl.DateTimeFormat("en-u-ca-persian", {
      timeZone: "UTC",
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const fparts = formatter.formatToParts(date);
    const jy = fparts.find((p) => p.type === "year")?.value;
    const jm = fparts.find((p) => p.type === "month")?.value?.padStart(2, "0");
    const jd = fparts.find((p) => p.type === "day")?.value?.padStart(2, "0");

    if (!jy || !jm || !jd) return null;
    return `${jy}/${jm}/${jd}`;
  }

  format(jalali: string, _options?: Intl.DateTimeFormatOptions): string {
    const normalized = normalizeDigits(jalali.trim());
    const parts = parseDateParts(normalized);
    if (!parts) return normalized;
    return `${parts.year}/${pad2(parts.month)}/${pad2(parts.day)}`;
  }

  splitRange(value: string): [string | null, string | null] {
    if (!value || value.trim() === "") return [null, null];
    const normalized = normalizeDigits(value);
    const parts = normalized.split(RANGE_SEPARATOR).map((p) => p.trim());
    if (parts.length === 2) return [parts[0] || null, parts[1] || null];
    if (parts.length === 1) return [parts[0] || null, null];
    return [null, null];
  }

  joinRange(from: string | null, to: string | null): string {
    const a = from ? normalizeDigits(from.trim()) : "";
    const b = to ? normalizeDigits(to.trim()) : "";
    if (!a && !b) return "";
    if (!a) return b;
    if (!b) return a;
    return `${a}${RANGE_SEPARATOR}${b}`;
  }
}

/**
 * Minimal fallback adapter that operates on Jalali strings without conversion.
 * Preserves legacy fallback behaviour.
 */
export class JalaliDateAdapterFallback implements JalaliDateAdapter {
  toGregorian(_jalali: string): string | null {
    return null;
  }

  toJalali(_gregorianISO: string): string | null {
    return null;
  }

  format(jalali: string, _options?: Intl.DateTimeFormatOptions): string {
    return jalali;
  }

  splitRange(value: string): [string | null, string | null] {
    if (!value || value.trim() === "") return [null, null];
    const parts = value.split(RANGE_SEPARATOR).map((p) => p.trim());
    if (parts.length === 2) return [parts[0] || null, parts[1] || null];
    if (parts.length === 1) return [parts[0] || null, null];
    return [null, null];
  }

  joinRange(from: string | null, to: string | null): string {
    const a = from ?? "";
    const b = to ?? "";
    if (!a && !b) return "";
    if (!a) return b;
    if (!b) return a;
    return `${a}${RANGE_SEPARATOR}${b}`;
  }
}
