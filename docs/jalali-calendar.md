# Jalali (Solar Hijri) Calendar Guide

Tabulator Manager provides first-class support for the Jalali calendar system commonly used in Iran, Afghanistan, and Persian-speaking communities.

---

## Format Contract

Date strings must conform to either:
- Slash format: `YYYY/MM/DD` (e.g. `1403/08/15`)
- Hyphen format: `YYYY-MM-DD` (e.g. `1403-08-15`)

Month (`01`–`12`) and Day (`01`–`31`) are strictly 2-digit zero-padded numbers in canonical form.

---

## Persian Digits Normalization

Users frequently type dates using Persian or Arabic keyboard layouts. `normalizeDigits()` sanitizes inputs automatically:

| Original Input | Digits Subsystem | Normalized ASCII |
| :--- | :--- | :--- |
| `۱۴۰۳/۰۸/۱۵` | Persian (`۰-۹`) | `1403/08/15` |
| `١٤٠٣/٠٨/١٥` | Arabic-Indic (`٠-٩`) | `1403/08/15` |

```typescript
import { normalizeDigits } from "@tabulator-manager/core";

const ascii = normalizeDigits("۱۴۰۳/۰۸/۱۵");
// ascii === "1403/08/15"
```

---

## Range Separator Protocol

Date-range filters use the strict Persian separator `" تا "` (surrounded by single spaces):

```
<from_date> تا <to_date>
```

### Examples
- Both bounds: `۱۴۰۳/۰۱/۰۱ تا ۱۴۰۳/۰۶/۳۰`
- Open end: `۱۴۰۳/۰۱/۰۱ تا `
- Open start: ` تا ۱۴۰۳/۰۶/۳۰`

### Range Parser API

```typescript
import { StandardJalaliDateAdapter } from "@tabulator-manager/core";

const adapter = new StandardJalaliDateAdapter();

// Split into [from, to] tuple with normalized digits:
const [from, to] = adapter.splitRange("۱۴۰۳/۰۱/۰۱ تا ۱۴۰۳/۰۳/۳۱");
// from => "1403/01/01"
// to   => "1403/03/31"

// Join back into formatted range:
const range = adapter.joinRange("1403/01/01", "1403/03/31");
// range === "1403/01/01 تا 1403/03/31"
```

---

## Bidirectional Conversions

`StandardJalaliDateAdapter` handles astronomical conversion between the Jalali calendar and Gregorian ISO-8601 strings:

```typescript
// Jalali -> Gregorian
adapter.toGregorian("1403/01/01"); // "2024-03-20"
adapter.toGregorian("1403/08/15"); // "2024-11-05"

// Gregorian -> Jalali
adapter.toJalali("2024-03-20"); // "1403/01/01"
adapter.toJalali("2024-11-05"); // "1403/08/15"
```

---

## Backend Filtering in Laravel

In Laravel query definitions, Jalali date ranges can be converted into standard SQL datetime queries:

```php
'created_at' => [
    'column' => 'created_at',
    'sortable' => true,
    'operators' => ['=', '>=', '<=']
]
```
