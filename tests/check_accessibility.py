"""Browser checks. Serve the repository, then run with --base-url and --axe-script.

Requires Python 3.9+ and Playwright with Chromium installed. The axe script is
provided separately so no third-party executable or dependency is published.
"""

import argparse
import json
from pathlib import Path
from playwright.sync_api import sync_playwright


def check_behaviour(browser, base):
    context = browser.new_context(viewport={"width": 1280, "height": 900}, reduced_motion="no-preference")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(base, wait_until="networkidle")
    page.keyboard.press("Tab")
    assert page.get_by_role("link", name="Skip to content").evaluate("e => e === document.activeElement")
    page.keyboard.press("Enter")
    assert page.locator("main").evaluate("e => e === document.activeElement"), "Skip link must move keyboard focus into main"

    page.locator("#terrain-animation").scroll_into_view_if_needed()
    stop = page.get_by_role("button", name="Stop animation", exact=True)
    assert stop.count() == 1 and stop.is_visible(), "A running preview needs an operable stop control"
    assert page.locator("#terrain-animation").evaluate("e => e.currentSrc.endsWith('terrain-process.gif')")
    stop.focus()
    page.keyboard.press("Enter")
    assert page.locator("#terrain-animation").evaluate("e => e.currentSrc.endsWith('terrain-still.jpg')")
    page.reload(wait_until="networkidle")
    assert page.locator("#terrain-animation").evaluate("e => e.currentSrc.endsWith('terrain-still.jpg')"), "Stop choice must survive reload"
    play = page.get_by_role("button", name="Play animation", exact=True)
    play.focus()
    page.keyboard.press("Space")
    assert page.locator("#terrain-animation").evaluate("e => e.currentSrc.endsWith('terrain-process.gif')")
    page.emulate_media(reduced_motion="reduce")
    page.wait_for_function("document.querySelector('#terrain-animation').currentSrc.endsWith('terrain-still.jpg')")
    assert not page.get_by_role("button", name="Stop animation", exact=True).is_visible()
    assert page.get_by_text("Animation is off because your system requests reduced motion.", exact=True).is_visible()
    page.emulate_media(reduced_motion="no-preference")
    page.wait_for_function("document.querySelector('#terrain-animation').currentSrc.endsWith('terrain-process.gif')")

    page.get_by_role("link", name="Accessibility / נגישות", exact=True).click()
    assert page.get_by_role("heading", name="Accessibility", exact=True).count() == 1
    assert page.locator('[lang="he"][dir="rtl"]').count() > 0
    reports = page.locator('a[href^="https://github.com/Natboa/Natboa.github.io/issues/new"]')
    assert reports.count() >= 2
    assert page.get_by_text("A GitHub account is required.", exact=False).count() > 0
    page.select_option("#appearance", "dark")
    page.reload(wait_until="networkidle")
    assert page.locator("html").get_attribute("data-theme") == "dark"
    assert not errors, errors
    context.close()

    context = browser.new_context(java_script_enabled=False, viewport={"width": 390, "height": 844})
    page = context.new_page()
    page.goto(base, wait_until="networkidle")
    image = page.locator("#terrain-animation")
    image.scroll_into_view_if_needed()
    assert image.get_attribute("src").endswith("terrain-still.jpg"), "Without JS, keep a static preview"
    assert not page.locator(".animation-controls").is_visible()
    page.get_by_role("link", name="Accessibility / נגישות", exact=True).click()
    assert page.get_by_role("heading", name="Accessibility", exact=True).count() == 1
    context.close()


def audit_pages(browser, base, axe_script, artifact_dir):
    results = []
    context = browser.new_context(reduced_motion="no-preference")
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    for route in ["", "accessibility.html"]:
        for width, theme in [(1440, "light"), (1440, "dark"), (768, "light"), (390, "light"), (390, "dark"), (320, "dark")]:
            page.set_viewport_size({"width": width, "height": 960})
            response = page.goto(base + route, wait_until="networkidle")
            assert response.status == 200
            page.select_option("#appearance", theme)
            page.evaluate("document.fonts.ready")
            page.wait_for_function("document.getAnimations().every(a => a.playState !== 'running')")
            page.add_script_tag(path=str(axe_script))
            audit = page.evaluate("""async () => {
                const r = await axe.run(document, {runOnly: {type:'tag', values:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}});
                return {violations:r.violations.map(v=>({id:v.id, impact:v.impact, targets:v.nodes.map(n=>n.target), details:v.nodes.map(n=>n.failureSummary)})), incomplete:r.incomplete.map(v=>({id:v.id, count:v.nodes.length}))};
            }""")
            overflow = page.evaluate("document.documentElement.scrollWidth > innerWidth")
            audit.update({"route": route or "/", "width": width, "theme": theme, "overflow": overflow})
            results.append(audit)
            if artifact_dir and width in (1440, 390):
                page.screenshot(path=str(artifact_dir / f"{'statement' if route else 'portfolio'}-{width}-{theme}.png"), full_page=True)
    assert not errors, errors
    context.close()
    if artifact_dir:
        (artifact_dir / "browser-after.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(json.dumps(results, ensure_ascii=False))
    assert all(not r["violations"] and not r["overflow"] for r in results), "See audit findings above"


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8874/")
    parser.add_argument("--axe-script", type=Path, required=True)
    parser.add_argument("--artifacts", type=Path)
    args = parser.parse_args()
    base = args.base_url.rstrip("/") + "/"
    if args.artifacts:
        args.artifacts.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        check_behaviour(browser, base)
        audit_pages(browser, base, args.axe_script.resolve(), args.artifacts)
        browser.close()
    print("PASS: keyboard, animation controls and persistence, live reduced-motion changes, no-JS fallback, bilingual reporting, themes, and axe/layout matrix.")
