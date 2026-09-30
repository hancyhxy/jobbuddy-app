# JobBuddy App Prototype (PWA)

A runnable, installable mobile web app for JobBuddy's final prototype. It covers the full online and in-person event journeys. The event device, **EventBuddy**, is **simulated in software**, so the interaction can be finalised before it moves to ESP32 hardware.

## Install on phones — two apps

| App | Role | URL |
| --- | --- | --- |
| **JobBuddy** | Attendee phone app | <https://hancyhxy.github.io/jobbuddy-app/> |
| **EventBuddy** | Event device (stand-in for the ESP32 hardware) | <https://hancyhxy.github.io/jobbuddy-app/tappy/> |

Install each app from its URL, ideally on two different phones.

- iPhone: open it in Safari, tap Share, then Add to Home Screen.
- Android: open it in Chrome, tap ⋮, then Install app (or Add to Home screen).

Once opened, it launches full-screen from the home-screen icon and works offline. To publish local edits, run `./deploy.command` (public repo `hancyhxy/jobbuddy-app`; it syncs into the standalone clone at `education/2026-spring/jobbuddy-app/` and pushes only the changes).

### Two-phone demo: presentation mode (recommended)

EventBuddy opens in **presentation mode**: an 11-step script (desk → QR → confirm code → paired → avatar → tap → waiting → shared prompt → saved → return → wiped). Advance with **Next ▶**; ● / ○ and the NFC strip also work where they make sense. A *Presenter* note under each step says what to do on the JobBuddy phone. ⋯ lets you restart, hide the notes, and set the name, avatar, colour and tag shown on EventBuddy (match what you picked when registering).

On the JobBuddy phone, **Pair EventBuddy → Tap to scan** opens the real rear camera. Point it at the QR on EventBuddy and it “finds” EB-07 after about 2 seconds, then shows code 4812. This is staged: there is no QR decoding and no network. After pressing ● on EventBuddy, tap **DEMO EventBuddy shows ✓ — continue** on the phone.

### Free play (manual operator)

Each device keeps its own local state, so the presenter moves both sides along:

- **EventBuddy ⋯ operator menu:** 1 Staff assigns EventBuddy → 2 Phone sends pair request → press ● → tap the **NFC** strip to touch EventBuddy devices with someone → ● yes → ● save → 3 Staff confirms return. It can also choose who the EventBuddy shows.
- **Phone:** after pairing, **DEMO EventBuddy on another device: confirmed** stands in for the EventBuddy's ●. In Live → Saved, **DEMO EventBuddy on another device saved …** adds the encounter that the EventBuddy would sync.
- **Same browser:** open both apps in two windows of the same browser (e.g. on a laptop) and they sync automatically through shared local storage.

## Run locally

```bash
./run.command          # serves on port 8080
```

- Laptop: <http://localhost:8080>. The phone and the simulated EventBuddy appear side by side.
- Phone on the same Wi-Fi: use the second URL that `run.command` prints. Tap **EventBuddy** (floating button) to open the badge.
- Install: Safari → Share → Add to Home Screen.

All data is fictional and stays in the browser's `localStorage`. **Account → Reset demo data** starts again from the beginning.

## Demo script

**In person — “Build Night: AI Agents in Practice”**

1. The app opens straight on **Home** (Luma-style discovery: Your events, then Picked for you grouped by date, with an All / In person / Online switch). No sign-up is needed to browse.
2. Event → Request to join → **Log in** (email / Apple / Google, all mocked as the demo account; or *Create an account*: name, field, private stage, interests) → registration.
   For EventBuddy events, registration includes **Your EventBuddy for this event**: avatar, colour and one tag. It is saved per event and can be changed from the pass (*Your EventBuddy look → Change*). The EventBuddy and participant wall show this look, not the account profile. → **DEMO Host approves** (shows the Pending → Approved states).
3. I’m here → **DEMO Staff scans pass** → **DEMO Staff hands you EventBuddy EB-07**, or *Continue without a EventBuddy*.
4. Pair: typing a wrong ID shows an error. *Tap to scan* fills EB-07. The phone and EventBuddy show the same code, and you press ● on the EventBuddy to confirm.
5. Live: participant wall (opt-in), agenda, saved encounters.
6. On the EventBuddy, use the DEMO chips to tap with Marcus. Press ● to say yes, then a shared prompt appears. Press ● again to save. Tap with Priya to see a “not now” decline where nothing is shared.
7. Return EventBuddy → **DEMO Staff confirms return** → the EventBuddy is wiped → recap.
8. Recap: one-way Follow, host message, share-a-takeaway prompt, rating, next events.
9. Post a takeaway. A few seconds later a simulated Star arrives, and the balance shows under Community → ★.

**Online — “Career Switch Stories: Into UX”**

