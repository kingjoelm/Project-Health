# Data Model

## Profile

- id
- name
- age
- height
- currentWeight
- goalWeight
- primaryGoal
- experience
- availableDays
- preferredWorkoutTime
- equipment
- limitations
- biggestObstacle
- createdAt
- updatedAt

## DailyLog

- date
- sleepHours
- energy
- stress
- pain
- lifeHappenedReason
- workoutMode
- workoutCompleted
- waterCount
- sugaryDrinks
- mealNotes
- victory
- coachNote

## WorkoutSession

- id
- date
- workoutId
- mode
- startedAt
- completedAt
- perceivedDifficulty
- painReported
- exercises

## ExerciseEntry

- exerciseId
- sets
- targetReps
- completedSets
- weight
- notes

## Exercise

- id
- name
- category
- primaryMuscles
- equipment
- instructions
- commonMistakes
- alternatives
- image

## CoachMemory

- id
- type
- value
- confidence
- source
- createdAt
- lastUsedAt

## Backup

All personal beta data is stored locally in the browser and can be exported as JSON.
