# Changelog

## v0.16.0 — The AI Coach Experience

### Added
- Compact Daily Briefing with health score, hydration, meals, movement and latest weight.
- Dedicated Coach PH conversation center with daily briefing, meal planning, workout guidance, reflection, weekly review and motivation.
- Coach modes: General Wellness, Weight Loss, Muscle Building, Heart Health, Mental Wellness and Diabetes Support.
- User-controlled Coach PH memory stored inside the existing profile/cloud snapshot.
- Cleaner Coach PH message card and clearer app identity.

### Preserved from v0.14
- All workout data and exercise images.
- Adaptive training and guided workouts.
- Activity tracking and estimated calories.
- Meal logging, recipe generation and grocery lists.
- Programs and custom program builder.
- Progress, measurements, reflections and victories.
- Multiple local profiles.
- Supabase account, feedback, sync and restore connections.
- Existing storage keys and cloud schema.

### Data migration
No destructive migration is performed. v0.16 continues using `projectHealthV014`, `projectHealthProfilesV09`, the active-profile key, device identity and the current Supabase `user_state` snapshot. New Coach PH fields are added to the existing profile/state object.