1. Register (instant) → Join lobby: check visibility, then Enter event (this confirms attendance).
2. Room: stage card (the Zoom stream is mocked), People list with Wave.
3. Wave at Marcus. Once both say yes, a shared prompt appears and you can save the encounter. Waving at Priya shows no reply, which is the no-pressure path.
4. **DEMO David waves at you** → Wave back or Ignore quietly.
5. Leave event → the same recap as in person.

## Tabs and naming

Tabs follow the teammate prototype: **Event** (home + Event Explorer; search via the round button), **Community** (Community / Networks), **Messages** (chat with connections) and **Account**. The event device is called **EventBuddy** (URL path stays `tappy/`). Visual design and copy follow the teammate version; the interaction logic below is unchanged.

- **Community → Networks:** Connections, Requests (people who follow you but you have not followed back: *Not now* / *Follow back*), Explore who else was there, Event Circles (members-only circle pages with Stories and Attendees).
- **Pods:** small invite-only groups (Networks → Pods, + to create). Only connections can be invited. Each pod has Chat (messages + shared event cards), To-do (tick/add) and Events (shared events to go to together). Member replies are simulated.
- **Messages:** Pods (group chats) and Direct chats; direct messages only between connections (mutual follows). Unread counts show on the Messages tab.

## Community, connections and growth

- **Two avatars:** a real profile photo (`people/`, fictional GPT-generated portraits) is used in the app and at online events. The ASCII EventBuddy avatar is chosen per in-person event and shown on EventBuddy and the participant wall.
- **Connections = mutual follows** (LinkedIn-style). Anyone can follow anyone. When both follow, you are *Connected*. Event rows and event pages show round photos of connections who are going (Build Night: 4; Career Switch Stories: 1).
- **Community:** *Public* (open questions, takeaways, referrals, going-together, wins), *My circles* (members-only circles joined by attending their events, followed on the same page by Connections and their public posts). Posts can be Question, Takeaway, Resource, Offer help, Referral, Going together or Win. Replies open a comment sheet.
- **Me:** level card, connections / followers / following / met, **Career tools** (AI CV review: 3 free a month; mock interview with a real practitioner: 1 free a month), the two avatars, events and settings.
- **Growth & points:** post +10, event takeaway +15, comment +3, marked helpful +5, received comment +2, check-in +20, new connection +5, with fair-play caps. Levels: Newcomer → Explorer → Contributor → Connector → Mentor → Community Leader. Points redeem for an extra AI CV review (30), an extra mock interview (80) or a priority spot (150).
- **How growth works** (ⓘ at the top right of Growth & points, or on the Me level card): a full-screen explainer with a take part → earn → level up flow, a level track showing where you are, perks per level, the points table with bars, a “one good week” stacked-bar example, and spend-vs-level bars. Levels use lifetime points, so redeeming never lowers your level.
- The demo account (*Log in*) starts with 5 connections, 2 people waiting for a follow-back (Marcus, Ahmed) and 140 pts. Following David triggers a simulated follow-back.

## Interaction rules encoded

- Pair ≠ Tap ≠ Follow. Pairing links a loan EventBuddy to one account. A tap only *asks* to talk. Follow is a separate choice in the app; a mutual follow becomes a connection.
- The shared prompt appears only after both people say yes. Declines and unanswered waves are silent.
- Registration, check-in and attendance are separate states: pending / declined / going / checked in / attended.
- The EventBuddy is optional. The *Continue without a EventBuddy* path uses in-app hi requests.
- A returned EventBuddy is wiped. Saved encounters stay in the app.
- Points reward contribution and helpfulness. Redeeming them works in the prototype (local, mocked).

## Structure

- `index.html`, `styles.css`: shell and design language, following the teammate JoBuddy prototype (white, Inter, black actions, green selection, grainy gradient art, coloured tab icons). Light only; the EventBuddy device stays dark, like hardware.
- `js/app.js`: state, router, views, EventBuddy simulator, demo actions.
- `js/data.js`: fictional events, people, posts, prompts.
- `js/avatar.js`, `js/sprites.js`: 18×18 ASCII avatars adapted from The Pudding's *Hello, Stranger* (MIT, 2022) via Anonymous Connection.
- `covers/`: event cover art generated with GPT image generation (fictional events and logos). Tech events use bold type with a logo; community and arts events use colourful poster styles.
- `tappy/`: standalone EventBuddy app (fullscreen, NFC strip, ● / ○ buttons, operator menu), sharing `js/data.js` and `js/avatar.js`.
- `manifest.webmanifest`, `sw.js`, `icons/`: PWA install and offline cache.

## Not included yet

- Real multi-device sync. The phone and EventBuddy are linked only when they run in the same browser; otherwise the operator/DEMO controls bridge them.
- ESP32 firmware. EventBuddy screens are 240×240, with ● / ○ buttons and an NFC zone, matching the Anonymous Connection hardware so the next step can port them.
- Organiser tools beyond the DEMO staff actions, circle pages, replies and star redemption.
