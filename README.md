MAKA UYAB KAHA KO ANING AMONG APP??!!

Google, Facebook, and email/password sign-in use Supabase Auth.
See [authentication setup](docs/auth-setup.md) for the public app settings,
provider configuration, redirect URLs, and verification steps.

For quick iPhone testing, install or update Expo Go, keep the phone and computer
on the same Wi-Fi, then run `npm start`. Scan the new QR with the iPhone Camera
and choose Open in Expo Go. This previews the app and supports email/password
sign-in; Google/Facebook sign-in requires a development build.

`npm start` explicitly selects Expo Go. A bare `npx expo start` may select the
installed `expo-dev-client` dependency instead; use `npx expo start --go` or
press `s` in the Expo terminal to switch back to Expo Go.

For Google/Facebook testing, install a development build first:

```sh
npm run build:android
# On a Mac with Xcode:
npm run build:ios
```

After installation, use `npm run start:dev` to start Metro, or `npm run android` to
start Metro and open the Android app. Google/Facebook sign-in requires provider
credentials in Supabase and the `datingapp://auth/callback` redirect.
See the setup guide for iPhone builds from Windows using EAS.
