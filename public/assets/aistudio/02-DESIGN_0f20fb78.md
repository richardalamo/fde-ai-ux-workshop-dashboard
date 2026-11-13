# DESIGN.md: project dashboard

The rules every screen of this app follows. When you ask the AI for a change, tell it to follow this file. When a rule here changes, the whole app should change with it.

## Purpose and tone

An internal work tool for busy project managers. Calm, clear and dense enough to scan: the screen answers "what needs me today?" before anything else. No decoration, no marketing language.

## Colours

| Role | Hex | Use |
|---|---|---|
| Primary | `#2B59C3` | Primary buttons, links, the selected navigation item, focus rings |
| Text | `#1B1F24` | All main text |
| Secondary text | `#57606A` | Labels, metadata, helper text |
| Border | `#D0D7DE` | Card and table borders, dividers |
| Page background | `#F6F8FA` | Behind cards |
| Surface | `#FFFFFF` | Cards, tables, panels |

**Status colours.** Each status has a text colour and a background. A status is always shown as a badge with its word, never as colour alone.

| Status | Text | Background | Meaning |
|---|---|---|---|
| Overdue | `#B42318` | `#FDECEC` | Due date has passed and the task isn't done |
| Due soon | `#9A5B00` | `#FFF4E0` | Due within 3 days and not done |
| On track | `#1E7B34` | `#E8F5E9` | In progress, due later |
| Done | `#57606A` | `#EEF1F4` | Finished |
| Blocked | `#6E3FC1` | `#F1EBFC` | Can't move until something else happens |

## Typography

- Font: Inter, falling back to the system sans-serif.
- Page title: 24 px, semibold. Section title: 18 px, semibold. Body: 14 px, regular. Small labels: 12 px, medium.
- Numbers in tables and cards use tabular figures so columns line up.
- Sentence case everywhere ("Due this week", not "Due This Week").

## Spacing and layout

- Spacing scale: 4, 8, 12, 16, 24, 32 px. Use only these values.
- Page padding 24 px. Card padding 16 px. Gap between cards 16 px.
- Corner radius: 8 px for cards and panels, 6 px for buttons and inputs, full round for badges.
- Layout: a left navigation bar (220 px) with *Overview*, *Projects* and *Tasks*; the page content to its right. Below 768 px wide, the navigation collapses into a menu button.
- Density: table rows are 44 px high. Show as many tasks as fit; don't pad rows out.

## Components

- **Buttons.** Primary (filled, primary colour), secondary (white with border), danger (red text, white background). At most one primary button per view. Labels are verbs: "Approve", "Save", "Return", never "OK" or "Submit".
- **Status badge.** A rounded label in the status colours above, with the status word.
- **Summary card.** A white card with a small label, one big number (28 px, semibold) and one line of context underneath, for example "4 overdue · oldest 9 days".
- **Task row.** Title, project, owner (initials avatar and name), due date, status badge. An overdue due date is shown in the overdue colour with how late it is: "9 days overdue".
- **Filter bar.** One row above a table: search box, then dropdowns for status, owner and project, then "Clear filters". Active filters are visible at a glance.
- **Detail panel.** Opens from the right, 420 px wide, over the page. Shows everything about one task. Closes with a close button or the Esc key.
- **Toast.** A short message at the bottom of the screen after an action, for example "Task approved · Undo". Disappears after 5 seconds.
- **Dialog.** Only to confirm something that can't be undone.

## States

Every list, table and card handles all four:

- **Loading:** grey placeholder shapes where the content will appear, never a blank screen.
- **Empty:** one sentence saying why it's empty and, if there is one, the next action. Example: "No overdue tasks. Nice work."
- **Error:** what went wrong in plain words and a "Try again" button.
- **Success:** a toast confirming what happened.

## Interaction rules

- Every action gets a visible response within a second: a toast, a change on screen, or a loading state.
- Changes can be undone from the toast for 5 seconds. Things that can't be undone get a confirmation dialog first.
- Clicking a task anywhere in the app opens the same detail panel.
- Filters and sorting stay as the user set them when they come back to a page.

## Accessibility

- Text contrast at least 4.5:1 against its background.
- Never use colour alone: every status has its word, every icon button has a label or tooltip.
- A visible focus ring (2 px, primary colour) on everything you can click or type in. Everything works with the keyboard.
- Click targets at least 32 px high.
