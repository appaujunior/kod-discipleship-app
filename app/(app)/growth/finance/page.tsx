import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { todayIn } from "@/lib/utils";
import { PageHeader, SectionTitle, Pill, ProgressBar } from "@/components/ui/bits";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { money } from "@/lib/data/finance";
import { FinanceEntryForm, AssetForm, DeleteButton, SavingsGoalForm, ContributeForm, MoneyReflectionForm } from "./finance-forms";

export const metadata: Metadata = { title: "Finance" };

function shiftMonth(ym: string, delta: number): string {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function FinancePage(props: PageProps<"/growth/finance">) {
  const sp = await props.searchParams;
  const { supabase, userId, profile } = await requireSession();
  const thisMonth = todayIn(profile.timezone).slice(0, 7);
  const month = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : thisMonth;
  const [{ data: entries }, { data: assets }, { data: goals }, { data: reflection }] = await Promise.all([
    supabase.from("finance_entries").select("*").eq("user_id", userId).eq("month", `${month}-01`).order("created_at"),
    supabase.from("assets").select("*").eq("user_id", userId).order("value", { ascending: false }),
    supabase.from("savings_goals").select("*").eq("user_id", userId).order("done_at", { ascending: true, nullsFirst: true }).order("created_at"),
    supabase.from("finance_reflections").select("*").eq("user_id", userId).eq("month", `${month}-01`).maybeSingle(),
  ]);
  const sum = (kind: string) => (entries ?? []).filter((e) => e.kind === kind).reduce((n, e) => n + Number(e.amount), 0);
  const income = sum("income"), fixed = sum("fixed"), variable = sum("variable");
  const net = income - fixed - variable;
  const label = new Date(Number(month.slice(0, 4)), Number(month.slice(5)) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const netWorth = (assets ?? []).reduce((n, a) => n + Number(a.value), 0);
  // Where the money went: expenses grouped by category, largest first.
  const byCategory = new Map<string, number>();
  for (const e of entries ?? []) {
    if (e.kind === "income") continue;
    const key = e.category ?? "Uncategorized";
    byCategory.set(key, (byCategory.get(key) ?? 0) + Number(e.amount));
  }
  const spending = [...byCategory.entries()].sort((a, b) => b[1] - a[1]);
  const spentTotal = fixed + variable;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/growth" eyebrow="Provider" title="Finance" />
      <div className="flex items-center justify-between">
        <LinkButton href={`/growth/finance?month=${shiftMonth(month, -1)}`} variant="secondary" size="sm">Prev</LinkButton>
        <span className="font-semibold text-ink">{label}</span>
        <LinkButton href={`/growth/finance?month=${shiftMonth(month, 1)}`} variant="secondary" size="sm">Next</LinkButton>
      </div>
      <Card className="bg-navy border-navy text-white">
        <CardBody className="grid grid-cols-2 gap-y-3">
          <div><p className="text-xs uppercase tracking-wider text-white/60">Net this month</p><p className="display text-2xl tnum">{money(net)}</p></div>
          <div><p className="text-xs uppercase tracking-wider text-white/60">Income</p><p className="text-lg tnum">{money(income)}</p></div>
          <div><p className="text-xs uppercase tracking-wider text-white/60">Fixed</p><p className="text-lg tnum">{money(fixed)}</p></div>
          <div><p className="text-xs uppercase tracking-wider text-white/60">Variable</p><p className="text-lg tnum">{money(variable)}</p></div>
          <p className="col-span-2 text-xs text-white/60">{income > 0 ? `Spending is ${Math.round(((fixed + variable) / income) * 100)}% of income.` : "Add your income to see where you stand."}</p>
        </CardBody>
      </Card>
      <FinanceEntryForm month={month} />
      {spending.length > 0 && (
        <section>
          <SectionTitle>Where it went</SectionTitle>
          <ul className="rounded-card border border-line bg-surface px-4 py-3 flex flex-col gap-2.5">
            {spending.map(([cat, amt]) => (
              <li key={cat}>
                <div className="flex items-baseline justify-between gap-3 text-sm"><span className="text-ink">{cat}</span><span className="tnum text-ink-2">{money(amt)} <span className="text-ink-3">· {Math.round((amt / spentTotal) * 100)}%</span></span></div>
                <ProgressBar value={amt} max={spentTotal} tone="navy" className="mt-1" />
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <SectionTitle>Entries</SectionTitle>
        {!entries?.length ? <p className="text-sm text-ink-3 px-1">Nothing logged for {label}.</p> : (
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">
            {entries.map((e) => (
              <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                <Pill tone={e.kind === "income" ? "green" : e.kind === "fixed" ? "navy" : "neutral"} className="w-16 justify-center">{e.kind}</Pill>
                <span className="flex-1 min-w-0"><span className="block text-[15px] text-ink truncate">{e.label}</span>{e.category && <span className="block text-xs text-ink-3 truncate">{e.category}</span>}</span>
                <span className="tnum text-ink font-semibold">{money(Number(e.amount))}</span>
                <DeleteButton kind="entry" id={e.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <SectionTitle>Savings goals</SectionTitle>
        <SavingsGoalForm />
        {(goals?.length ?? 0) > 0 && (
          <ul className="flex flex-col gap-2 mt-3">
            {goals!.map((g) => {
              const saved = Number(g.saved_amount), target = Number(g.target_amount);
              return (
                <li key={g.id} className="rounded-card border border-line bg-surface px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0"><span className="block font-semibold text-ink truncate">{g.title}</span>
                      <span className="block text-xs text-ink-3 tnum">{money(saved)} of {money(target)}{g.due_date ? ` · by ${new Date(`${g.due_date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : ""}</span></span>
                    <span className="flex items-center gap-2">{g.done_at && <Pill tone="gold">Reached</Pill>}<DeleteButton kind="goal" id={g.id} /></span>
                  </div>
                  <ProgressBar value={saved} max={target} tone={g.done_at ? "gold" : "green"} className="mt-2" />
                  {!g.done_at && <ContributeForm id={g.id} />}
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <section>
        <SectionTitle>Reflect on {label}</SectionTitle>
        <div className="rounded-card border border-line bg-surface px-4 py-4">
          <MoneyReflectionForm key={month} month={month} initial={reflection ?? {}} />
        </div>
      </section>
      <section>
        <SectionTitle action={<span className="text-sm text-ink-3 tnum">{money(netWorth)}</span>}>Assets</SectionTitle>
        <AssetForm />
        {(assets?.length ?? 0) > 0 && (
          <ul className="rounded-card border border-line bg-surface divide-y divide-line mt-3">
            {assets!.map((a) => (
              <li key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                <Pill className="capitalize">{a.category}</Pill>
                <span className="flex-1 text-[15px] text-ink truncate">{a.label}</span>
                <span className="tnum text-ink font-semibold">{money(Number(a.value))}</span>
                <DeleteButton kind="asset" id={a.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
