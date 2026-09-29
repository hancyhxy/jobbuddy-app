# JobBuddy App Prototype (PWA)

A runnable, installable mobile web app for JobBuddy's final prototype. It covers the full online and in-person event journeys. The event device, **Tappy**, is **simulated in software**, so the interaction can be finalised before it moves to ESP32 hardware.

## Install on phones — two apps

| App | Role | URL |
| --- | --- | --- |
| **JobBuddy** | Attendee phone app | <https://hancyhxy.github.io/jobbuddy-app/> |
| **Tappy** | Event device (stand-in for the ESP32 hardware) | <https://hancyhxy.github.io/jobbuddy-app/tappy/> |

Install each app from its URL, ideally on two different phones.

- iPhone: open it in Safari, tap Share, then Add to Home Screen.
- Android: open it in Chrome, tap ⋮, then Install app (or Add to Home screen).

Once opened, it launches full-screen from the home-screen icon and works offline. To publish local edits, run `./deploy.command` (public repo `hancyhxy/jobbuddy-app`).

### Two-device demo (devices not linked yet)

Each device keeps its own local state, so the presenter moves both sides along:

- **Tappy ⋯ operator menu:** 1 Staff assigns Tappy → 2 Phone sends pair request → press ● → tap the **NFC** strip to touch Tappys with someone → ● yes → ● save → 3 Staff confirms return. It can also choose who the Tappy shows.
- **Phone:** after pairing, **DEMO Tappy on another device: confirmed** stands in for the Tappy's ●. In Live → Saved, **DEMO Tappy on another device saved …** adds the encounter that the Tappy would sync.
- **Same browser:** open both apps in two windows of the same browser (e.g. on a laptop) and they sync automatically through shared local storage.

## Run locally

```bash
./run.command          # serves on port 8080
```

- Laptop: <http://localhost:8080>. The phone and the simulated Tappy appear side by side.
- Phone on the same Wi-Fi: use the second URL that `run.command` prints. Tap **Tappy** (floating button) to open the badge.
- Install: Safari → Share → Add to Home Screen.

All data is fictional and stays in the browser's `localStorage`. **Me → Reset demo** starts again from the beginning.

## Demo script

**In person — “Build Night: AI Agents in Practice”**

1. The app opens straight on **Home** (Luma-style discovery: Your events, then Picked for you grouped by date, with an All / In person / Online switch). No sign-up is needed to browse.
2. Event → Request to join → **Log in** (email / Apple / Google, all mocked as the demo account; or *Create an account*: name, field, private stage, interests) → registration.
   For Tappy events, registration includes **Your Tappy for this event**: avatar, colour and one tag. It is saved per event and can be changed from the pass (*Your Tappy look → Change*). The Tappy and participant wall show this look, not the account profile. → **DEMO Host approves** (shows the Pending → Approved states).
3. I’m here → **DEMO Staff scans pass** → **DEMO Staff hands you Tappy JB-07**, or *Continue without a Tappy*.
4. Pair: typing a wrong ID shows an error. *Tap to scan* fills JB-07. The phone and Tappy show the same code, and you press ● on the Tappy to confirm.
5. Live: participant wall (opt-in), agenda, saved encounters.
6. On the Tappy, use the DEMO chips to tap with Marcus. Press ● to say yes, then a shared prompt appears. Press ● again to save. Tap with Priya to see a “not now” decline where nothing is shared.
7. Return Tappy → **DEMO Staff confirms return** → the Tappy is wiped → recap.
8. Recap: one-way Follow, host message, share-a-takeaway prompt, rating, next events.
9. Post a takeaway. A few seconds later a simulated Star arrives, and the balance shows under Community → ★.

**Online — “Career Switch Stories: Into UX”**

