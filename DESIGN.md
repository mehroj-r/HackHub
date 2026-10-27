# HackHub design

The visual system, as shipped. The screens and their copy are in [docs/08](docs/08-ui-spec.md); the product it
serves is in [PRODUCT.md](PRODUCT.md). Chosen by Mehroj on 28 Oct 2026 from the brand board: theme **Scoreboard**,
logo **Podium H**.

## Theme: Scoreboard

The LED tournament scoreboard on the big screen at demo day: amber digits on a brown-black ground, and a red
"on air" light. Judging and the ranking are HackHub's sharpest edge, so the ranking is where the colour lives.

**Dark only.** There is no light theme. `<html>` always has `class="dark"`, the browser's `theme-color` is the
ground (`#0C0A08`), and every token below is defined once in `src/app/globals.css` (`:root, .dark`).

| Role | Hex | oklch | Token(s) | Use |
|---|---|---|---|---|
| Ground | `#0C0A08` | `oklch(0.146 0.006 69.2)` | `--background` | Page background |
| Surface | `#19150F` | `oklch(0.198 0.013 77.9)` | `--card`, `--popover`, `--sidebar` | Cards, menus, dialogs, toasts |
| Surface steps | `#231D15`, `#211B14`, `#4A3F30` | `oklch(0.235 0.017 74.7)`, `oklch(0.227 0.016 71.2)`, `oklch(0.375 0.029 75.3)` | `--secondary`, `--muted`, `--input` | Secondary buttons, quiet fills, field borders |
| Text | `#FFF4E0` | `oklch(0.970 0.029 82.6)` | `--foreground`, `--*-foreground` | Body and headings: 18.1:1 on the ground, 16.7:1 on the surface |
| Muted text | `#B3A48A` | `oklch(0.725 0.040 81.4)` | `--muted-foreground` | Secondary text: 8.1:1 on the ground, 7.4:1 on the surface |
| Border | `#FFF4E0` at 12% | `oklch(0.970 0.029 82.6 / 12%)` | `--border`, `--sidebar-border` | Hairlines |
| **Primary: scoreboard amber** | `#FFA41B` | `oklch(0.791 0.167 68.9)` | `--primary`, `--ring`, `--highlight`, `--sidebar-primary`, `--chart-1` | The primary action, the ranking leader, focus rings, the current nav item |
| On amber | `#1A0E00` | `oklch(0.176 0.037 75.5)` | `--primary-foreground` | Text on amber: 9.6:1 |
| **Accent: live red** | `#FF3D2E` | `oklch(0.656 0.231 29.3)` | `--live`, `--chart-2` | "Live" moments only: the open-state dot, toast icons, the leader's trophy. 5.6:1 on the ground |
| Accent (low strength) | `#3A1A12` | `oklch(0.262 0.053 35.1)` | `--accent`, `--sidebar-accent` | Hover and menu highlights; text on it is 14.4:1 |
| Destructive: crimson rose | `#EC5B72` | `oklch(0.665 0.179 13.9)` | `--destructive` | Errors and destructive actions. A pinker, less saturated hue than the live red (14 vs 29), so an error never reads as "live". 5.5:1 on the surface, 4.6:1 at the alerts' 90% |
| Success | `#8BD45E` | `oklch(0.797 0.169 135.1)` | `--success` (on `--success-foreground` = ground) | Only "Registered", "Submitted" and "Scored". 11:1 |
| Ember | `#FF6A1F` | `oklch(0.702 0.198 42.5)` | `--chart-3` | Generated event art |
| Warm gold | `#E8B44A` | `oklch(0.798 0.135 82.2)` | `--chart-4` | Generated event art |
| Deep brown | `#5A3A1C` | `oklch(0.379 0.063 62.1)` | `--chart-5` | Generated event art |

The focus ring is `ring-ring/50` (amber at 50%): 3.2:1 on both the ground and the surface.

### Rules

- **Amber is for the primary action and the ranking leader.** One amber button per view; secondary actions use
  outline or secondary styles.
- **Amber means "do this".** A disabled or informational state (for example "Registration closed") is never an
  amber button; it uses the outline style.
- **Destructive buttons** keep shadcn's crimson tint but set the label in the text colour (13:1), with the icon in
  crimson; crimson text on its own 20% tint would be only 4.2:1.
- **Never amber as a large surface.** Amber fills buttons, small tiles (the app icon) and tints of 10–18%; it is
  never a page, section or card background.
- **Red means live.** The live red marks what is happening now: the dot on open states, toast icons and the
  ranking leader's trophy. It is never a button or an error.
- **Ranking: the fixed ramp.** The leader (rank 1, including shared firsts) is the only full-strength colour in a
  ranking: amber rank number, a red trophy, and a 10% amber row tint with an amber hairline. Ranks 2 and below use
  amber at 70% (still 5:1).
- **Badges.** Open states ("Registration open", "Submissions open") get a 15% amber tint, an amber border and the
  red live dot. "Results published" gets the tint without the dot. Closed states are a plain outline. Item states
  ("Registered", "Submitted", "Scored") use the success green with a check. Every badge says its state in words;
  colour only adds to it.

## Logo: Podium H

The H's crossbar is a podium, 2–1–3: fair judging and the ranking, in the letter itself. It is drawn on a 64×64
grid (`src/components/brand/logo.tsx`; `F` = foreground, `P` = primary):

```
<rect class="F" x="8"    y="8"  width="10"  height="48" rx="3"/>   left upright
<rect class="F" x="46"   y="8"  width="10"  height="48" rx="3"/>   right upright
<rect class="P" x="18"   y="30" width="9.3" height="14"/>          2nd
<rect class="P" x="27.3" y="22" width="9.4" height="22"/>          1st
<rect class="P" x="36.7" y="34" width="9.3" height="10"/>          3rd
```

- **`default`:** the uprights in the text colour, the podium in amber, on the dark ground (`LogoMark`, `Logo`).
- **`onPrimary`:** every shape in `#1A0E00`, on an amber tile. Used for the app icon and the tile on the auth
  pages.
- **App icons:** `src/app/icon.svg` is an amber rounded square (`rx` 14 on 64) with the `onPrimary` mark inset to
  81%; `src/app/apple-icon.png` is the same art at 180×180 on a full amber square (iOS rounds it). The 16 px
  favicon still reads as an H with a taller middle step.
- `LogoMark` is `role="img"` with `aria-label="HackHub"`; inside `Logo` (mark + wordmark) the whole lock-up is one
  image named "HackHub".

## Type

- **Wordmark:** "HackHub" in **Unbounded** 800, tracking −0.02em (`font-wordmark`, loaded with `next/font/google`
  as `--font-wordmark`). Used for the wordmark only.
- **App:** Space Grotesk for body and headings (`--font-sans`), Geist Mono for codes and numbers people copy or
  compare (`--font-mono`).

## Event images and their fallbacks

Organizers can upload a logo (512×512 WebP) and a banner (1600×600 WebP); see docs/08 > Event images. Events
without them get generated art from `src/components/events/event-art.ts`:

- A hash of the event name (FNV-1a, then murmur3 fmix32) picks one of 8 gradients and one of 4 patterns (dots,
  grid, diagonal, waves). Same name, same art.
- The gradients use only Scoreboard hues: amber, live red, ember, warm gold and deep brown, as theme tokens. The
  middle stop is always bright, so the dark initials on the avatar stay readable.
- The fallbacks are decorative (`aria-hidden`): the event name is always written next to them.
- `event-art.test.ts` checks that the choice is deterministic, that it spreads over the presets, and that only
  these tokens are used.
