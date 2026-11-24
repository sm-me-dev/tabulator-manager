export interface MockUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  score: number;
  created_at: string;
  jalali_date: string;
}

export interface MockOrder {
  id: number;
  order_number: string;
  customer: string;
  amount: number;
  status: "completed" | "processing" | "cancelled";
  order_date: string;
}

const ROLES = ["Admin", "Engineer", "Designer", "Product Manager", "Lead Architect", "QA Analyst"];
const STATUSES = ["active", "active", "active", "inactive", "pending"] as const;
const FIRST_NAMES = ["Sarah", "Alex", "Elena", "Marcus", "Kaveh", "Roya", "David", "Zara", "Nima", "Chloe", "Liam", "Fatemeh"];
const LAST_NAMES = ["Chen", "Vance", "Rostami", "Sterling", "Tehrani", "Miller", "Rad", "Kim", "Moradi", "Taylor", "Nazari", "Novak"];

export const MOCK_USERS: MockUser[] = Array.from({ length: 65 }, (_, i) => {
  const id = i + 1;
  const fn = FIRST_NAMES[i % FIRST_NAMES.length];
  const ln = LAST_NAMES[(i * 3) % LAST_NAMES.length];
  const role = ROLES[i % ROLES.length];
  const status = STATUSES[i % STATUSES.length];
  const score = 40 + ((i * 17) % 60);

  // Generate date in 1403 Jalali / 2024 Gregorian
  const day = 1 + (i % 28);
  const month = 1 + (i % 9);
  const jalaliMonthStr = month < 10 ? `0${month}` : `${month}`;
  const jalaliDayStr = day < 10 ? `0${day}` : `${day}`;
  const jalali_date = `1403/${jalaliMonthStr}/${jalaliDayStr}`;

  const gregMonth = 3 + month;
  const gregMonthStr = gregMonth < 10 ? `0${gregMonth}` : `${gregMonth}`;
  const created_at = `2024-${gregMonthStr}-${jalaliDayStr}`;

  return {
    id,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}${id}@company.internal`,
    role,
    status,
    score,
    created_at,
    jalali_date,
  };
});

export const MOCK_ORDERS: MockOrder[] = Array.from({ length: 50 }, (_, i) => {
  const id = 1000 + i + 1;
  const user = MOCK_USERS[i % MOCK_USERS.length];
  const amount = 150 + ((i * 83) % 4500);
  const statuses = ["completed", "completed", "processing", "cancelled"] as const;
  const status = statuses[i % statuses.length];

  const day = 1 + ((i * 3) % 28);
  const month = 1 + (i % 8);
  const monthStr = month < 10 ? `0${month}` : `${month}`;
  const dayStr = day < 10 ? `0${day}` : `${day}`;
  const order_date = `1403/${monthStr}/${dayStr}`;

  return {
    id,
    order_number: `ORD-2026-${1000 + i}`,
    customer: user.name,
    amount,
    status,
    order_date,
  };
});
