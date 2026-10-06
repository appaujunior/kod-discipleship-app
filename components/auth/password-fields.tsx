import { Input, Label } from "@/components/ui/form";

/** New-password + confirm pair, shared by the reset screen and Settings. */
export function PasswordFields() {
  return (
    <>
      <div>
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </div>
      <div>
        <Label htmlFor="confirm">Type it again</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
      </div>
    </>
  );
}
