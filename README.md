# AmazingCatAlogue

A React Native / Expo mobile app that integrates with [The Cat API](https://thecatapi.com) to browse, upload, favourite, and vote on cat images.

---

![plot](./assets/screenshots/ios_recording.gif)

---

## Features

- **Browse your cats** — paginated feed of images you've uploaded, ordered newest first.
- **Upload a cat** — pick an image from your device library and upload it to The Cat API.
- **Favourite / unfavourite** — heart button on each card synced with the `/favourites` API endpoint; persisted locally so the heart state survives restarts.
- **Vote up / down** — ▲ / ▼ buttons on each card, with an optimistic score update and rollback on failure.
- **Score display** — net score (upvotes − downvotes) shown between the vote buttons, loaded fresh from `/votes` on each launch.
- **Breed search** — search and browse cat breeds with paginated results and pull-to-refresh.
- **Light / dark theme** — follows the OS preference by default; a header toggle lets you override it. Themes are persisted across sessions.
- **Cross-platform** — smooth, consistent UI on IOS and Android.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/client) on iOS or Android

### Environment

Create a `.env.local` file in the project root with your Cat API key:

```
EXPO_PUBLIC_CAT_API_KEY=your_api_key_here
```

Get a free key at [thecatapi.com](https://thecatapi.com).

### Install & Run

```bash
yarn install
yarn start
```

Scan the QR code in the terminal with Expo Go to launch the app.

---

## Running Tests

```bash
# Watch mode
yarn test

# Coverage
yarn coverage
```

---

## Robustness

- **Per-screen error boundaries** — each tab screen catches its own errors and shows a "Try again" prompt, so a crash in one tab never affects the others.
- **Search result ordering** — rapid queries are sequenced so a slow in-flight response can never overwrite the results of a newer one.
- **Image height capping** — portrait or extreme-aspect-ratio images are capped at 2× the screen width to prevent oversized cards.


## License

This project is licensed under a custom non-commercial license.

❗ Commercial use is prohibited  
❗ Use in AI/ML systems is strictly prohibited without permission