# Project Health Cloud Setup — Supabase Free Tier

## 1. Create the project

1. Create a Supabase account.
2. Create a new project.
3. Choose a strong database password and save it securely.
4. Wait for the project to finish provisioning.

## 2. Create the database

Open **SQL Editor** in Supabase and run:

`cloud/supabase-schema.sql`

This creates:

- `profiles`
- `user_state`
- `beta_feedback`
- Row Level Security policies
- Automatic profile creation for new accounts

## 3. Configure authentication

In **Authentication → URL Configuration**:

- Site URL:
  `https://kingjoelm.github.io/Project-Health/`
- Add the same URL to Redirect URLs.

For the first small tester group, keep email confirmation enabled. Testers will receive an email before their first sign-in.

## 4. Copy browser-safe credentials

In Supabase project settings, copy:

- Project URL
- Publishable key, or the legacy anon key if that is what your project shows

Do **not** use the service_role key in this app.

Open:

`cloud/config.js`

Change:

```js
enabled: false
```

to:

```js
enabled: true
```

Paste the Project URL and publishable/anon key.

## 5. Deploy

Upload the complete v0.13.0 release contents directly to the root of the GitHub repository.

## 6. Test in this order

1. Open the site in a private/incognito browser.
2. Create a new account.
3. Confirm the email.
4. Sign in.
5. Add water or log a meal.
6. Press **Sync Now**.
7. Open another private browser or device.
8. Sign in with the same account.
9. Press **Restore From Cloud**.
10. Confirm the data appears.

## Security model

The browser receives only a publishable key. Database Row Level Security checks the signed-in user's ID for every row. Users can select, insert, update, and delete only their own profile, state, and feedback.
