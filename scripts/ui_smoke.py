#!/usr/bin/env python3
"""Smoke-test rendered pages in a headless browser.

    python scripts/ui_smoke.py --base http://localhost:3000 --paths / /pricing [--out ui-smoke]
    python scripts/ui_smoke.py --base file:///abs/path/to/dist --paths /index.html

Writes screenshots (phone 390 and desktop 1440, dark and light) to --out plus report.json, and
exits non-zero on any hard failure:
  - a page does not load (HTTP >= 400) or renders an empty body
  - horizontal overflow at either width (document wider than the viewport); the elements
    sticking out are named in the report
  - any script error (blocked third-party resources are ignored)
  - --expect CSS selector matches nothing (optional; use it to prove real content rendered)
Warnings (reported, non-fatal): tap targets under 40px tall on the phone layout.

The ui-qa agent reads report.json and the screenshots, then judges the soft things (hierarchy,
spacing, palette, copy). Needs: pip install playwright && playwright install chromium
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

VIEWPORTS = {"phone": (390, 844), "desktop": (1440, 900)}
THEMES = ("dark", "light")

CULPRITS_JS = """(w) => Array.from(document.querySelectorAll('body *'))
    .map(e => ({e, r: e.getBoundingClientRect()}))
    .filter(o => o.r.width > 0 && o.r.right > w + 0.5)
    .filter(o => !Array.from(o.e.children).some(c => c.getBoundingClientRect().right > w + 0.5))
    .slice(0, 6)
    .map(o => `${o.e.tagName.toLowerCase()}${o.e.id ? '#' + o.e.id : ''}${o.e.className && typeof o.e.className === 'string' ? '.' + o.e.className.trim().split(/\\s+/).join('.') : ''} right=${o.r.right.toFixed(1)} w=${o.r.width.toFixed(1)} "${(o.e.textContent || '').trim().slice(0, 30)}"`)
    .join(' | ')"""

SMALL_TARGETS_JS = """Array.from(document.querySelectorAll('button, a.btn, [role=button], input[type=submit]'))
    .filter(e => e.offsetParent !== null)
    .map(e => ({t: (e.textContent || e.value || '').trim().slice(0, 30), h: e.getBoundingClientRect().height}))
    .filter(o => o.h > 0 && o.h < 40)"""


def slug(path: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", path.lower()).strip("-") or "home"


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", required=True, help="http(s)://host[:port] or file:///dir")
    ap.add_argument("--paths", nargs="+", default=["/"])
    ap.add_argument("--expect", default="", help="CSS selector that must match on every page")
    ap.add_argument("--out", default="ui-smoke")
    args = ap.parse_args()
    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("ui_smoke: pip install playwright && playwright install chromium", file=sys.stderr)
        return 2

    report = {"base": args.base, "checks": [], "failures": [], "warnings": []}

    def check(name: str, ok: bool, detail: str = "", warn: bool = False):
        report["checks"].append({"name": name, "ok": ok, "detail": detail,
                                 "severity": "warn" if warn else "fail"})
        if not ok:
            (report["warnings"] if warn else report["failures"]).append(f"{name}: {detail}")

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for path in args.paths:
            url = args.base.rstrip("/") + "/" + path.lstrip("/")
            for theme in THEMES:
                for name, (w, h) in VIEWPORTS.items():
                    tag = f"{slug(path)}-{name}-{theme}"
                    page = browser.new_page(viewport={"width": w, "height": h}, color_scheme=theme,
                                            device_scale_factor=2 if name == "phone" else 1)
                    errors: list[str] = []
                    # script errors only; blocked third-party resources (fonts, analytics) are not page bugs
                    page.on("console", lambda m: errors.append(m.text)
                            if m.type == "error" and "Failed to load resource" not in m.text else None)
                    page.on("pageerror", lambda e: errors.append(str(e)))
                    try:
                        resp = page.goto(url, wait_until="load", timeout=30000)
                        try:
                            page.wait_for_load_state("networkidle", timeout=10000)
                        except Exception:
                            pass  # long-polling or streaming pages never go idle
                    except Exception as e:
                        check(f"{tag} loads", False, f"{url}: {e}"[:300])
                        page.close()
                        continue
                    status = resp.status if resp else 200  # file:// has no response status
                    check(f"{tag} loads", status < 400, f"{url} returned HTTP {status}")
                    # full page for layout review; viewport-only because fixed elements (sheets,
                    # sticky bars) land mid-page in a full-page capture and look like a bug
                    page.screenshot(path=str(out / f"{tag}.png"), full_page=True)
                    page.screenshot(path=str(out / f"{tag}-fold.png"))

                    text_len = page.evaluate("document.body.innerText.trim().length")
                    check(f"{tag} renders content", text_len > 0, "body has no visible text")
                    if args.expect:
                        n = page.evaluate("(s) => document.querySelectorAll(s).length", args.expect)
                        check(f"{tag} expected content", n > 0, f"no element matches {args.expect!r}")
                    sw = page.evaluate("document.documentElement.scrollWidth")
                    culprits = page.evaluate(CULPRITS_JS, w) if sw > w else ""
                    check(f"{tag} no horizontal overflow", sw <= w,
                          f"scrollWidth {sw} > viewport {w}; {culprits}")
                    check(f"{tag} no console errors", not errors, "; ".join(errors)[:500])
                    if name == "phone":
                        small = page.evaluate(SMALL_TARGETS_JS)
                        check(f"{tag} tap targets >= 40px", not small,
                              ", ".join(f"{o['t']!r} {o['h']:.0f}px" for o in small)[:500], warn=True)
                    page.close()
        browser.close()

    (out / "report.json").write_text(json.dumps(report, indent=2))
    ok = not report["failures"]
    print(f"ui_smoke: {'OK' if ok else 'FAIL'}, {len(report['checks'])} checks, screenshots in {out}/")
    for f in report["failures"]:
        print("  FAIL", f)
    for w in report["warnings"]:
        print("  WARN", w)
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
