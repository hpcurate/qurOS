# ROOT — Flex System Spec

Spec for adding a slip-tolerant daily system to ROOT, H's personal web app. Written from H's planning sessions with qurOS (Oct 2026). Hand this to Claude Code.

---

## 0. Instructions for Claude Code

- **Read the repo first.** Understand ROOT's existing architecture, tabs (do, log, store, etc.), data storage and build setup before writing anything. Match existing patterns; don't introduce a new framework.
- **Match the design system:** dark background `#0e0e0e`, purple accent `#A78BFA`, fonts Space Mono / Syne / JetBrains Mono. Mobile-first: ROOT is used on a phone.
- **Reuse existing integrations:** Todoist goes through the existing Cloudflare Worker proxy. Journaling output is Obsidian markdown.
- **Don't restructure or delete existing tabs.** Add to them or add new ones. Ask H before removing anything.
- **Don't duplicate data.** If the LOG tab already records wake/sleep, mood, etc., read from it instead of creating a second source.
- **Build in stages** (section 9) and stop after each stage for H to try it.

---

## 1. Why this exists

H removed ROOT's **Plan** and **Day** tabs because they were the most stressful part of the app. They enforced a rigid plan: one slip and the whole day "crumbled," and H froze.

Related problems H named:
- Freezes when he fails the calendar; no flexibility.
- The 6-block day system (b1a–b3b) is overcomplicated and stressful. It is **on hold**.
- Looks at the destination ("finish the CAP," "finish the mix") instead of the next step, then can't start.
- Systems that collapse on one missed item make everything worse.

This spec replaces Plan/Day with something that **bends instead of breaks**.

---

## 2. Design principles (non-negotiable)

1. **Slip-tolerant.** Nothing ever turns red, shows "failed," or resets to zero. Unfinished items roll forward quietly or can be dropped with one tap.
2. **No streaks.** Show "X of 7 this week," never "streak: 0."
3. **Minimums count.** Every habit has a full version and a minimum. Logging the minimum = done, same checkmark.
4. **Next step, not the mountain.** The Today view highlights the **one next action**. The full list is secondary/collapsed.
5. **Only two clock times:** wake and sleep. No hourly schedule, no time blocks.
6. **Goals, not schedules:** 1–3 goals per day, max 3 per week.
7. **One tap to log.** If logging takes thought, it won't happen.
8. **Bad-day mode.** One toggle collapses the whole day to minimums.

---

## 3. Today tab (replaces Plan + Day)

### 3.1 Anchors
- **Wake target:** 06:00 (setting).
- **Sleep target:** setting, unset by default (see open questions).
- Log actual wake and sleep times (read from LOG if it already does this).

### 3.2 Daily goals
- 1–3 free-text goals per day. Hard cap at 3.
- Phrase as small blocks, e.g. "1 pomodoro on CAP chapter 1," not "do the CAP." Optional: show a hint under the input: *"Make it small enough to start in 2 minutes."*
- Unfinished goals: at day rollover, offer **carry / drop**. No penalty either way.

### 3.3 Weekly goals
- Max 3. Visible as a small strip above daily goals.

### 3.4 Morning chain
An ordered checklist. The current item is highlighted as **NEXT**; the rest are dimmed.

| # | Step | Full | Minimum |
|---|---|---|---|
| 1 | Wake | at wake target | out of bed |
| 2 | Kamo walk | full walk; talk to qurOS (plan the day / brain-dump) | short walk |
| 3 | Gym | full A/B session (section 5) | bike 10 min + 1 exercise |
| 4 | Shower chain | full hygiene chain (section 6) | shower |
| 5 | First CAP pomodoro | 1+ pomodoros | 1 pomodoro |

- Steps can be ticked out of order. Order is guidance, not enforcement.
- Late or skipped steps never block the next one.

### 3.5 Bad-day mode
- One toggle on the Today tab.
- Collapses every habit to its minimum and hides everything else.
- Logged as a bad day (neutral, not negative) for later trend-spotting.

### 3.6 Evening
- **Prep for tomorrow** mini-checklist: Kamo walk items ready by the door, gym bag ready.
- **Evening dump** (section 8).

