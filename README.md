# DateMate

DateMate is an Expo Router dating application built with JavaScript and React Native. The repository includes its mobile client and a PostgreSQL-backed Express API in [`backend/`](backend/README.md).

## Quick start

1. Install frontend dependencies from the repository root with `npm install`.
2. In one terminal, run `cd backend` then `npm run dev:local` to start the API with the bundled development database. To use PostgreSQL, configure `backend/.env` from [backend/.env.example](backend/.env.example), then run migrations and start the API as described in the backend guide.
3. In a second terminal, run `npm start` from the repository root. On a physical device, keep it on the same Wi-Fi network as the computer and allow Node.js through the private network firewall. The app discovers the Expo host automatically. Android emulators use `http://10.0.2.2:4000/api`; iOS simulators use `http://localhost:4000/api`.
4. Create an account in the app to reach the home screen. The embedded local database option and standard PostgreSQL setup are in [backend setup](backend/README.md#setup).

The API needs SMTP credentials for password reset emails and Cloudinary credentials for profile photo uploads. Google and Apple sign-in additionally require provider credentials and callback URI configuration. Without these secrets, those specific actions return a clear configuration error; the app does not invent successful accounts, matches, or conversations.

See [`backend/README.md`](backend/README.md) for PostgreSQL provisioning, migrations, seeding, every REST route, Socket.IO events, security notes, environment variables, and test commands.
