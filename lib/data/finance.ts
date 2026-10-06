/** Spending categories for expenses. Income entries carry no category. */
export const SPENDING_CATEGORIES = [
  "Housing", "Food & groceries", "Eating out", "Transport", "Phone & subscriptions", "Tithe & giving",
  "Saving & investing", "Debt payments", "Family", "Clothes", "Fun", "Other",
] as const;

/** End-of-month reflection: where the money went and what changes next. `key` is the finance_reflections column. */
export const MONEY_PROMPTS = [
  { key: "went_well", question: "What went well with money this month?" },
  { key: "surprised", question: "Where did money go that surprised you?" },
  { key: "change_next", question: "One change for next month" },
] as const;

export const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
