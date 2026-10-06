import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { verseText } from "@/lib/bible/kjv.server";
import { BRAND } from "@/lib/data/brand";

const MAX_CHARS = 480;

/**
 * GET /share/verse?ref=John%203:16 → a 1080×1350 PNG (Instagram portrait) of a KJV verse
 * in KOD colours, for the Share button on verse cards. Only real references render, so
 * the image can never carry arbitrary text.
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref") ?? "";
  const text = ref.length <= 40 ? await verseText(ref) : null;
  if (!text) return new Response("Unknown reference", { status: 404 });
  if (text.length > MAX_CHARS) return new Response("Passage too long to share as an image", { status: 422 });

  // Step the type down as the passage gets longer so it always fits the card.
  const size = text.length < 120 ? 64 : text.length < 220 ? 54 : text.length < 340 ? 46 : 40;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: BRAND.navy, padding: "110px 96px", color: BRAND.white }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 56, height: 4, background: BRAND.gold }} />
          <div style={{ fontSize: 28, letterSpacing: 8, color: BRAND.gold, fontWeight: 700 }}>WORD FOR TODAY</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
          <div style={{ fontSize: size, lineHeight: 1.35, display: "flex" }}>{`“${text}”`}</div>
          <div style={{ fontSize: 40, color: BRAND.gold, fontWeight: 700, letterSpacing: 2 }}>{`${ref} · KJV`}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `2px solid ${BRAND.gold}`, paddingTop: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 30, letterSpacing: 6, fontWeight: 700 }}>KINGS OF DISTINCTION</div>
            <div style={{ fontSize: 24, color: "rgba(255,255,255,0.65)" }}>I am my brother&apos;s keeper</div>
          </div>
          <div style={{ fontSize: 24, color: BRAND.gold }}>kingsofdistinction.com</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, headers: { "Cache-Control": "public, max-age=86400, immutable" } },
  );
}
