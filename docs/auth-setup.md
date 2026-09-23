# DateMate Google and Apple sign-in

The app uses Supabase Auth for Google, Apple, and email/password accounts. The profile screen requires a real Supabase session. There is no demo login bypass.

The target app is Android/iOS. The current Google integration uses Supabase browser OAuth: the phone opens a system browser sign-in session, Google returns to Supabase, and Supabase returns to the installed app at `datingapp://auth/callback`.

For this flow, Google's **Web application** OAuth client represents Supabase's server callback. It does not change the app's platform or require deploying a website. Android/iOS OAuth clients are used when integrating Google's native SDK; the current app uses `signInWithOAuth` and `openAuthSessionAsync` instead.

## Current connection status

Verified September 20, 2026: the local project URL and publishable key work. Email/password and new sign-ups are enabled, with email confirmation required. Google and Apple are disabled. Dashboard redirect settings and a full account sign-in have not been verified.

Run `npm run check:supabase` for the current connection and provider status. This read-only check does not create accounts, send email, or print the key.

## 1. Connect this Supabase project

Project URL: https://saftmdboynulxxsnypwg.supabase.co

In Supabase, open Project Settings > API Keys and copy the **publishable** key (starts with sb_publishable_). Put it in .env.local:

    EXPO_PUBLIC_SUPABASE_URL=https://saftmdboynulxxsnypwg.supabase.co
    EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key

.env.local is ignored by Git. .env.example documents the required public settings. Restart Expo after changing the environment. Legacy anon keys are not used by this integration.

Do not put a service-role key, secret API key, Google client secret, or Apple private key in the app or any EXPO_PUBLIC_ setting.

## 2. Configure mobile redirects in Supabase

Open Authentication > URL Configuration and add this exact URL to Redirect URLs:

    datingapp://auth/callback

The app already declares `scheme: datingapp` in `app.json` and passes this callback to Supabase on Android/iOS. Preserve existing Site URL and redirect entries; a localhost Site URL is not needed for the mobile flow.

For optional browser testing only, add `http://localhost:8081/auth/callback` as another allowed redirect. Use the same browser/device throughout each sign-in attempt so the PKCE verifier remains available.

## 3. Enable Google

1. Open https://console.cloud.google.com/ and create or select a project named DateMate.
2. Open Google Auth Platform and complete Get started if prompted. Use DateMate as the app name, your email for support/contact, and External as the audience for personal Google accounts.
3. Under Audience, keep the app in Testing while developing and add the Google accounts you will use as test users.
4. Under Data Access, configure the basic identity scopes: `openid`, `https://www.googleapis.com/auth/userinfo.email`, and `https://www.googleapis.com/auth/userinfo.profile`.
5. Under Clients, create a client with these values:

| Google field | Value |
| --- | --- |
| Application type | Web application (Supabase server callback for mobile OAuth) |
| Name | DateMate Supabase |
| Authorized JavaScript origins | Leave empty for this mobile browser OAuth flow; `http://localhost:8081` is only for optional web testing |
| Authorized redirect URIs | `https://saftmdboynulxxsnypwg.supabase.co/auth/v1/callback` |

6. Copy the Client ID and Client Secret when Google shows them. In this project's Supabase dashboard, open Authentication > Sign In / Providers > Google, enable Google, enter the ID and secret, and save. Store the secret only in Supabase's provider settings; the app environment file needs only its existing Supabase public settings.
7. In Supabase Authentication > URL Configuration, add `datingapp://auth/callback` to Redirect URLs and preserve existing entries.
8. Run `npm run check:supabase`. Google should report enabled. In an installed Android/iOS development build, choose Google and complete sign-in. Verify that the browser returns to the app, the profile appears, the session survives restarting the app, and sign-out works.

Google's redirect URI is `https://saftmdboynulxxsnypwg.supabase.co/auth/v1/callback`. Supabase's mobile redirect is `datingapp://auth/callback`. These are two consecutive steps of the same mobile sign-in flow.

Official guides: https://supabase.com/docs/guides/auth/social-login/auth-google and https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred

## 4. Enable Apple

Use an Apple Developer account to configure Sign in with Apple, including a primary App ID, a Services ID for browser OAuth, and a signing key. Register the domain and return URL for this Supabase project:

- Domain: saftmdboynulxxsnypwg.supabase.co
- Return URL: https://saftmdboynulxxsnypwg.supabase.co/auth/v1/callback

In Supabase > Authentication > Sign In / Providers > Apple, enable Apple and configure the Services ID/client ID and generated client secret. Keep the Apple .p8 key and generated secret out of the app. Apple OAuth secrets need renewal before they expire (at most six months).

The current integration uses browser OAuth on all platforms. Apple may supply a private relay email; the profile uses the verified email supplied by Supabase.

Official guide: https://supabase.com/docs/guides/auth/social-login/auth-apple

