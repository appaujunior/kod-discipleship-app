"""Rebuild public/bible/kjv from the raw KJV dataset.

The source marks two different things with braces:
  * words the translators supplied for English sense (italics in print) -> keep the words
  * marginal/translator notes -> drop entirely
Notes are identifiable by a gloss marker: a colon, "Heb."/"Gr./Chal.", an ellipsis,
or an "; or," alternative reading. Epistle subscriptions sit inside « ».
"""
import json, re
from pathlib import Path

SRC = Path(__file__).parent / "en_kjv.json"  # download: https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json
OUT = Path(__file__).parent.parent / "public" / "bible" / "kjv"

GUILL = re.compile(r"«[^»]*»?")
BRACE = re.compile(r"\{([^}]*)\}")
NOTE_MARKER = re.compile(r":|\.\.\.|\bHeb\.|\bGr\.|\bChal\.|\bor,")

def is_note(inner: str) -> bool:
    return bool(NOTE_MARKER.search(inner))

def clean(verse: str) -> str:
    t = GUILL.sub("", verse)
    # A few notes nest another brace group inside them, so resolve until stable.
    prev = None
    while prev != t:
        prev = t
        t = BRACE.sub(lambda m: "" if is_note(m.group(1)) else m.group(1), t)
    # Two verses carry a malformed note whose braces do not pair. Whatever is left
    # is trailing note residue, so keep the verse up to its last sentence end.
    stray = [i for i in (t.find("{"), t.find("}")) if i != -1]
    if stray:
        head = t[: min(stray)]
        m = re.search(r"^.*[.?!]", head, re.S)
        t = m.group(0) if m else head
    t = re.sub(r"\s+([,.;:!?])", r"\1", t)
    return re.sub(r"\s{2,}", " ", t).strip()

def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def main() -> None:
    books = json.load(SRC.open(encoding="utf-8-sig"))
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for b in books:
        chapters = [[clean(v) for v in ch] for ch in b["chapters"]]
        total += sum(len(c) for c in chapters)
        (OUT / f"{slug(b['name'])}.json").write_text(
            json.dumps({"book": b["name"], "slug": slug(b["name"]), "chapters": chapters},
                       ensure_ascii=False, separators=(",", ":")))
    leftovers = sum(1 for b in books for ch in b["chapters"] for v in ch if "{" in clean(v) or "«" in clean(v))
    print(f"{len(books)} books, {total} verses, {leftovers} with leftover markup")

if __name__ == "__main__":
    main()
