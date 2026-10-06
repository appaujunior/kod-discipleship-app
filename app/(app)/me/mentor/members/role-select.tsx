"use client";

import { useTransition } from "react";
import { setRole } from "@/lib/actions/brothers";
import type { Role } from "@/lib/supabase/types";
import { Select } from "@/components/ui/form";

export function RoleSelect({ userId, role }: { userId: string; role: Role }) {
  const [pending, start] = useTransition();
  return (
    <Select aria-label="Role" defaultValue={role} disabled={pending} onChange={(e) => start(() => setRole(userId, e.target.value as Role))} className="h-9 w-28 text-sm">
      <option value="member">Member</option><option value="mentor">Mentor</option><option value="admin">Admin</option>
    </Select>
  );
}
