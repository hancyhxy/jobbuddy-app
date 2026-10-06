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

EventBuddy opens in **presentation mode**: a 10-step script (desk → QR → confirm code → paired → idle → link code → waiting → linked icebreaker → return → wiped). Advance with **Next ▶**; the single **Meet** button (press = yes, hold = no) and the NFC strip also work where they make sense. A *Presenter* note under each step says what to do on the JobBuddy phone. ⋯ lets you restart, hide the notes, and set the name, avatar, colour and career line shown on EventBuddy (match your EventBuddy profile).

On the JobBuddy phone, **Scan device → Tap to scan** opens the real rear camera. Point it at the QR on EventBuddy and it “finds” EB-07 after about 2 seconds, then shows code 4812. This is staged: there is no QR decoding and no network. After pressing Meet on EventBuddy, tap **DEMO EventBuddy shows ✓ — continue** on the phone.

### Free play (manual operator)

Each device keeps its own local state, so the presenter moves both sides along:

- **EventBuddy ⋯ operator menu:** 1 Staff assigns EventBuddy → 2 Phone sends pair request → press Meet → tap the **NFC** strip to touch EventBuddy devices with someone → same link code on both → press Meet to link (hold = cancel) → icebreaker (press for a new one, hold when done) → 3 Staff confirms return. It can also choose who the EventBuddy shows.
- **Phone:** after pairing, **DEMO EventBuddy shows ✓ — continue** stands in for the EventBuddy's Meet press. In Live → Met, **DEMO Linked with … on the other device** adds the tap that the EventBuddy would sync.
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

Week 9 revision: the event page follows the event itself — **Before → During → After**. The wearable leads in person; the app supports before and after. Spec: the teammate's Figma board *Event flow (Week 9 revision)*.

**In person — “Build Night: AI Agents in Practice”**

1. **Home → Your events** has *Upcoming* / *Past* tabs. Rows show *Confirm attendance*, *Going*, *Waitlist · #3* or, for past events, *N connections*. No sign-up is needed to browse.
2. Event → **RSVP** (log in if asked). Registration has one visibility switch, *Let people see I’m going*. Build Night needs host approval → **DEMO Host approves**.
3. **Before:** confirm attendance 24h before (*I’m coming* / *Can’t make it*); unconfirmed spots go to the waitlist. The page shows the confirmed count, *See who’s going*, and **Set up your EventBuddy profile** (recommended, optional).
4. **EventBuddy profile:** the core profile is filled once and reused for every event (avatar, career background, experience, looking for, vibe; MBTI and hobbies optional, never on the device). Then the host’s **questions for this event** (hoping to get, openness, skill level, opening message, auto-reply) → **You’re all set** review of what strangers will see.
5. **Check in at the event** → DEMO Staff scans pass → DEMO Staff hands you EB-07 → **Scan device** → same code 4812 on both → press Meet → *You’re connected* → **During**.
6. **During:** progress bar, *N here now*, the EventBuddy status card, and *met so far / pending / in the room*. On the EventBuddy, tap with Marcus → same link code → press Meet → linked icebreaker, saved quietly. Tap with Priya: she doesn’t press, so it is saved as **pending** (During → *pending* opens the list; DEMO *Priya taps back*).
7. *Leaving? Return EventBuddy* → DEMO Staff confirms return → **Taps synced** (“1 new connection from today”) → **Review in Network** → Requests: **Accept / Decline**, with *Met at …* and their auto-reply.
8. **After** (try *Portfolio Night: Career Swap* under Past): *You attended*, *See who was there*, People you met (Connected / Request pending / Accept), **+ Add a memory** (photo + one line, shared after the event, open for 7 days), Shared stories, and an optional **Follow-up** group thread.

