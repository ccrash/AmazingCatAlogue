# AmazingCatAlogue

A React Native / Expo mobile app that integrates with [The Cat API](https://thecatapi.com) to browse, upload, favourite, and vote on cat images.

![App recording](./assets/ios_recording.gif)

---

## Features

- **Browse your cats** — paginated feed of images you've uploaded, ordered newest first.
- **Upload a cat** — pick an image from your device library, upload it to The Cat API, and it is automatically added to your favourites.
- **Favourite / unfavourite** — heart button on each card synced with the `/favourites` API endpoint; persisted locally so the heart state survives restarts.
- **Vote up / down** — ▲ / ▼ buttons on each card, with an optimistic score update and rollback on failure.
- **Score display** — net score (upvotes − downvotes) shown between the vote buttons, loaded fresh from `/votes` on each launch.
- **Light / dark theme** — follows the OS preference by default; a header toggle lets you override it. Themes are persisted across sessions.
- **Cross-platform** — smooth, consistent UI on Android, iOS, and web.

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
# Run once
node node_modules/jest-expo/bin/jest.js --watchAll=false

# Watch mode
node node_modules/jest-expo/bin/jest.js

# Coverage
node node_modules/jest-expo/bin/jest.js --coverage
```
