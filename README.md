# DateMate

DateMate is an Expo Router dating application built with JavaScript and React Native. The repository includes its mobile client and a PostgreSQL-backed Express API in [`backend/`](backend/README.md).

## Quick start

1. Install frontend dependencies from the repository root with `npm install`.
2. In one terminal, run `cd backend`, `npm install`, `npm run migrate`, then `npm run dev`. Configure `backend/.env` first using [backend/.env.example](backend/.env.example) and your PostgreSQL credentials.
3. In a second terminal, start Expo from the repository root with `npx expo start`. The root `.env` should set `EXPO_PUBLIC_API_URL=http://localhost:4000/api`; Android emulators need `http://10.0.2.2:4000/api` instead.
4. Create an account in the app to reach the home screen. The embedded local database option and standard PostgreSQL setup are in [backend setup](backend/README.md#setup).

The API needs SMTP credentials for password reset emails and an S3 compatible object store for profile photos. Google and Apple sign-in additionally require provider credentials and callback URI configuration. Without these secrets, those specific actions return a clear configuration error; the app does not invent successful accounts, matches, or conversations.

See [`backend/README.md`](backend/README.md) for PostgreSQL provisioning, migrations, seeding, every REST route, Socket.IO events, security notes, environment variables, and test commands.