1. Register (instant) → Join lobby: check visibility, then Enter event (this confirms attendance).
2. Room: stage card (the Zoom stream is mocked), People list with Wave.
3. Wave at Marcus. Once both say yes, a shared prompt appears and you can save the encounter. Waving at Priya shows no reply, which is the no-pressure path.
4. **DEMO David waves at you** → Wave back or Ignore quietly.
5. Leave event → the same recap as in person.

## Community, connections and growth

- **Two avatars:** a real profile photo (`people/`, fictional GPT-generated portraits) is used in the app and at online events. The ASCII Tappy avatar is chosen per in-person event and shown on Tappy and the participant wall.
- **Connections = mutual follows** (LinkedIn-style). Anyone can follow anyone. When both follow, you are *Connected*. Event rows and event pages show round photos of connections who are going (Build Night: 4; Career Switch Stories: 1).
- **Community:** *Public* (open questions, takeaways, referrals, going-together, wins), *My circles* (members-only circles joined by attending their events), *Connections*. Posts can be Question, Takeaway, Resource, Offer help, Referral, Going together or Win. Replies open a comment sheet.
- **Me:** level card, connections / followers / following / met, **Career tools** (AI CV review: 3 free a month; mock interview with a real practitioner: 1 free a month), the two avatars, events and settings.
- **Growth & points:** post +10, event takeaway +15, comment +3, marked helpful +5, received comment +2, check-in +20, new connection +5, with fair-play caps. Levels: Newcomer → Explorer → Contributor → Connector → Mentor → Community Leader. Points redeem for an extra AI CV review (30), an extra mock interview (80) or a priority spot (150).
- **How growth works** (ⓘ at the top right of Growth & points, or on the Me level card): a full-screen explainer with a take part → earn → level up flow, a level track showing where you are, perks per level, the points table with bars, a “one good week” stacked-bar example, and spend-vs-level bars. Levels use lifetime points, so redeeming never lowers your level.
- The demo account (*Log in*) starts with 5 connections, 2 people waiting for a follow-back (Marcus, Ahmed) and 140 pts. Following David triggers a simulated follow-back.

## Interaction rules encoded

- Pair ≠ Tap ≠ Follow. Pairing links a loan Tappy to one account. A tap only *asks* to talk. Follow is a separate choice in the app; a mutual follow becomes a connection.
- The shared prompt appears only after both people say yes. Declines and unanswered waves are silent.
- Registration, check-in and attendance are separate states: pending / declined / going / checked in / attended.
- The Tappy is optional. The *Continue without a Tappy* path uses in-app hi requests.
- A returned Tappy is wiped. Saved encounters stay in the app.
- Points reward contribution and helpfulness. Redeeming them works in the prototype (local, mocked).

## Structure

- `index.html`, `styles.css`: shell and design language (Spotify-inspired, accent `#D7FF3A`; dark and light themes: sun/moon button on Home, or Me → Appearance → System/Light/Dark. The Tappy always stays dark, like hardware).
- `js/app.js`: state, router, views, Tappy simulator, demo actions.
- `js/data.js`: fictional events, people, posts, prompts.
- `js/avatar.js`, `js/sprites.js`: 18×18 ASCII avatars adapted from The Pudding's *Hello, Stranger* (MIT, 2022) via Anonymous Connection.
- `covers/`: event cover art generated with GPT image generation (fictional events and logos). Tech events use bold type with a logo; community and arts events use colourful poster styles.
- `tappy/`: standalone Tappy app (fullscreen, NFC strip, ● / ○ buttons, operator menu), sharing `js/data.js` and `js/avatar.js`.
- `manifest.webmanifest`, `sw.js`, `icons/`: PWA install and offline cache.

## Not included yet

- Real multi-device sync. The phone and Tappy are linked only when they run in the same browser; otherwise the operator/DEMO controls bridge them.
- ESP32 firmware. Tappy screens are 240×240, with ● / ○ buttons and an NFC zone, matching the Anonymous Connection hardware so the next step can port them.
- Organiser tools beyond the DEMO staff actions, circle pages, replies and star redemption.
