"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOut} className="flex justify-center">
      <SubmitButton variant="ghost" size="sm"><LogOut className="size-4" aria-hidden /> Sign out</SubmitButton>
    </form>
  );
}
