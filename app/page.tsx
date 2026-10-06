import { redirect } from "next/navigation";

/** The root has no content of its own; proxy.ts already sends signed-out visitors to /sign-in. */
export default function RootPage() {
  redirect("/today");
}