---

## 4. Pomodoro

- Default 25 min work / 5 min break. Configurable.
- Each session tagged with an area: `CAP`, `music`, `admin`, `other` (editable list).
- Count per area per day and per week.
- CAP minimum for the day = 1 pomodoro.
- Sessions write into the day's Obsidian log.
- Keep it reachable from the Today tab in one tap.

---

## 5. Gym

### 5.1 Program: alternate A / B
App tracks which was last and suggests the other.

**Warm-up (both):** 5 min bike or rower.

**Day A**
| Exercise | Sets × reps |
|---|---|
| Leg press or goblet squat | 3 × 8–12 |
| Chest press or bench | 3 × 8–12 |
| Lat pulldown | 3 × 8–12 |
| Dumbbell Romanian deadlift | 3 × 10 |
| Plank | 3 × 30–45 s |

**Day B**
| Exercise | Sets × reps |
|---|---|
| Lunges or hip thrust | 3 × 8–12 |
| Shoulder press | 3 × 8–12 |
| Seated row | 3 × 8–12 |
| Leg curl | 3 × 10–12 |
| Hanging knee raise or cable crunch | 3 × 10–15 |

### 5.2 Logging
- Per set: weight + reps. Prefill with last session's numbers for that exercise.
- Rest timer between sets (default 90–120 s).
- **Progression hint:** if every set hit the top of the rep range last time, show "add weight."
- Exercises editable (H may swap based on his gym's equipment).

### 5.3 Targets
- 3–4 sessions/week, shown as "X of 3–4 this week."
- Non-gym days: Kamo walk counts as movement.
- **Minimum session** (bike 10 min + 1 exercise) logs as a gym day.

---

## 6. Hygiene chain

Runs right after the gym. One sequence, not separate habits.

1. Shower
2. Face wash
3. Teeth
4. Floss
5. Tongue clean
6. Shave (optional, not daily)

- **Minimum:** shower.
- **Shower helper:** a 5-minute timer button. Context: the bathroom is ~1.3 m², windowless, and feels claustrophobic. H's workaround: door open, lukewarm water, music on, short fixed time.
- Show weekly counts per step, no streaks.

---

## 7. Meals and groceries (fits into / extends EAT)

### 7.1 Preset meals
Goal: 3 preset meals H likes, so dinner isn't a decision. Store as a small recipe library with ingredients + steps.

**Preferences to encode:**
- Floor doesn't like lime → lime always optional / "add at the end."
- H doesn't like aubergine → optional; sub courgette.
- Pantry staples H has: herbes de Provence.

**Meals so far:**

**Stir-fry 1 (oyster–soy, broccoli)** — ingredients only, steps TBD by H
oyster sauce, soy sauce, bicarb soda, cornflour, shaoxing wine, brown sugar, chili flakes, spring onion, broccoli, garlic, ginger, chicken (thighs), rice

**Stir-fry 2 (hoisin–honey)** — ingredients only, steps TBD by H
hoisin sauce, oyster sauce, soy sauce, honey, peanut oil, chicken stock, cornflour, baking soda, ginger, garlic, spring onion, rump steak

**Burritos**
- Spices: cumin, paprika, cayenne, chili flakes, oregano, garlic powder
- Cheese: cheddar, mozzarella
- Meat: pick one per batch (chicken / minced beef / pork)
- Veg: peppers, lettuce, garlic, onions, tomatoes, sweetcorn, avocado, courgette
- Other: tortillas, black beans, sour cream, salsa, fresh coriander, lime (optional)
- Rice: Mexican red rice (default, no lime) or cilantro-lime rice

**Mexican red rice** (4 servings)
1. Rinse 300 g rice.
2. Toast in 1 tbsp oil, 2 min.
3. Add ½ diced onion + 1 garlic clove, 1 min.
4. Stir in 2 tbsp tomato paste, 1 tsp cumin, ½ tsp paprika, ½ tsp salt.
5. Add 550 ml chicken stock, bring to a boil.
6. Lid on, lowest heat, 15 min. Don't lift the lid.
7. Heat off, rest 10 min, fluff.

**Cilantro-lime rice** (4 servings)
Same as above but: rinse 300 g rice → toast 2 min in 1 tbsp oil with 1 minced garlic clove → 550 ml stock + ½ tsp salt → boil → lowest heat covered 15 min → rest 10 min → stir in zest + juice of 1 lime and 15 g chopped coriander. (Lime optional per Floor.)

**Soupe de légumes du soleil** (4 servings; H usually doubles it for leftovers)
- 2 tbsp olive oil, 1 onion, 1 carrot (diced small), 2 garlic cloves, 1 red pepper, 1 courgette, 1 small aubergine (optional → courgette), 400 g canned chopped tomatoes, 750 ml stock, 1 tsp herbes de Provence, 1 tsp salt, ¼ tsp black pepper
1. Dice everything 1–2 cm; carrot smaller.
2. Oil, onion + carrot, 5 min.
3. Garlic, 1 min.
4. Pepper, courgette, aubergine, 5 min.
5. Tomatoes, stock, herbs, salt, pepper. Boil, then simmer partly covered 20 min.
6. Blend fully, half, or not at all. Season. Drizzle olive oil.
- Keeps 4 days in the fridge, freezes well.

**Grilled cheese**
- Bread (pain de mie), butter, cheddar + mozzarella, Italian herbs. Optional third cheese: provolone dolce, fontina, young Comté, emmental, young gouda.
- Low-medium heat, lid on 1 min so the cheese melts before the bread burns.

### 7.2 Recipe features
- Servings scaler (×1, ×2).
- Step timers.
- **"Add to groceries"** button: pushes ingredients to Todoist, **deduping** against items already on the list (case-insensitive, treat obvious synonyms as the same, e.g. bicarb soda = baking soda).

### 7.3 Grocery list structure (Todoist)
- Project: `04 | life`, section: `home | groceries`.
- Items grouped by **trip** using parent tasks with a due date:
  - `walk shop — <when>`: small on-foot shop, only what's needed now.
  - `car shop — <when>`: big shop.
- ROOT should let H pick the trip when adding a meal's ingredients, and move items between trips.
- Quantities go in the task title when they matter (`onions x2`), notes in the description.

---

## 8. Evening dump → qurOS export

- A free-text box (voice-to-text friendly) for the evening brain-dump.
- **Export button** generates a markdown file combining:
  - date, wake/sleep, bad-day flag
  - daily goals: done / carried / dropped
  - morning chain: which steps, full or minimum
  - pomodoros by area
  - gym session summary
  - meals eaten
  - the free-text dump
- Output is meant to be pasted or attached into a qurOS chat, which turns it into a clean record and tomorrow's starting point.
- Also write it into the Obsidian daily note, following ROOT's existing journaling format.

---

## 9. Life dump tracker (optional, later)

- Load `qurOS-life-dump-map.md` (separate file) as data: sections and checklist items.
- Each item: `empty / partial / done`.
- Show "next untouched item" so H can open a walk dump with one prompt.
- Rule: one section per dump, Tier 1 first.

---

## 10. Build order

Stop after each stage for H to use it.

1. **Today tab:** anchors, daily goals (carry/drop), morning chain with NEXT highlight, bad-day mode.
2. **Pomodoro** with area tags.
3. **Gym** A/B logging + progression hint.
4. **Hygiene chain** + shower timer.
5. **Meals:** recipe library, scaler, timers, add-to-groceries with dedupe and trip split.
6. **Evening dump** + export.
7. **Life dump tracker.**

---

## 11. Non-goals

- No hourly schedule or time blocks.
- No Google Calendar sync (block system is on hold).
- No streak counters, no red/failed states, no guilt notifications.
- No meal-prep planner yet; preset meals first.

---

## 12. Open questions for H

- Sleep target time?
- Gym goal (muscle / strength / energy / look) and any injuries? May change the program.
- Shaving frequency?
- Should ROOT track weed use? Not decided.
- Daily rollover time: midnight, or tied to sleep?
