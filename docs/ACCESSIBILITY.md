# Accessibility implementation and verification

Date: 2026-11-06. Scope: the portfolio homepage and its bilingual accessibility
information page. The English portfolio keeps `lang="en"`; the Hebrew statement
section declares `lang="he" dir="rtl"`.

## Findings addressed

- The initial static HTML audit passed 8/9 checks and found no statement link.
  Added `accessibility.html`, a footer link, owner identity, actual features,
  testing scope, known limitations, and a repository issue form in Hebrew and
  English. GitHub issues were verified enabled. There is no published public
  profile email, so no personal email was guessed or exposed.
- Keyboard activation of the skip link did not focus the main landmark in the
  Chromium reproduction. A `tabindex="-1"` target now receives focus without
  becoming an additional Tab stop.
- The map's animation lasted longer than five seconds and had no in-page stop
  mechanism. It now has a keyboard-operable Stop/Play control. Stopping selects
  the still image; playing restarts the sequence. The choice persists locally.
  System reduced-motion settings always take priority, including live changes.
  With JavaScript unavailable, HTML supplies the still image and hides the
  unnecessary control.
- Overlapping hero links now rise above adjacent images when keyboard-focused.
  Existing focus indicators and the approved hero images remain intact.
- The hero caption now has an explicit theme background above the transparent
  device image. This removes an indeterminate contrast result caused by image
  overlap and makes its background predictable.

WCAG references: [2.2.2 Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html),
[2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html),
[1.4.3 Contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

## Verification

- The regression check first failed on the skip-link focus reproduction before
  implementation, then passed against the updated site.
- Installed `israeli-accessibility-compliance` static HTML audit: 9/9 checks,
  zero warnings on the updated homepage. This script checks source HTML only.
- axe-core 4.14.0 obtained from the npm registry with its SHA-512 package integrity
  verified. Scanned WCAG 2 A/AA, 2.1 AA, 2.2 AA and best-practice rules. The
  broader automated rule set is a technical check, not a legal claim about the
  Israeli standard's version or national adaptations.
- Chromium layout/axe matrix for each page: 1440px light and dark, 768px light,
  390px light and dark, and 320px dark. Automated violations and horizontal
  overflow must both be zero to pass `tests/check_accessibility.py`.
- Real browser keyboard checks cover Tab/Enter navigation to main, Enter/Space
  operation of the animation control, persistence after reload, theme persistence,
  and live reduced-motion changes. A separate JavaScript-disabled context checks
  the static preview and statement navigation.
- Local resource paths, anchors, unique IDs, the domain file and `.nojekyll`
  checked. No project image, download or source link was replaced.
- Browser screenshots reviewed for the original hero with keyboard focus and
  the Hebrew statement at mobile width. Theme and viewport checks are browser
  emulation, not testing on a physical mobile device.

## Remaining manual assessment

This is a technical implementation, not a certified accessibility assessment or
a declaration of full conformance. A full NVDA/JAWS/VoiceOver/TalkBack review,
physical mobile-device testing, document/download audits, and external linked
project audits remain outstanding. Screenshots are illustrative and their alt
descriptions are not complete transcripts. GitHub reporting requires an account;
there is currently no separate email or telephone reporting channel.

The public page states these limitations. It does not claim an exemption,
certification, screen-reader testing that did not occur, or full legal compliance.
