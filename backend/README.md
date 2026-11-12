# DateMate API

Express 5 REST API with Socket.IO, PostgreSQL (`pg`), bcrypt password hashing, rotating opaque refresh tokens, short lived JWT access tokens, and SQL migrations. The API runtime uses PostgreSQL; it does not substitute local in-memory state for accounts, likes, matches, messages, rate limits, or password resets.

## Requirements

- Node.js 20 or later and npm
- PostgreSQL 15 or later
- A PostgreSQL database and role with schema creation permissions
- SMTP credentials for working password reset emails
- An S3 compatible bucket and credentials or cloud instance role for profile photos
- Google and Apple OAuth credentials for those optional sign-in providers

## Setup

### Start without installing PostgreSQL

For local UI development, the repository includes a PostgreSQL-compatible embedded database. From `backend/`, run:

```sh
npm install
npm run dev:local
```

This creates the schema and interest catalogs automatically, then starts the API on port 4000. The local database persists in `backend/.local-db`; it is ignored by Git. It is intended for development only. In another terminal, start Expo from the repository root with `npx expo start` (the default app API URL is `http://localhost:4000/api`; Android emulators use `http://10.0.2.2:4000/api`). Register an account in the app to reach the home screen.

### Use PostgreSQL

From the repository root:

```sh
cd backend
npm install
Copy-Item .env.example .env   # PowerShell; on macOS/Linux use: cp .env.example .env
```

Create a database and least privilege login as a PostgreSQL administrator. Change the password before using this outside local development:

```sql
CREATE ROLE datemate LOGIN PASSWORD 'replace-with-a-local-secret';
CREATE DATABASE datemate OWNER datemate;
```

Set `DATABASE_URL` in `backend/.env` to `postgresql://datemate:replace-with-a-local-secret@localhost:5432/datemate`. Generate a JWT secret with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"` and set it in `.env`.

Initialize the schema and reference catalogs, then start the API:

```sh
npm run migrate
npm run seed
npm run dev
```

The API listens on `http://localhost:4000` by default. `GET /health` checks database connectivity. `npm start` runs the production entry point. Migrations are checksummed and never silently rewritten after application. The server refuses to start until migrations have been applied.

For non-production UI development, `npm run seed -- --demo` adds three marked demo profiles with `.invalid` addresses and randomly generated unusable passwords. Production discovery excludes demo rows and demo seeding is blocked when `NODE_ENV=production`. Catalog seeding is safe to repeat.

## Connect Expo

Create a root `.env` (Expo public variables are bundled into the app and must never contain server secrets):

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:4000/api
```

Use `http://10.0.2.2:4000/api` on an Android emulator. For a physical device, use the development computer's LAN IP address, allow port 4000 through the local firewall, and add the Expo development origin to `CORS_ORIGINS` if using Expo Web. Use HTTPS and a publicly reachable hostname for deployed builds. Restart Expo after changing the value. API access tokens are held in memory; refresh tokens are stored with Expo SecureStore on iOS/Android. On web, persistence is intentionally disabled because there is no equivalent protected store in this app integration.

## External credentials

The backend can start with the optional integrations blank, but it responds with an explicit `503` for operations requiring an unconfigured provider:

- **SMTP:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, and a deep link in `PASSWORD_RESET_URL` (for example `datematee://reset-password`). The app has a matching `/reset-password?token=...` route.
- **Private object storage:** `S3_BUCKET`, `S3_REGION`, and either `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY`, workload identity, or a compatible `S3_ENDPOINT`. Photos are uploaded from the API, stored as private objects, and exposed with expiring signed URLs. Deleted objects are removed by a retrying cleanup worker.
- **Google sign-in:** OAuth client ID/secret and the exact app callback URI in `OAUTH_REDIRECT_URIS`.
- **Apple sign-in:** Services ID/client ID, team ID, key ID, signing private key, and the same exact callback URI allowlist. Configure provider-side redirect URLs to match the app's `datematee://auth/callback` URI or your production universal/app link.

Configure `CORS_ORIGINS` as a comma separated exact allowlist for browser origins. Native apps normally send no browser Origin. Behind a trusted proxy, set `TRUST_PROXY` only to the number of proxies you control. Production requires HTTPS at the trusted edge, a unique secret, strict origin allowlisting, TLS for PostgreSQL where required, encrypted backups, and object storage lifecycle/access policies.

## API response and authentication conventions

Successful JSON responses use the named resource property shown below. Errors use `{ "error": { "code", "message", "requestId", "details?" } }`. Validation errors are `400`, unauthenticated requests are `401`, inaccessible resources are `403`/`404`, duplicate email conflicts are `409`, rate limits are `429`, and unconfigured external services are `503`. Send `Authorization: Bearer <accessToken>` to protected routes. Access tokens expire after 15 minutes by default. A remembered login returns a refresh token; rotate it using `POST /api/auth/refresh` and revoke the session with logout. Never log or store either token in plaintext server-side.

