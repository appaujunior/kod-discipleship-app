import { requireSession } from "@/lib/auth";
import { TabBar } from "@/components/nav/tab-bar";
import { TopBrand } from "@/components/nav/top-brand";

/** Signed-in shell: a phone-width column with the five-tab bar. */
export default async function AppLayout({ children }: LayoutProps<"/">) {
  await requireSession();
  return (
    <div className="flex-1 flex flex-col">
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pt-5 pb-28 pt-safe">
        <TopBrand />
        {children}
      </main>
      <TabBar />
    </div>
  );
}