## 5. Run and check on Android/iOS

### Quick iPhone preview with Expo Go

Install or update Expo Go on the iPhone, connect it to the same Wi-Fi as this
computer, and run `npm start`. Scan the new QR with the iPhone Camera and open
it in Expo Go. This can preview the app and sign in with an already confirmed
email/password account. Google/Apple OAuth requires the development build below.

`npm start` uses `expo start --go`. Because `expo-dev-client` is installed, a bare
`npx expo start` can generate a QR for the DateMate development app instead.
If scanning says no app can open the link, use `npm start` or press `s` in the
running Expo terminal until it says **Using Expo Go**, then scan the new QR.

If Expo Go opens but cannot connect, check that both devices use the same Wi-Fi
and allow Expo Go local-network access in iPhone Settings. For a restrictive
network, `npm start -- --tunnel` can use Expo's tunnel support.

### Development build for Google/Apple sign-in

Use an installed development build with the existing `datingapp` URL scheme. Expo Go cannot handle this app's custom OAuth redirect. `app.json` now uses `com.datemate.app` for both `android.package` and `ios.bundleIdentifier`, and includes `expo-dev-client`. These are development identifiers; confirm the final identifiers before publishing.

### Android on this Windows computer

With an Android SDK, a compatible JDK, and an emulator or connected Android phone available, build and install the app:

    npm run build:android

This runs `expo run:android`, generates the ignored native Android project if necessary, builds the development APK, installs it, and starts Metro. Configure `ANDROID_HOME` and `JAVA_HOME` if the CLI cannot find the SDK or JDK. Creating this build does not require Google OAuth credentials; completing Google sign-in does.

After installing the first build, start it for JavaScript-only changes with:

    npm run android

Or start Metro and open the installed app yourself:

    npm run start:dev -- --clear

Rebuild after changing native dependencies, config plugins, the URL scheme, or the app identifiers.

### iOS development build

Local iOS builds require a Mac with Xcode:

    npm run build:ios

From Windows, use EAS Build with an Expo account and Apple signing credentials for a physical iPhone. `eas.json` contains a `development` profile for devices and a `development-simulator` profile for a Mac's iOS Simulator. Link the project to your Expo account and configure the development environment before building:

    npx eas-cli@latest login
    npx eas-cli@latest build:configure

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in that project's EAS **development** environment as plaintext variables. The ignored `.env.local` is not uploaded to EAS. Use the same two public values as your local configuration; Google/Apple secrets stay in Supabase.

    npx eas-cli@latest build --platform ios --profile development

Install the resulting development build on a registered device, then run `npm run start:dev` to connect to Metro. A simulator build cannot run on a physical iPhone. iOS compilation and installation have not been verified on this Windows computer.

Official guides: https://docs.expo.dev/develop/development-builds/create-a-build/ and https://docs.expo.dev/eas/environment-variables/

### Verify mobile sign-in

Open DateMate on the device, tap Google, and complete consent. The browser should return to the app's profile with the account email. Restart the app to verify session restoration, then sign out and confirm the login screen returns.

Optional web testing can use `npm run web` and `http://localhost:8081` after adding its callback to Supabase's redirect allow list.

Provider cancellation, denied consent, an expired callback code, or a network error must keep the user signed out and allow another attempt. For any optional production web build, use an HTTPS origin.

Email/password signup also uses Supabase. If email confirmation is enabled, finish confirmation on the browser/device where signup started so its PKCE verifier is available; otherwise return to the app and sign in after confirmation.

## Storage and verification

- Android/iOS: session and PKCE verifier values use Expo SecureStore, split into small values and committed only after all chunks are written.
- Web: sessions use browser localStorage for reload persistence. No server secret is included in the bundle.
- Authorization codes are exchanged through Supabase using PKCE; URL access tokens are never accepted as a shortcut.
- Protected server/database operations must enforce Supabase authorization and row-level security; hiding a screen is not an authorization boundary.

Verification on September 20, 2026:

- Lint, all nine authentication tests, and all 21 Expo Doctor checks passed.
- The iOS JavaScript bundle exported successfully; this is not an iOS native build or a device sign-in test.
- Android prebuild succeeded. The native APK build was stopped while installing the missing NDK 27.1.12297006 because the only available drive had about 3 GB free. No APK was produced or installed. Free disk space before retrying `npm run build:android`.
- Supabase accepts the public key. Google and Apple remain disabled until their provider credentials are configured in the dashboard.

Local checks:

    npm run check:supabase
    npm run lint
    npm run test:auth
    npx expo-doctor
    npx expo export --platform all

The publishable key is configured locally. Live Google/Apple sign-in still requires provider credentials, enabled providers, and verified dashboard redirect settings.

Mobile OAuth references: https://supabase.com/docs/guides/auth/native-mobile-deep-linking and https://docs.expo.dev/guides/authentication/