### Routes

| Method | Path | Auth | Request / result |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | `{ name, email, password }` (12+ characters); returns access/refresh tokens, the submitted onboarding name, and profile completion state |
| POST | `/api/auth/login` | No | `{ email, password, remember }` |
| POST | `/api/auth/refresh` | No | `{ refreshToken }`; rotates the refresh token |
| POST | `/api/auth/logout` | Yes | Revokes this session |
| GET | `/api/auth/session` | Yes | Validates session; returns safe account fields |
| POST | `/api/auth/forgot-password` | No | `{ email }`; sends a one time reset link through SMTP |
| POST | `/api/auth/reset-password` | No | `{ token, password }`; consumes token and revokes existing sessions |
| POST | `/api/auth/oauth/:provider` | No | `{ redirectUri }`; `provider` is `google` or `apple`, returns authorization URL and state |
| POST | `/api/auth/oauth/callback` | No | `{ provider, code, redirectUri, state }`; validates OIDC issuer/audience/nonce and PKCE |
| GET / PUT / DELETE | `/api/profiles/me` | Yes | Read, create/update `{ name, age, gender, pronouns, location, occupation, bio, intention, interests, prompt(s), latitude, longitude, discoverable }`, or delete account/profile |
| GET | `/api/profiles/:id` | Yes | Safe public profile; hidden profiles and blocked users are not exposed |
| GET / POST | `/api/profiles/me/photos` | Yes | List or multipart upload `photo` (JPEG/PNG/WebP, max 5 MiB; max 6 photos) |
| DELETE | `/api/profiles/me/photos/:photoId` | Yes | Delete a photo and queue object cleanup |
| POST / DELETE | `/api/profiles/:id/block` | Yes | Block or unblock; blocking ends active matches and archives conversations |
| GET | `/api/interests` | Yes | Interest catalog |
| GET / PUT | `/api/preferences` | Yes | Read or update age range, distance, location/coordinates, intentions, and genders |
| GET | `/api/discover?limit=20&cursor=<uuid>&minAge=&maxAge=&maxDistance=&location=&intention=&interests=` | Yes | Paginated eligible public profiles; excludes self, blocks, prior decisions, active matches, and incompatible preferences |
| GET / POST | `/api/likes` | Yes | List incoming likes; record `{ profileId, direction: "like" | "pass" | "dislike" }` and create a mutual match/conversation transactionally |
| POST | `/api/likes/undo` | Yes | Undo the current user's latest decision |
| GET / DELETE | `/api/matches`, `/api/matches/:id` | Yes | List active matches or end a match |
| GET | `/api/conversations` | Yes | List private conversations and last-message summaries |
| GET | `/api/conversations/:id/messages?limit=20&cursor=` | Yes | Paginated history; requires an active match and marks received messages read |
| POST | `/api/conversations/:id/read` | Yes | Mark received messages read |
| POST | `/api/messages` | Yes | `{ conversationId, text }`; persists and broadcasts the message |

The current mobile screens connect auth, profile onboarding/editing, discovery/preferences, incoming likes, matches, and chat to these routes. Photo upload and OAuth/reset flows require the external credentials above.

### Socket.IO

Connect to the API origin (without `/api`) with `auth: { accessToken }`. The server revalidates the database session for each event and disconnects at token expiry. Events: `conversation:join` `{ conversationId }`, `conversation:leave`, `message:send` `{ conversationId, text }` (acknowledged with the persisted message), `conversation:read` `{ conversationId }`, and `conversation:typing` `{ conversationId, typing }`. The server emits `message:new`, `messages:read`, and `typing` only to authorized conversation rooms. A room join and every send/read verifies current match status and blocks.

## Migrations, privacy and operations

`database/migrations/001_initial_schema.sql` creates normalized account, profile/photo, interest, prompt, preferences, likes, match/conversation/message, block, reset/session, OAuth state, storage cleanup, and database rate-limit tables with foreign keys, checks, uniqueness constraints, and discovery/message indexes. `002_seed_catalogs.sql` inserts the stable interest/intent catalogs. Add a new ordered SQL migration for schema changes. Run backups, monitor migration status and cleanup retries, and set database connection limits appropriate to the deployment.

Keep `.env` out of source control. Use a secrets manager in deployed environments. The API never returns password hashes or account email through profile endpoints. Password-reset responses do not reveal whether an address exists. Password resets are single use and revoke sessions. OAuth account auto-linking by email is disabled unless the existing account is already authenticated. The database-backed limiter is shared across API instances.

## Verification

```sh
npm test
npm run lint
```

The endpoint suite starts an embedded PostgreSQL-compatible PGlite database behind a PostgreSQL wire-protocol socket and uses `pg` + Supertest to apply the real migrations and exercise API flows without needing a local PostgreSQL installation. Production still requires a standard PostgreSQL service; run the deployment's migration and connectivity checks against that service before launch. Run `npm run lint` at the repository root for Expo JavaScript linting.