**Waitlist — “Portfolio Crit Circle”** is full: RSVP → *Join waitlist* (#3) → DEMO *Someone releases their spot* → *Claim my spot*.

**Online — “Career Switch Stories: Into UX”**

1. Register (instant) → Join lobby: check visibility, then Enter event (this confirms attendance).
2. Room: stage card (the Zoom stream is mocked), People list with Wave.
3. Wave at Marcus. Once both say yes, a shared prompt appears and you can save the encounter. Waving at Priya shows no reply, which is the no-pressure path.
4. **DEMO David waves at you** → Wave back or Ignore quietly.
5. Leave event → recap.

## Tabs and naming

Tabs follow the teammate prototype: **Event** (home + Event Explorer; search via the round button), **Community** (Community / Networks), **Messages** (chat with connections) and **Account**. The event device is called **EventBuddy** (URL path stays `tappy/`). Visual design and copy follow the teammate version; the interaction logic below is unchanged.

- **Community → Networks:** Connections, Requests (*Accept* / *Decline*, with where you met and their auto-reply), Explore who else was there, Event Circles (members-only circle pages with Stories and Attendees).
- **Nobody can contact a poster directly:** *Connect* sends a request with an optional note (150 chars); *Message* sends a first message as a request (200 chars, expires in 7 days). The chat stays locked until they accept (DEMO accept on the chat page).
- **Create event:** ＋ next to “Hi, Emma” on the Event tab (search moved next to Event Explorer). Cover, name, date & time, online toggle, location, capacity, waitlist, approval, EventBuddy devices, circle, description → Publish. Hosted events show “Hosting” in Your events and “Hosted by You” with a Share invite link CTA. Saved locally.
- **Pods:** small invite-only groups (Networks → Pods, + to create). Only connections can be invited. Each pod has Chat and To-do tabs. Chats (pods and direct) share one component: Enter sends; ⊕ opens Event (share an event card), Album and Camera (mocked). Member replies are simulated.
- **Messages:** Pods (group chats) and Direct chats; direct messages only between connections (mutual follows). Unread counts show on the Messages tab.

## Community, connections and growth

- **Two avatars:** a real profile photo (`people/`, fictional GPT-generated portraits) is used in the app and at online events. The ASCII EventBuddy avatar is part of the one EventBuddy profile and is shown on EventBuddy and the participant wall.
- **Connections = mutual requests** (LinkedIn-style). *Connect* sends a request; when both sides say yes you are *Connected*. Event rows and event pages show round photos of connections who are going (Build Night: 4; Career Switch Stories: 1).
- **Community:** *Public* (open questions, takeaways, referrals, going-together, wins), *My circles* (members-only circles joined by attending their events, followed on the same page by Connections and their public posts). Posts can be Question, Takeaway, Resource, Offer help, Referral, Going together or Win. Replies open a comment sheet.
- **Me:** level card, connections / followers / following / met, **Career tools** (AI CV review: 3 free a month; mock interview with a real practitioner: 1 free a month), the two avatars, events and settings.
- **Growth & points:** post +10, event takeaway +15, comment +3, marked helpful +5, received comment +2, check-in +20, new connection +5, with fair-play caps. Levels: Newcomer → Explorer → Contributor → Connector → Mentor → Community Leader. Points redeem for an extra AI CV review (30), an extra mock interview (80) or a priority spot (150).
- **How growth works** (ⓘ at the top right of Growth & points, or on the Me level card): a full-screen explainer with a take part → earn → level up flow, a level track showing where you are, perks per level, the points table with bars, a “one good week” stacked-bar example, and spend-vs-level bars. Levels use lifetime points, so redeeming never lowers your level.
- The demo account (*Log in*) starts with 5 connections, 2 people waiting for a follow-back (Marcus, Ahmed) and 140 pts. Following David triggers a simulated follow-back.

## Interaction rules encoded

- Pair ≠ Tap ≠ Connect. Pairing links a loan EventBuddy to one account. A tap only *asks* to link. Connecting happens later, at home: synced taps arrive as requests you accept or decline.
- The device has one Meet button: press = yes, hold = no. The icebreaker appears only after both press; it is career-focused, not based on personality answers. If the other person doesn’t press, the tap stays *pending*. Declines are silent.
- One EventBuddy profile for every event, plus per-event host questions. The device shows avatar, name and career line only.
- Registration, attendance and check-in are separate states: waitlist / offered / pending / going / confirmed / checked in / attended. Matching, *Who’s here* and taps only include people who checked in.
- Memories are labelled *Shared after the event* with a day stamp, never “live”, and archive after 7 days.
- The EventBuddy is optional. The *Continue without a EventBuddy* path uses in-app hi requests.
- A returned EventBuddy is wiped. Saved encounters stay in the app.
- Points reward contribution and helpfulness. Redeeming them works in the prototype (local, mocked).

## Structure

- `index.html`, `styles.css`: shell and design language, following the teammate JoBuddy prototype (white, Inter, black actions, green selection, grainy gradient art, coloured tab icons). Light only; the EventBuddy device stays dark, like hardware.
- `js/app.js`: state, router, views, EventBuddy simulator, demo actions.
- `js/data.js`: fictional events, people, posts, prompts.
- `js/avatar.js`, `js/sprites.js`: 18×18 ASCII avatars adapted from The Pudding's *Hello, Stranger* (MIT, 2022) via Anonymous Connection.
- `covers/`: event cover art generated with GPT image generation (fictional events and logos). Tech events use bold type with a logo; community and arts events use colourful poster styles.
- `tappy/`: standalone EventBuddy app (fullscreen, NFC strip, single Meet button, operator menu), sharing `js/data.js` and `js/avatar.js`.
- `manifest.webmanifest`, `sw.js`, `icons/`: PWA install and offline cache.

## Not included yet

- Real multi-device sync. The phone and EventBuddy are linked only when they run in the same browser; otherwise the operator/DEMO controls bridge them.
- ESP32 firmware. EventBuddy screens are 240×240, with one Meet button (press / hold) and an NFC zone, so the next step can port them.
- Organiser tools beyond the DEMO staff actions, circle pages, replies and star redemption.
