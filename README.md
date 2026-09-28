# JobBuddy App Prototype (PWA)

A runnable, installable mobile web app for JobBuddy's final prototype. It covers the full online and in-person event journeys. The event badge is **simulated in software**, so the interaction can be finalised before it moves to ESP32 hardware.

## Open it

```bash
./run.command          # serves on port 8080
```

- Laptop: <http://localhost:8080>. The phone and the simulated badge appear side by side.
- Phone on the same Wi-Fi: use the second URL that `run.command` prints. Tap **Badge** (floating button) to open the badge.
- Install: Safari → Share → Add to Home Screen.

All data is fictional and stays in the browser's `localStorage`. **Me → Reset demo** starts again from the beginning.

## Demo script

**In person — “Build Night: AI Agents in Practice”**

1. Onboarding: name, field, private career stage, up to 3 interests, ASCII avatar.
2. Event → Request to join → **DEMO Host approves** (shows the Pending → Approved states).
3. I’m here → **DEMO Staff scans pass** → **DEMO Staff hands you badge JB-07**, or *Continue without a badge*.
4. Pair: typing a wrong ID shows an error. *Tap to scan* fills JB-07. The phone and badge show the same code, and you press ● on the badge to confirm.
5. Live: participant wall (opt-in), agenda, saved encounters.
6. On the badge, use the DEMO chips to tap with Marcus. Press ● to say yes, then a shared prompt appears. Press ● again to save. Tap with Priya to see a “not now” decline where nothing is shared.
7. Return badge → **DEMO Staff confirms return** → the badge is wiped → recap.
8. Recap: one-way Follow, host message, share-a-takeaway prompt, rating, next events.
9. Post a takeaway. A few seconds later a simulated Star arrives, and the balance shows under Community → ★.

**Online — “Career Switch Stories: Into UX”**

1. Register (instant) → Join lobby: check visibility, then Enter event (this confirms attendance).
2. Room: stage card (the Zoom stream is mocked), People list with Wave.
3. Wave at Marcus. Once both say yes, a shared prompt appears and you can save the encounter. Waving at Priya shows no reply, which is the no-pressure path.
4. **DEMO David waves at you** → Wave back or Ignore quietly.
5. Leave event → the same recap as in person.

## Interaction rules encoded

- Pair ≠ Tap ≠ Follow. Pairing links a loan badge to one account. A tap only *asks* to talk. Follow is a separate, one-way choice in the app.
- The shared prompt appears only after both people say yes. Declines and unanswered waves are silent.
- Registration, check-in and attendance are separate states: pending / declined / going / checked in / attended.
- The badge is optional. The *Continue without a badge* path uses in-app hi requests.
- A returned badge is wiped. Saved encounters stay in the app.
- Stars reward helpfulness, not popularity. Redeeming them for AI CV review is concept only.

## Structure

- `index.html`, `styles.css`: shell and design language (dark, Spotify-inspired, accent `#D7FF3A`).
- `js/app.js`: state, router, views, badge simulator, demo actions.
- `js/data.js`: fictional events, people, posts, prompts.
- `js/avatar.js`, `js/sprites.js`: 18×18 ASCII avatars adapted from The Pudding's *Hello, Stranger* (MIT, 2022) via Anonymous Connection.
- `manifest.webmanifest`, `sw.js`, `icons/`: PWA install and offline cache.

## Not included yet

- Real multi-device sync (each phone runs its own local simulation).
- ESP32 firmware. Badge screens are 240×240, with ● / ○ buttons and an NFC zone, matching the Anonymous Connection hardware so the next step can port them.
- Organiser tools beyond the DEMO staff actions, circle pages, replies and star redemption.
