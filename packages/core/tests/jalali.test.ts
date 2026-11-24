import {
  JalaliDateAdapterFallback,
  StandardJalaliDateAdapter,
  normalizeDigits,
  isValidDateFormat,
  type JalaliDateAdapter,
} from "../src/index.js";

describe("JalaliDateAdapterFallback (v1 stub)", () => {
  let adapter: JalaliDateAdapterFallback;

  beforeEach(() => {
    adapter = new JalaliDateAdapterFallback();
  });

  it("toGregorian returns null (no conversion in v1)", () => {
    expect(adapter.toGregorian("1402/01/01")).toBeNull();
  });

  it("toJalali returns null (no conversion in v1)", () => {
    expect(adapter.toJalali("2023-03-21")).toBeNull();
  });

  it("format returns the input unchanged", () => {
    expect(adapter.format("1402/01/01")).toBe("1402/01/01");
  });

  it("splitRange splits on ' تا ' separator", () => {
    expect(adapter.splitRange("1402/01/01 تا 1402/03/15")).toEqual([
      "1402/01/01",
      "1402/03/15",
    ]);
  });

  it("splitRange handles multi-part strings by returning null tuple", () => {
    expect(adapter.splitRange("1402/01/01 تا 1402/02/01 تا 1402/03/01")).toEqual([
      null,
      null,
    ]);
  });

  it("splitRange handles single date", () => {
    expect(adapter.splitRange("1402/01/01")).toEqual(["1402/01/01", null]);
  });

  it("splitRange handles empty string", () => {
    expect(adapter.splitRange("")).toEqual([null, null]);
    expect(adapter.splitRange("   ")).toEqual([null, null]);
  });

  it("joinRange joins two dates with ' تا ' separator", () => {
    expect(adapter.joinRange("1402/01/01", "1402/03/15")).toBe(
      "1402/01/01 تا 1402/03/15"
    );
  });

  it("joinRange handles null values", () => {
    expect(adapter.joinRange(null, null)).toBe("");
    expect(adapter.joinRange("1402/01/01", null)).toBe("1402/01/01");
    expect(adapter.joinRange(null, "1402/03/15")).toBe("1402/03/15");
  });

  it("implements JalaliDateAdapter interface", () => {
    const check = (a: JalaliDateAdapter) => a;
    expect(check(adapter)).toBe(adapter);
  });
});

describe("StandardJalaliDateAdapter (production conversion & Persian digits)", () => {
  let adapter: StandardJalaliDateAdapter;

  beforeEach(() => {
    adapter = new StandardJalaliDateAdapter();
  });

  it("converts Jalali to Gregorian ISO accurately", () => {
    // 1403/01/01 corresponds to 2024-03-20
    expect(adapter.toGregorian("1403/01/01")).toBe("2024-03-20");
    expect(adapter.toGregorian("1403-01-01")).toBe("2024-03-20");
    // 1403/08/15 corresponds to 2024-11-05
    expect(adapter.toGregorian("1403/08/15")).toBe("2024-11-05");
  });

  it("converts Gregorian ISO to Jalali accurately", () => {
    expect(adapter.toJalali("2024-03-20")).toBe("1403/01/01");
    expect(adapter.toJalali("2024-11-05")).toBe("1403/08/15");
  });

  it("handles Persian and Arabic digits seamlessly", () => {
    // Persian: ۱۴۰۳/۰۱/۰۱
    expect(adapter.toGregorian("۱۴۰۳/۰۱/۰۱")).toBe("2024-03-20");
    expect(adapter.toGregorian("۱۴۰۳-۰۸-۱۵")).toBe("2024-11-05");
  });

  it("formats dates with normalized digits and padding", () => {
    expect(adapter.format("۱۴۰۳/۱/۵")).toBe("1403/01/05");
    expect(adapter.format("1403-8-15")).toBe("1403/08/15");
    expect(adapter.format("invalid")).toBe("invalid");
  });

  it("splits date ranges with Persian digits and ' تا ' separator", () => {
    const range = "۱۴۰۳/۰۸/۱۵ تا ۱۴۰۳/۰۸/۳۰";
    const [from, to] = adapter.splitRange(range);
    expect(from).toBe("1403/08/15");
    expect(to).toBe("1403/08/30");
  });

  it("joins date ranges cleanly", () => {
    expect(adapter.joinRange("1403/08/15", "1403/08/30")).toBe(
      "1403/08/15 تا 1403/08/30"
    );
    expect(adapter.joinRange("۱۴۰۳/۰۸/۱۵", null)).toBe("1403/08/15");
    expect(adapter.joinRange(null, "۱۴۰۳/۰۸/۳۰")).toBe("1403/08/30");
    expect(adapter.joinRange(null, null)).toBe("");
  });

  it("returns null on invalid formats or empty inputs", () => {
    expect(adapter.toGregorian("")).toBeNull();
    expect(adapter.toGregorian("invalid-date")).toBeNull();
    expect(adapter.toJalali("")).toBeNull();
    expect(adapter.toJalali("2024/99/99")).toBeNull();
    expect(adapter.splitRange("")).toEqual([null, null]);
    expect(adapter.splitRange("a تا b تا c")).toEqual([null, null]);
  });
});

describe("Jalali helpers", () => {
  it("normalizes Persian and Arabic digits", () => {
    expect(normalizeDigits("۰۱۲۳۴۵۶۷۸۹")).toBe("0123456789");
    expect(normalizeDigits("٠١٢٣٤٥٦٧٨٩")).toBe("0123456789");
    expect(normalizeDigits("")).toBe("");
  });

  it("validates strict date formats (YYYY-MM-DD or YYYY/MM/DD)", () => {
    expect(isValidDateFormat("1403/08/15")).toBe(true);
    expect(isValidDateFormat("1403-08-15")).toBe(true);
    expect(isValidDateFormat("۱۴۰۳/۰۸/۱۵")).toBe(true);
    expect(isValidDateFormat("1403/8/15")).toBe(false);
    expect(isValidDateFormat("not-a-date")).toBe(false);
  });

  it("round-trips conversion between Jalali and Gregorian", () => {
    const adapter = new StandardJalaliDateAdapter();
    const jalali = adapter.toJalali("2026-11-24");
    expect(jalali).toBeTruthy();
    const greg = adapter.toGregorian(jalali!);
    expect(greg).toBe("2026-11-24");
  });
});
