"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
  addFinanceEntry, addAsset, deleteFinanceEntry, deleteAsset, addSavingsGoal, addToSavingsGoal, deleteSavingsGoal,
  saveFinanceReflection, type SimpleState,
} from "@/lib/actions/body-finance";
import { SPENDING_CATEGORIES, MONEY_PROMPTS } from "@/lib/data/finance";
import { Button, SubmitButton } from "@/components/ui/button";
import { Input, Select, Textarea, Label, FormError, FormNotice } from "@/components/ui/form";

export function FinanceEntryForm({ month }: { month: string }) {
  const [state, action] = useActionState<SimpleState, FormData>(addFinanceEntry, {});
  const [kind, setKind] = useState("variable");
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state.ok]);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-2">
      <input type="hidden" name="month" value={month} />
      <div className="grid grid-cols-[1fr_1fr] gap-2">
        <Select name="kind" value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Type"><option value="income">Income</option><option value="fixed">Fixed expense</option><option value="variable">Variable expense</option></Select>
        <Input name="amount" type="number" inputMode="decimal" min={0} step="0.01" placeholder="$ amount" required aria-label="Amount" />
      </div>
      {kind !== "income" && (
        <Select name="category" defaultValue="" aria-label="Category">
          <option value="">Category…</option>
          {SPENDING_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      )}
      <div className="flex gap-2">
        <Input name="label" placeholder="Rent, paycheck, groceries…" required aria-label="Label" />
        <SubmitButton className="shrink-0">Add</SubmitButton>
      </div>
      <FormError message={state.error} />
    </form>
  );
}

export function AssetForm() {
  const [state, action] = useActionState<SimpleState, FormData>(addAsset, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state.ok]);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_1fr] gap-2">
        <Select name="category" defaultValue="savings" aria-label="Category"><option value="savings">Savings</option><option value="vehicle">Vehicle</option><option value="real estate">Real estate</option><option value="investments">Investments</option><option value="business">Business</option><option value="other">Other</option></Select>
        <Input name="value" type="number" inputMode="decimal" min={0} step="1" placeholder="$ value" required aria-label="Value" />
      </div>
      <div className="flex gap-2">
        <Input name="label" placeholder="e.g. Emergency fund" required aria-label="Label" />
        <SubmitButton variant="secondary" className="shrink-0">Add asset</SubmitButton>
      </div>
      <FormError message={state.error} />
    </form>
  );
}

export function DeleteButton({ kind, id }: { kind: "entry" | "asset" | "goal"; id: string }) {
  const [pending, start] = useTransition();
  const run = () => {
    if (kind === "goal" && !confirm("Delete this savings goal?")) return;
    start(() => (kind === "entry" ? deleteFinanceEntry(id) : kind === "asset" ? deleteAsset(id) : deleteSavingsGoal(id)));
  };
  return <button type="button" aria-label="Delete" disabled={pending} onClick={run} className="text-ink-3 hover:text-danger"><Trash2 className="size-4" /></button>;
}

export function SavingsGoalForm() {
  const [state, action] = useActionState<SimpleState, FormData>(addSavingsGoal, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state.ok]);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-2">
      <Input name="title" placeholder="Saving for… (car, emergency fund, school)" required maxLength={80} aria-label="Goal" />
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <Input name="target" type="number" inputMode="decimal" min={1} step="1" placeholder="$ target" required aria-label="Target amount" />
        <Input name="due_date" type="date" aria-label="Target date (optional)" className="text-sm" />
        <SubmitButton variant="secondary">Add</SubmitButton>
      </div>
      <FormError message={state.error} />
    </form>
  );
}

/** Inline "+ $" control on a savings goal. A negative number withdraws. */
export function ContributeForm({ id }: { id: string }) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const res = await addToSavingsGoal(id, Number(amount));
      setError(res.error);
      if (!res.error) setAmount("");
    });
  };
  return (
    <form onSubmit={submit} className="flex items-center gap-2 mt-2">
      <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" inputMode="decimal" step="0.01" placeholder="$ put in" aria-label="Amount to add" className="h-9 text-sm" />
      <Button type="submit" size="sm" variant="secondary" disabled={pending || !amount}>Add</Button>
      {error && <span role="alert" className="text-xs text-danger">{error}</span>}
    </form>
  );
}

export function MoneyReflectionForm({ month, initial }: { month: string; initial: Partial<Record<(typeof MONEY_PROMPTS)[number]["key"], string | null>> }) {
  const [state, action] = useActionState<SimpleState, FormData>(saveFinanceReflection, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="month" value={month} />
      {MONEY_PROMPTS.map((p) => (
        <div key={p.key}>
          <Label htmlFor={`m-${p.key}`}>{p.question}</Label>
          <Textarea id={`m-${p.key}`} name={p.key} defaultValue={initial[p.key] ?? ""} rows={2} maxLength={1000} className="min-h-14" />
        </div>
      ))}
      <SubmitButton variant="secondary" className="self-end">Save reflection</SubmitButton>
      <FormError message={state.error} />
      {state.ok && <FormNotice message="Saved. Stewardship is a habit, not a mood." />}
    </form>
  );
}
