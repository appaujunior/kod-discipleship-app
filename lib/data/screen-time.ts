/**
 * Screen time is self-reported: a web app cannot read iPhone Screen Time or Android
 * Digital Wellbeing. Blocking is done by the phone itself, with an accountability
 * partner holding the passcode so the limits actually hold.
 */

export const FOCUS_LENGTHS = [10, 25, 45, 60] as const;

/** "2h 15m" for a minute count. */
export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export interface LockdownGuide {
  platform: string;
  intro: string;
  steps: { title: string; detail: string }[];
}

export const LOCKDOWN_GUIDES: LockdownGuide[] = [
  {
    platform: "iPhone",
    intro: "Apple's Screen Time does the blocking. Your partner sets the passcode, so you can't switch it off in a weak moment.",
    steps: [
      { title: "Open Screen Time", detail: "Settings → Screen Time. Turn on App & Website Activity if it's off." },
      { title: "Set Downtime", detail: "Downtime → Scheduled. Pick your hours (for example 10:30 PM to 6:00 AM). Only apps you allow will open." },
      { title: "Add App Limits", detail: "App Limits → Add Limit. Choose Social, Games or specific apps, set a daily time, and turn on Block at End of Limit." },
      { title: "Restrict content", detail: "Content & Privacy Restrictions → turn it on → App Store, Media, Web & Games → Web Content → Limit Adult Websites." },
      { title: "Hand your partner the passcode", detail: "Back on Screen Time, tap Lock Screen Time Settings. Hand the phone to your accountability partner and let him type a passcode you don't know." },
    ],
  },
  {
    platform: "Android",
    intro: "Digital Wellbeing sets timers and quiet hours; Google Play and Chrome handle content. Your partner sets the PIN.",
    steps: [
      { title: "Open Digital Wellbeing", detail: "Settings → Digital Wellbeing & parental controls." },
      { title: "Set Bedtime mode", detail: "Bedtime mode → set a schedule. The screen goes grayscale and notifications go quiet." },
      { title: "Add app timers", detail: "Dashboard → pick an app → App timer. When it runs out the app pauses for the rest of the day." },
      { title: "Restrict content", detail: "Google Play → profile → Settings → Family → Parental controls. Turn on SafeSearch in Google and Chrome." },
      { title: "Hand your partner the PIN", detail: "Let your accountability partner set the parental-controls PIN. For a hard lock, he can manage your phone with Google Family Link." },
    ],
  },
];
