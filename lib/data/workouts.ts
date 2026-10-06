export interface Workout {
  slug: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  minutes: number;
  focus: string;
  exercises: { name: string; sets: string }[];
}

/** Starting library, carried over from the prototype and simplified. */
export const WORKOUTS: Workout[] = [
  { slug: "foundation-full-body", title: "Foundation Full Body", level: "Beginner", minutes: 35, focus: "Whole body, no equipment",
    exercises: [{ name: "Bodyweight squat", sets: "3 × 15" }, { name: "Push-up", sets: "3 × 10" }, { name: "Reverse lunge", sets: "3 × 10 each" }, { name: "Plank", sets: "3 × 45 s" }, { name: "Glute bridge", sets: "3 × 15" }] },
  { slug: "push-day", title: "Push Day", level: "Intermediate", minutes: 60, focus: "Chest, shoulders, triceps",
    exercises: [{ name: "Bench press", sets: "4 × 8" }, { name: "Overhead press", sets: "3 × 8" }, { name: "Incline dumbbell press", sets: "3 × 10" }, { name: "Lateral raise", sets: "3 × 12" }, { name: "Triceps dip", sets: "3 × 10" }] },
  { slug: "pull-day", title: "Pull Day", level: "Intermediate", minutes: 60, focus: "Back and biceps",
    exercises: [{ name: "Pull-up or lat pulldown", sets: "4 × 8" }, { name: "Barbell row", sets: "3 × 8" }, { name: "Seated cable row", sets: "3 × 10" }, { name: "Face pull", sets: "3 × 15" }, { name: "Dumbbell curl", sets: "3 × 12" }] },
  { slug: "leg-day", title: "Leg Day", level: "Advanced", minutes: 65, focus: "Squat pattern and posterior chain",
    exercises: [{ name: "Back squat", sets: "4 × 6" }, { name: "Romanian deadlift", sets: "3 × 8" }, { name: "Walking lunge", sets: "3 × 12 each" }, { name: "Leg curl", sets: "3 × 12" }, { name: "Standing calf raise", sets: "4 × 15" }] },
  { slug: "deadlift-focus", title: "Deadlift Focus", level: "Advanced", minutes: 55, focus: "Hinge strength",
    exercises: [{ name: "Deadlift", sets: "5 × 3" }, { name: "Deficit deadlift", sets: "3 × 5" }, { name: "Good morning", sets: "3 × 8" }, { name: "Hanging leg raise", sets: "3 × 12" }, { name: "Farmer's carry", sets: "3 × 40 m" }] },
  { slug: "run-and-core", title: "Run & Core", level: "Beginner", minutes: 30, focus: "Cardio with a short core finisher",
    exercises: [{ name: "Easy run or brisk walk", sets: "20 min" }, { name: "Dead bug", sets: "3 × 10 each" }, { name: "Side plank", sets: "3 × 30 s each" }, { name: "Mountain climber", sets: "3 × 20" }] },
];

export function workoutBySlug(slug: string): Workout | undefined {
  return WORKOUTS.find((w) => w.slug === slug);
}
