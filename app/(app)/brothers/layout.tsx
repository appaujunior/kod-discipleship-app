import { Suspense } from "react";
import { PageHeader } from "@/components/ui/bits";
import { Segmented } from "@/components/ui/segmented";

export default function BrothersLayout({ children }: LayoutProps<"/brothers">) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader eyebrow="Handshake" title="Brothers">
        <Suspense>
          <Segmented items={[{ label: "Feed", href: "/brothers" }, { label: "Chat", href: "/brothers/chat" }, { label: "Members", href: "/brothers/members" }, { label: "Partners", href: "/brothers/partners" }, { label: "Challenges", href: "/brothers/challenges" }]} className="mt-2" />
        </Suspense>
      </PageHeader>
      {children}
    </div>
  );
}
