"use client";

import { useEffect, useMemo, useState } from "react";

type BottomTab = "home" | "calendar" | "workout" | "profile";
type WorkoutMode = "Lift" | "Cardio";
type CardioType = "Run" | "Swim" | "Bike" | "Row";
type Sex = "male" | "female";
type LiftCategory = "Push" | "Pull" | "Legs" | "Mixed";
type EquipmentType = "Barbell" | "Dumbbell" | "Machine" | "Cable" | "Bodyweight";

type LiftEntry = {
  id: string;
  exercise: string;
  equipment: EquipmentType;
  weight: string;
  reps: string;
  sets: string;
};

type CardioEntry = {
  id: string;
  type: CardioType;
  distance: string;
  time: string;
};

type DayWorkout = {
  date: string;
  notes: string;
  liftCategory: LiftCategory;
  liftEntries: LiftEntry[];
  cardioEntries: CardioEntry[];
};

type Profile = {
  name: string;
  sex: Sex;
  weightKg: string;
  heightCm: string;
};

type StandardBand = {
  novice: number;
  intermediate: number;
  advanced: number;
  elite: number;
};

type MuscleKey =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Arms"
  | "Quadriceps"
  | "Posterior"
  | "Core";

type ExerciseCard = {
  name: string;
  subtitle: string;
  progress: number;
  level: string;
  color: string;
  lastDate: string;
};

const STORAGE_KEY = "op-massive-v5";

const popularExercises = [
  "Bench Press",
  "Back Squat",
  "Deadlift",
  "Pull Ups",
  "Shoulder Press (Dumbbell)",
  "Bicep Curl (Dumbbell)",
  "Bench Press (Dumbbell)",
  "Barbell Row",
  "Romanian Deadlift",
  "Tricep Dips",
  "Push Ups",
];

const allLiftExercises = [
  "Bench Press",
  "Incline Bench Press",
  "Close Grip Bench Press",
  "Bench Press (Dumbbell)",
  "Incline Dumbbell Press",
  "Chest Fly",
  "Cable Fly",
  "Push Ups",
  "Tricep Dips",
  "Shoulder Press (Dumbbell)",
  "Barbell Overhead Press",
  "Lateral Raise",
  "Front Raise",
  "Tricep Pushdown",
  "Overhead Tricep Extension",
  "Skull Crushers",
  "Pull Ups",
  "Chin Ups",
  "Lat Pulldown",
  "Barbell Row",
  "Seated Cable Row",
  "Single Arm Dumbbell Row",
  "Face Pull",
  "Rear Delt Fly",
  "Bicep Curl (Dumbbell)",
  "Hammer Curl",
  "EZ Bar Curl",
  "Preacher Curl",
  "Back Squat",
  "Front Squat",
  "Deadlift",
  "Romanian Deadlift",
  "Leg Press",
  "Leg Extension",
  "Leg Curl",
  "Walking Lunge",
  "Bulgarian Split Squat",
  "Calf Raise",
  "Hip Thrust",
  "Hanging Leg Raise",
  "Crunch",
  "Cable Crunch",
  "Ab Wheel Rollout",
  "Plank",
  "Russian Twist",
  "Sit Up",
];

const liftExercises = [...popularExercises, ...allLiftExercises.filter((x) => !popularExercises.includes(x))];
const cardioOptions: CardioType[] = ["Run", "Swim", "Bike", "Row"];
const categoryOptions: LiftCategory[] = ["Push", "Pull", "Legs", "Mixed"];
const equipmentOptions: EquipmentType[] = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight"];

const strengthStandardsBySex = {
  male: {
    "Bench Press": { novice: 47, intermediate: 98, advanced: 140, elite: 193 },
    "Back Squat": { novice: 64, intermediate: 130, advanced: 177, elite: 234 },
    Deadlift: { novice: 78, intermediate: 152, advanced: 206, elite: 264 },
    "Shoulder Press (Dumbbell)": { novice: 13, intermediate: 32, advanced: 48, elite: 68 },
    "Bicep Curl (Dumbbell)": { novice: 6, intermediate: 23, advanced: 36, elite: 54 },
  },
  female: {
    "Bench Press": { novice: 20, intermediate: 51, advanced: 78, elite: 113 },
    "Back Squat": { novice: 33, intermediate: 73, advanced: 109, elite: 154 },
    Deadlift: { novice: 41, intermediate: 87, advanced: 127, elite: 176 },
    "Shoulder Press (Dumbbell)": { novice: 5, intermediate: 15, advanced: 24, elite: 37 },
    "Bicep Curl (Dumbbell)": { novice: 3, intermediate: 14, advanced: 22, elite: 33 },
  },
} satisfies Record<Sex, Record<string, StandardBand>>;

const pullUpStandardsBySex = {
  male: { novice: 1, intermediate: 6, advanced: 15, elite: 26 },
  female: { novice: 1, intermediate: 4, advanced: 10, elite: 18 },
} satisfies Record<Sex, StandardBand>;

const runStandards = {
  "5km Run": { novice: 40, intermediate: 30, advanced: 24, elite: 19 },
  "10km Run": { novice: 85, intermediate: 65, advanced: 52, elite: 42 },
};

const initialProfile: Profile = {
  name: "",
  sex: "male",
  weightKg: "",
  heightCm: "",
};

function getTodayKey() {
  const now = new Date();
  return formatDateKey(now.getFullYear(), now.getMonth(), now.getDate());
}

function formatDateKey(year: number, monthIndex: number, day: number) {
  const safeDate = new Date(year, monthIndex, day);
  const mm = String(safeDate.getMonth() + 1).padStart(2, "0");
  const dd = String(safeDate.getDate()).padStart(2, "0");
  return `${safeDate.getFullYear()}-${mm}-${dd}`;
}

function prettyDate(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00`);
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function createLiftEntry(): LiftEntry {
  return {
    id: crypto.randomUUID(),
    exercise: "Bench Press",
    equipment: "Barbell",
    weight: "",
    reps: "",
    sets: "",
  };
}

function createCardioEntry(): CardioEntry {
  return {
    id: crypto.randomUUID(),
    type: "Run",
    distance: "",
    time: "",
  };
}

function createEmptyDay(date: string): DayWorkout {
  return {
    date,
    notes: "",
    liftCategory: "Push",
    liftEntries: [createLiftEntry()],
    cardioEntries: [createCardioEntry()],
  };
}

function isFutureDate(dateKey: string) {
  return dateKey > getTodayKey();
}

function hasLoggedLift(day?: DayWorkout) {
  if (!day) return false;
  return day.liftEntries.some((entry) => entry.exercise && (entry.weight || entry.reps || entry.sets || entry.equipment === "Bodyweight"));
}

function hasLoggedCardio(day?: DayWorkout) {
  if (!day) return false;
  return day.cardioEntries.some((entry) => entry.distance || entry.time);
}

function hasWorkoutLogged(day?: DayWorkout) {
  return hasLoggedLift(day) || hasLoggedCardio(day);
}

function getDayLabel(day?: DayWorkout) {
  if (!day || !hasWorkoutLogged(day)) return "";
  const labels: string[] = [];
  if (hasLoggedLift(day)) labels.push(day.liftCategory);
  if (hasLoggedCardio(day)) labels.push("CV");
  return labels.join(" / ");
}

function getMonthMatrix(currentMonth: Date) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const cells: Array<{ day: number; dateKey: string; isCurrentMonth: boolean }> = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({ day, dateKey: formatDateKey(year, month - 1, day), isCurrentMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ day, dateKey: formatDateKey(year, month, day), isCurrentMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const nextDay = cells.length - (startWeekday + daysInMonth) + 1;
    cells.push({ day: nextDay, dateKey: formatDateKey(year, month + 1, nextDay), isCurrentMonth: false });
  }
  return cells;
}

function estimateOneRepMax(weight: number, reps: number) {
  if (!weight || !reps) return 0;
  return weight * (1 + reps / 30);
}

function getEffectiveLoad(entry: LiftEntry, profileWeight: number) {
  const external = Number(entry.weight) || 0;
  if (entry.equipment === "Bodyweight") return profileWeight + external;
  if (entry.equipment === "Dumbbell") return external * 2;
  return external;
}

function getBestEstimatedLift(dayWorkouts: Record<string, DayWorkout>, exerciseName: string, profileWeight: number) {
  let best = 0;
  let lastDate = "";
  Object.values(dayWorkouts).forEach((day) => {
    day.liftEntries.forEach((entry) => {
      if (entry.exercise !== exerciseName) return;
      const estimate = estimateOneRepMax(getEffectiveLoad(entry, profileWeight), Number(entry.reps));
      if (estimate > best) {
        best = estimate;
        lastDate = day.date;
      }
      if (estimate === best && day.date > lastDate) lastDate = day.date;
    });
  });
  return { best, lastDate };
}

function getBestPullUps(dayWorkouts: Record<string, DayWorkout>) {
  let best = 0;
  let lastDate = "";
  Object.values(dayWorkouts).forEach((day) => {
    day.liftEntries.forEach((entry) => {
      if (entry.exercise !== "Pull Ups" && entry.exercise !== "Chin Ups") return;
      const reps = Number(entry.reps);
      if (reps > best) {
        best = reps;
        lastDate = day.date;
      }
      if (reps === best && day.date > lastDate) lastDate = day.date;
    });
  });
  return { best, lastDate };
}

function parseMinutes(value: string) {
  const mins = Number(value);
  return Number.isFinite(mins) ? mins : 0;
}

function getBestRunTime(dayWorkouts: Record<string, DayWorkout>, targetDistanceKm: number) {
  let best = 0;
  let lastDate = "";
  Object.values(dayWorkouts).forEach((day) => {
    day.cardioEntries.forEach((entry) => {
      if (entry.type !== "Run") return;
      const distance = Number(entry.distance);
      const time = parseMinutes(entry.time);
      if (!distance || !time || distance < targetDistanceKm) return;
      const projected = (time / distance) * targetDistanceKm;
      if (!best || projected < best) {
        best = projected;
        lastDate = day.date;
      }
      if (projected === best && day.date > lastDate) lastDate = day.date;
    });
  });
  return { best, lastDate };
}

function getStrengthProgress(value: number, band: StandardBand) {
  if (!value) return 0;
  return Math.min(100, (value / band.elite) * 100);
}

function getStrengthLabel(value: number, band: StandardBand) {
  if (!value) return "Not logged";
  if (value >= band.elite) return "Elite";
  if (value >= band.advanced) return "Advanced";
  if (value >= band.intermediate) return "Intermediate";
  if (value >= band.novice) return "Novice";
  return "Beginner";
}

function getRunProgress(timeMinutes: number, thresholds: StandardBand) {
  if (!timeMinutes) return 0;
  const clamped = Math.min(thresholds.novice, timeMinutes);
  const range = thresholds.novice - thresholds.elite;
  return Math.min(100, ((thresholds.novice - clamped) / range) * 100);
}

function getRunLabel(timeMinutes: number, thresholds: StandardBand) {
  if (!timeMinutes) return "Not logged";
  if (timeMinutes <= thresholds.elite) return "Elite";
  if (timeMinutes <= thresholds.advanced) return "Advanced";
  if (timeMinutes <= thresholds.intermediate) return "Intermediate";
  if (timeMinutes <= thresholds.novice) return "Novice";
  return "Beginner";
}

function adjustStandardsForWeight(band: StandardBand, profileWeight: number) {
  if (!profileWeight) return band;
  const factor = Math.max(0.75, Math.min(1.3, profileWeight / 80));
  return {
    novice: band.novice * factor,
    intermediate: band.intermediate * factor,
    advanced: band.advanced * factor,
    elite: band.elite * factor,
  };
}

function ProgressBar({ value, colorClass = "bg-blue-500" }: { value: number; colorClass?: string }) {
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-neutral-800">
      <div className={`h-3 rounded-full ${colorClass}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function AppIcon({ name, active }: { name: BottomTab | "timer"; active?: boolean }) {
  const stroke = active ? "#60a5fa" : "#a3a3a3";
  if (name === "home") return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5Z" stroke={stroke} strokeWidth="1.8" strokeLinejoin="round"/></svg>;
  if (name === "calendar") return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="16" rx="2" stroke={stroke} strokeWidth="1.8"/><path d="M8 3v4M16 3v4M3 10h18" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/></svg>;
  if (name === "workout") return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 10v4M7 8v8M17 8v8M21 10v4M7 12h10" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (name === "profile") return <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke={stroke} strokeWidth="1.8"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/></svg>;
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.8"/><path d="M12 7v5l3 2" stroke={stroke} strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

function ExerciseEmoji({ exercise }: { exercise: string }) {
  const map: Record<string, string> = {
    "Bench Press": "🏋️", "Incline Bench Press": "🏋️", "Close Grip Bench Press": "🏋️", "Bench Press (Dumbbell)": "💪", "Incline Dumbbell Press": "💪", "Chest Fly": "🪽", "Cable Fly": "🪽", "Push Ups": "🤸", "Tricep Dips": "🪑",
    "Shoulder Press (Dumbbell)": "💪", "Barbell Overhead Press": "🏋️", "Lateral Raise": "🦾", "Front Raise": "🦾", "Tricep Pushdown": "🔻", "Overhead Tricep Extension": "🔺", "Skull Crushers": "☠️",
    "Pull Ups": "🧗", "Chin Ups": "🧗", "Lat Pulldown": "⬇️", "Barbell Row": "🚣", "Seated Cable Row": "🚣", "Single Arm Dumbbell Row": "🚣", "Face Pull": "🎯", "Rear Delt Fly": "🪽",
    "Bicep Curl (Dumbbell)": "💪", "Hammer Curl": "🔨", "EZ Bar Curl": "〰️", "Preacher Curl": "🙏",
    "Back Squat": "🦵", "Front Squat": "🦵", "Deadlift": "⛓️", "Romanian Deadlift": "⛓️", "Leg Press": "🦿", "Leg Extension": "🦿", "Leg Curl": "🦿", "Walking Lunge": "🚶", "Bulgarian Split Squat": "🦵", "Calf Raise": "🐄", "Hip Thrust": "🍑",
    "Hanging Leg Raise": "🧲", "Crunch": "🌀", "Cable Crunch": "🌀", "Ab Wheel Rollout": "🎡", "Plank": "📏", "Russian Twist": "🌪️", "Sit Up": "⬆️",
    Run: "🏃", Swim: "🏊", Bike: "🚴", Row: "🚣",
  };
  return <span>{map[exercise] ?? "🏅"}</span>;
}

function MuscleRadar({ values }: { values: Record<MuscleKey, number> }) {
  const size = 320;
  const center = size / 2;
  const radius = 108;
  const labels = Object.keys(values) as MuscleKey[];
  const step = (Math.PI * 2) / labels.length;
  const points = labels.map((label, index) => {
    const angle = -Math.PI / 2 + index * step;
    const valueRadius = (Math.max(0, Math.min(100, values[label])) / 100) * radius;
    return { label, x: center + Math.cos(angle) * valueRadius, y: center + Math.sin(angle) * valueRadius };
  });
  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-[320px] w-[320px] max-w-full">
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <polygon key={ring} points={labels.map((_, index) => {
          const angle = -Math.PI / 2 + index * step;
          return `${center + Math.cos(angle) * radius * ring},${center + Math.sin(angle) * radius * ring}`;
        }).join(" ")} fill="none" stroke="#262626" strokeWidth="1" />
      ))}
      {labels.map((label, index) => {
        const angle = -Math.PI / 2 + index * step;
        return <line key={label} x1={center} y1={center} x2={center + Math.cos(angle) * radius} y2={center + Math.sin(angle) * radius} stroke="#262626" strokeWidth="1" />;
      })}
      <polygon points={polygon} fill="rgba(59,130,246,0.25)" stroke="#60a5fa" strokeWidth="3" />
      {points.map((p) => <circle key={p.label} cx={p.x} cy={p.y} r="4" fill="#60a5fa" />)}
      {labels.map((label, index) => {
        const angle = -Math.PI / 2 + index * step;
        return <text key={label} x={center + Math.cos(angle) * (radius + 22)} y={center + Math.sin(angle) * (radius + 22)} textAnchor="middle" dominantBaseline="middle" fill="#d4d4d4" fontSize="12">{label}</text>;
      })}
    </svg>
  );
}

function FitnessLineChart({ points }: { points: Array<{ date: string; score: number }> }) {
  const width = 520;
  const height = 220;
  const padding = 24;
  if (!points.length) {
    return <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 p-4 text-sm text-neutral-400">No fitness trend yet.</div>;
  }
  const maxScore = Math.max(1000, ...points.map((p) => p.score));
  const minScore = 0;
  const xStep = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;
  const coords = points.map((p, i) => {
    const x = padding + i * xStep;
    const y = height - padding - ((p.score - minScore) / (maxScore - minScore || 1)) * (height - padding * 2);
    return { ...p, x, y };
  });
  const path = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x} ${c.y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full">
      {[0, 250, 500, 750, 1000].map((val) => {
        const y = height - padding - ((val - minScore) / (maxScore - minScore || 1)) * (height - padding * 2);
        return <g key={val}><line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#262626" strokeWidth="1" /><text x="4" y={y + 4} fill="#737373" fontSize="10">{val}</text></g>;
      })}
      <path d={path} fill="none" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {coords.map((c) => <circle key={c.date} cx={c.x} cy={c.y} r="4" fill="#60a5fa" />)}
      {coords.map((c) => <text key={`${c.date}-label`} x={c.x} y={height - 6} textAnchor="middle" fill="#737373" fontSize="10">{c.date.slice(5)}</text>)}
    </svg>
  );
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<BottomTab>("home");
  const [workoutMode, setWorkoutMode] = useState<WorkoutMode>("Lift");
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [dayWorkouts, setDayWorkouts] = useState<Record<string, DayWorkout>>({});
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [percentBase, setPercentBase] = useState("");
  const [exerciseIndex, setExerciseIndex] = useState(0);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.profile) setProfile(parsed.profile);
      if (parsed.dayWorkouts) setDayWorkouts(parsed.dayWorkouts);
      if (parsed.selectedDate) setSelectedDate(parsed.selectedDate);
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, dayWorkouts, selectedDate }));
  }, [profile, dayWorkouts, selectedDate]);

  const todayKey = getTodayKey();
  const todayWorkoutDone = hasWorkoutLogged(dayWorkouts[todayKey]);
  const selectedDay = dayWorkouts[selectedDate] ?? createEmptyDay(selectedDate);
  const monthCells = useMemo(() => getMonthMatrix(currentMonth), [currentMonth]);
  const profileWeight = Number(profile.weightKg) || 0;
  const strengthStandards = strengthStandardsBySex[profile.sex];
  const pullUpStandards = pullUpStandardsBySex[profile.sex];

  const exerciseCards = useMemo(() => {
    const bench = getBestEstimatedLift(dayWorkouts, "Bench Press", profileWeight);
    const pullUps = getBestPullUps(dayWorkouts);
    const squat = getBestEstimatedLift(dayWorkouts, "Back Squat", profileWeight);
    const deadlift = getBestEstimatedLift(dayWorkouts, "Deadlift", profileWeight);
    const shoulder = getBestEstimatedLift(dayWorkouts, "Shoulder Press (Dumbbell)", profileWeight);
    const curls = getBestEstimatedLift(dayWorkouts, "Bicep Curl (Dumbbell)", profileWeight);
    const run5 = getBestRunTime(dayWorkouts, 5);
    const run10 = getBestRunTime(dayWorkouts, 10);

    const all: ExerciseCard[] = [
      { name: "Bench Press", subtitle: bench.best ? `${bench.best.toFixed(1)} kg est. 1RM` : "", progress: getStrengthProgress(bench.best, adjustStandardsForWeight(strengthStandards["Bench Press"], profileWeight)), level: getStrengthLabel(bench.best, adjustStandardsForWeight(strengthStandards["Bench Press"], profileWeight)), color: "bg-blue-500", lastDate: bench.lastDate },
      { name: "Pull Ups", subtitle: pullUps.best ? `${pullUps.best} reps` : "", progress: Math.min(100, (pullUps.best / pullUpStandards.elite) * 100), level: getStrengthLabel(pullUps.best, pullUpStandards), color: "bg-green-500", lastDate: pullUps.lastDate },
      { name: "Back Squat", subtitle: squat.best ? `${squat.best.toFixed(1)} kg est. 1RM` : "", progress: getStrengthProgress(squat.best, adjustStandardsForWeight(strengthStandards["Back Squat"], profileWeight)), level: getStrengthLabel(squat.best, adjustStandardsForWeight(strengthStandards["Back Squat"], profileWeight)), color: "bg-blue-500", lastDate: squat.lastDate },
      { name: "Deadlift", subtitle: deadlift.best ? `${deadlift.best.toFixed(1)} kg est. 1RM` : "", progress: getStrengthProgress(deadlift.best, adjustStandardsForWeight(strengthStandards.Deadlift, profileWeight)), level: getStrengthLabel(deadlift.best, adjustStandardsForWeight(strengthStandards.Deadlift, profileWeight)), color: "bg-blue-500", lastDate: deadlift.lastDate },
      { name: "Shoulder Press (Dumbbell)", subtitle: shoulder.best ? `${shoulder.best.toFixed(1)} kg est. 1RM` : "", progress: getStrengthProgress(shoulder.best, adjustStandardsForWeight(strengthStandards["Shoulder Press (Dumbbell)"], profileWeight)), level: getStrengthLabel(shoulder.best, adjustStandardsForWeight(strengthStandards["Shoulder Press (Dumbbell)"], profileWeight)), color: "bg-blue-500", lastDate: shoulder.lastDate },
      { name: "Bicep Curl (Dumbbell)", subtitle: curls.best ? `${curls.best.toFixed(1)} kg est. 1RM` : "", progress: getStrengthProgress(curls.best, adjustStandardsForWeight(strengthStandards["Bicep Curl (Dumbbell)"], profileWeight)), level: getStrengthLabel(curls.best, adjustStandardsForWeight(strengthStandards["Bicep Curl (Dumbbell)"], profileWeight)), color: "bg-blue-500", lastDate: curls.lastDate },
      { name: "5km Run", subtitle: run5.best ? `${run5.best.toFixed(1)} min projected` : "", progress: getRunProgress(run5.best, runStandards["5km Run"]), level: getRunLabel(run5.best, runStandards["5km Run"]), color: "bg-green-500", lastDate: run5.lastDate },
      { name: "10km Run", subtitle: run10.best ? `${run10.best.toFixed(1)} min projected` : "", progress: getRunProgress(run10.best, runStandards["10km Run"]), level: getRunLabel(run10.best, runStandards["10km Run"]), color: "bg-green-500", lastDate: run10.lastDate },
    ];
    return all.filter((item) => item.subtitle).sort((a, b) => b.lastDate.localeCompare(a.lastDate));
  }, [dayWorkouts, profileWeight, strengthStandards, pullUpStandards]);

  const visibleExerciseCards = exerciseCards.slice(exerciseIndex, exerciseIndex + 4);

  const muscleValues = useMemo(() => {
    const by = Object.fromEntries(exerciseCards.map((card) => [card.name, card.progress])) as Record<string, number>;
    return {
      Chest: Math.min(100, ((by["Bench Press"] ?? 0) * 0.65) + ((by["Shoulder Press (Dumbbell)"] ?? 0) * 0.2)),
      Back: Math.min(100, ((by["Pull Ups"] ?? 0) * 0.55) + ((by["Deadlift"] ?? 0) * 0.25)),
      Shoulders: Math.min(100, ((by["Shoulder Press (Dumbbell)"] ?? 0) * 0.7) + ((by["Bench Press"] ?? 0) * 0.1)),
      Arms: Math.min(100, ((by["Bicep Curl (Dumbbell)"] ?? 0) * 0.45) + ((by["Pull Ups"] ?? 0) * 0.25) + ((by["Bench Press"] ?? 0) * 0.15)),
      Quadriceps: Math.min(100, (by["Back Squat"] ?? 0) * 0.78),
      Posterior: Math.min(100, ((by["Deadlift"] ?? 0) * 0.68) + ((by["Back Squat"] ?? 0) * 0.22)),
      Core: Math.min(100, ((by["5km Run"] ?? 0) * 0.2) + ((by["10km Run"] ?? 0) * 0.25) + 25),
    } satisfies Record<MuscleKey, number>;
  }, [exerciseCards]);

  const fitnessTrend = useMemo(() => {
    return Object.values(dayWorkouts)
      .filter((d) => hasWorkoutLogged(d))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((day) => {
        let score = 0;
        day.liftEntries.forEach((entry) => {
          if (entry.reps || entry.sets || entry.weight || entry.equipment === "Bodyweight") {
            score += Math.min(220, getEffectiveLoad(entry, profileWeight) * 0.9 + (Number(entry.reps) || 0) * 6 + (Number(entry.sets) || 0) * 12);
          }
        });
        day.cardioEntries.forEach((entry) => {
          if (entry.distance || entry.time) {
            score += Math.min(260, (Number(entry.distance) || 0) * 20 + (Number(entry.time) || 0) * 2.5);
          }
        });
        if (day.notes?.trim()) score += 15;
        return { date: day.date, score: Math.min(1000, Math.round(score)) };
      });
  }, [dayWorkouts, profileWeight]);

  const latestFitnessScore = fitnessTrend.length ? fitnessTrend[fitnessTrend.length - 1].score : 0;
  const latestFitnessLabel = latestFitnessScore >= 850 ? "Elite" : latestFitnessScore >= 650 ? "Advanced" : latestFitnessScore >= 450 ? "Intermediate" : latestFitnessScore >= 250 ? "Novice" : latestFitnessScore ? "Beginner" : "Not logged";

  const sevenDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return formatDateKey(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const liftHistory = useMemo(() => Object.values(dayWorkouts).filter((d) => hasLoggedLift(d) && d.date >= sevenDaysAgo).sort((a,b)=>b.date.localeCompare(a.date)), [dayWorkouts, sevenDaysAgo]);
  const cardioHistory = useMemo(() => Object.values(dayWorkouts).filter((d) => hasLoggedCardio(d) && d.date >= sevenDaysAgo).sort((a,b)=>b.date.localeCompare(a.date)), [dayWorkouts, sevenDaysAgo]);

  const streak = useMemo(() => {
    let count = 0;
    const cursor = new Date();
    while (true) {
      const key = formatDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
      if (hasWorkoutLogged(dayWorkouts[key])) {
        count += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  }, [dayWorkouts]);

  const thisWeekRunKm = useMemo(() => {
    const start = new Date();
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    const startKey = formatDateKey(start.getFullYear(), start.getMonth(), start.getDate());
    return Object.values(dayWorkouts)
      .filter((d) => d.date >= startKey)
      .reduce((sum, d) => sum + d.cardioEntries.reduce((inner, e) => inner + (e.type === "Run" ? Number(e.distance) || 0 : 0), 0), 0);
  }, [dayWorkouts]);

  const previousMatchingLiftDay = useMemo(() => {
    if (workoutMode !== "Lift") return undefined;
    return Object.values(dayWorkouts)
      .filter((d) => d.date !== selectedDate && hasLoggedLift(d) && d.liftCategory === selectedDay.liftCategory)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [dayWorkouts, selectedDate, selectedDay.liftCategory, workoutMode]);

  const secondsToMidnight = useMemo(() => {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
  }, [dayWorkouts]);

  const [ticker, setTicker] = useState(secondsToMidnight);
  useEffect(() => {
    setTicker(secondsToMidnight);
    const interval = setInterval(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      setTicker(Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsToMidnight]);

  const timerString = `${String(Math.floor(ticker / 3600)).padStart(2, "0")}:${String(Math.floor((ticker % 3600) / 60)).padStart(2, "0")}:${String(ticker % 60).padStart(2, "0")}`;
  const timerColor = ticker < 7200 ? "text-red-400" : ticker < 18000 ? "text-amber-400" : "text-blue-400";
  const percentageValues = useMemo(() => {
    const base = Number(percentBase) || 0;
    return [90, 80, 70, 60].map((p) => ({ p, value: ((base * p) / 100).toFixed(1) }));
  }, [percentBase]);

  function updateSelectedDay(updater: (day: DayWorkout) => DayWorkout) {
    setDayWorkouts((prev) => {
      const current = prev[selectedDate] ?? createEmptyDay(selectedDate);
      return { ...prev, [selectedDate]: updater(current) };
    });
  }

  function changeMonth(direction: number) { setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1)); }
  function saveWorkout() { setDayWorkouts((prev) => ({ ...prev, [selectedDate]: prev[selectedDate] ?? createEmptyDay(selectedDate) })); setActiveTab("calendar"); }
  function updateLiftEntry(id: string, field: keyof LiftEntry, value: string) { updateSelectedDay((day) => ({ ...day, liftEntries: day.liftEntries.map((entry) => entry.id === id ? { ...entry, [field]: value } : entry) })); }
  function updateCardioEntry(id: string, field: keyof CardioEntry, value: string) { updateSelectedDay((day) => ({ ...day, cardioEntries: day.cardioEntries.map((entry) => entry.id === id ? { ...entry, [field]: value } : entry) })); }
  function addLiftLine() { updateSelectedDay((day) => ({ ...day, liftEntries: [...day.liftEntries, createLiftEntry()] })); }
  function addCardioLine() { updateSelectedDay((day) => ({ ...day, cardioEntries: [...day.cardioEntries, createCardioEntry()] })); }
  function removeLiftLine(id: string) { updateSelectedDay((day) => ({ ...day, liftEntries: day.liftEntries.length > 1 ? day.liftEntries.filter((e)=>e.id!==id) : [createLiftEntry()] })); }
  function removeCardioLine(id: string) { updateSelectedDay((day) => ({ ...day, cardioEntries: day.cardioEntries.length > 1 ? day.cardioEntries.filter((e)=>e.id!==id) : [createCardioEntry()] })); }
  function editDay(date: string) { setSelectedDate(date); setActiveTab("workout"); }
  function deleteDay(date: string) { setDayWorkouts((prev) => { const next = { ...prev }; delete next[date]; return next; }); }

  const navItems: BottomTab[] = ["home", "calendar", "workout", "profile"];

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col pb-24">
        <header className="border-b border-neutral-800 px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-blue-400">Training App</p>
              <h1 className="mt-1 text-3xl font-bold">Op Massive</h1>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-right">
              <p className="text-xs text-neutral-400">Selected date</p>
              <p className="text-sm font-medium">{prettyDate(selectedDate)}</p>
            </div>
          </div>
        </header>

        <section className="flex-1 px-4 py-5">
          {activeTab === "home" && (
            <div className="space-y-6">
              <div className={`flex min-h-[50vh] items-center justify-center rounded-[32px] border p-8 text-center shadow-2xl shadow-black/20 ${todayWorkoutDone ? "border-green-500/30 bg-green-500/10" : "border-neutral-800 bg-neutral-900"}`}>
                <div className="w-full max-w-xl">
                  {!todayWorkoutDone && <div className="mb-6 flex justify-center"><AppIcon name="timer" active /></div>}
                  <h2 className={`text-3xl font-semibold ${todayWorkoutDone ? "text-green-400" : "text-white"}`}>{todayWorkoutDone ? "Good Effort" : "Workout Now"}</h2>
                  {!todayWorkoutDone && <p className={`mt-3 text-lg font-medium ${timerColor}`}>Day ends in {timerString}</p>}
                  <p className="mt-3 text-sm text-neutral-300">{todayWorkoutDone ? "You have already logged training today. Keep the streak moving." : "Tap below to start logging today’s training."}</p>
                  <button onClick={() => { setSelectedDate(todayKey); setActiveTab("workout"); }} className={`mt-8 rounded-2xl px-8 py-4 text-lg font-semibold text-white shadow-lg ${todayWorkoutDone ? "bg-green-500 shadow-green-500/20" : "bg-blue-500 shadow-blue-500/20"}`}>
                    {todayWorkoutDone ? "View Today" : "Workout Now"}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
                  <p className="text-sm uppercase tracking-wide text-neutral-400">Weekly Streak</p>
                  <p className="mt-2 text-4xl font-bold text-green-400">{streak}</p>
                  <p className="mt-1 text-sm text-neutral-400">consecutive day{streak === 1 ? "" : "s"} logged</p>
                </div>
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
                  <p className="text-sm uppercase tracking-wide text-neutral-400">Fitness Level</p>
                  <p className="mt-2 text-4xl font-bold text-blue-400">{latestFitnessScore}</p>
                  <p className="mt-1 text-sm text-neutral-400">{latestFitnessLabel} · points out of 1000</p>
                </div>
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
                  <p className="text-sm uppercase tracking-wide text-neutral-400">Mileage</p>
                  <p className="mt-2 text-4xl font-bold text-blue-400">{thisWeekRunKm.toFixed(1)}</p>
                  <p className="mt-1 text-sm text-neutral-400">km ran this week</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4 shadow-2xl shadow-black/20">
                <div className="mb-4 flex items-center justify-between">
                  <button onClick={() => changeMonth(-1)} className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-300">←</button>
                  <div>
                    <h2 className="text-center text-xl font-semibold">{currentMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
                    <p className="text-center text-sm text-neutral-400">Logged days show a tick and category labels.</p>
                  </div>
                  <button onClick={() => changeMonth(1)} className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-300">→</button>
                </div>
                <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wide text-neutral-500">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day) => <div key={day}>{day}</div>)}</div>
                <div className="grid grid-cols-7 gap-2">
                  {monthCells.map((cell) => {
                    const workout = dayWorkouts[cell.dateKey];
                    const logged = hasWorkoutLogged(workout);
                    const isToday = cell.dateKey === todayKey;
                    const isSelected = cell.dateKey === selectedDate;
                    const future = isFutureDate(cell.dateKey);
                    return (
                      <button key={cell.dateKey} onClick={() => setSelectedDate(cell.dateKey)} className={`min-h-[84px] rounded-2xl border p-2 text-left transition ${cell.isCurrentMonth ? "border-neutral-800 bg-neutral-950" : "border-neutral-900 bg-neutral-950/40 text-neutral-600"} ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isToday ? "rounded-full bg-blue-500 px-2 py-0.5 text-white" : ""}`}>{cell.day}</span>
                          {cell.isCurrentMonth && logged && <span className="text-sm text-green-400">✓</span>}
                          {cell.isCurrentMonth && !logged && !future && <span className="text-sm text-red-400">✕</span>}
                        </div>
                        {cell.isCurrentMonth && logged && <p className="mt-2 text-[11px] leading-4 text-green-300">{getDayLabel(workout)}</p>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold">Workout details</h3>
                    <p className="text-sm text-neutral-400">{prettyDate(selectedDate)}</p>
                  </div>
                  <button onClick={() => setActiveTab("workout")} className="rounded-xl bg-blue-500 px-4 py-2 text-sm font-medium text-white">Log workout for this date</button>
                </div>
                {hasWorkoutLogged(dayWorkouts[selectedDate]) ? (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm uppercase tracking-wide text-blue-400">Lift {hasLoggedLift(dayWorkouts[selectedDate]) ? `· ${selectedDay.liftCategory}` : ""}</p>
                      <div className="space-y-2">
                        {selectedDay.liftEntries.filter((entry) => entry.exercise && (entry.weight || entry.reps || entry.sets || entry.equipment === "Bodyweight")).map((entry) => (
                          <div key={entry.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm">
                            <p className="font-medium text-neutral-100 flex items-center gap-2"><ExerciseEmoji exercise={entry.exercise} /> {entry.exercise}</p>
                            <p className="mt-1 text-neutral-400">
                              {entry.weight ? `${entry.weight} kg · ` : ""}{entry.reps || 0} reps · {entry.sets || 0} sets · {entry.equipment}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm uppercase tracking-wide text-green-400">Cardio</p>
                      <div className="space-y-2">
                        {selectedDay.cardioEntries.filter((entry) => entry.distance || entry.time).map((entry) => (
                          <div key={entry.id} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm">
                            <p className="font-medium text-neutral-100 flex items-center gap-2"><ExerciseEmoji exercise={entry.type} /> {entry.type}</p>
                            <p className="mt-1 text-neutral-400">{entry.distance || 0} km · {entry.time || 0} min</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {selectedDay.notes && <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-300">Notes: {selectedDay.notes}</div>}
                  </div>
                ) : <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 p-5 text-sm text-neutral-400">No workout logged for this day yet.</div>}
              </div>
            </div>
          )}

          {activeTab === "workout" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold">Workout Log</h2>
                    <p className="text-sm text-neutral-400">Logging for {prettyDate(selectedDate)}</p>
                  </div>
                  <div className="inline-flex rounded-2xl border border-neutral-800 bg-neutral-950 p-1">
                    {(["Lift", "Cardio"] as WorkoutMode[]).map((mode) => (
                      <button key={mode} onClick={() => setWorkoutMode(mode)} className={`rounded-xl px-4 py-2 text-sm font-medium ${workoutMode === mode ? "bg-blue-500 text-white" : "text-neutral-400"}`}>{mode}</button>
                    ))}
                  </div>
                </div>

                {workoutMode === "Lift" && (
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm text-neutral-400">Workout type</p>
                      <div className="inline-flex rounded-2xl border border-neutral-800 bg-neutral-950 p-1">
                        {categoryOptions.map((cat) => (
                          <button key={cat} onClick={() => updateSelectedDay((day)=>({ ...day, liftCategory: cat }))} className={`rounded-xl px-4 py-2 text-sm font-medium ${selectedDay.liftCategory === cat ? "bg-green-500 text-neutral-950" : "text-neutral-400"}`}>{cat}</button>
                        ))}
                      </div>
                    </div>

                    {previousMatchingLiftDay && (
                      <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                        <p className="text-sm uppercase tracking-wide text-blue-400">Previous {selectedDay.liftCategory} day</p>
                        <p className="mt-1 text-sm text-neutral-400">{prettyDate(previousMatchingLiftDay.date)}</p>
                        <div className="mt-3 space-y-1 text-sm text-neutral-300">
                          {previousMatchingLiftDay.liftEntries.filter((entry) => entry.weight || entry.reps || entry.sets || entry.equipment === "Bodyweight").map((entry) => (
                            <p key={entry.id} className="flex items-center gap-2"><ExerciseEmoji exercise={entry.exercise} /> {entry.exercise} {entry.weight ? `· ${entry.weight} kg` : ""} · {entry.reps || 0} reps · {entry.sets || 0} sets</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDay.liftEntries.map((entry) => (
                      <div key={entry.id} className="space-y-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
                        <div className={`grid gap-3 ${entry.equipment === "Bodyweight" ? "md:grid-cols-[2fr_1fr_1fr]" : "md:grid-cols-[2fr_1fr_1fr_1fr]"}`}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg"><ExerciseEmoji exercise={entry.exercise} /></span>
                            <select value={entry.exercise} onChange={(e)=>updateLiftEntry(entry.id, "exercise", e.target.value)} className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none">
                              {liftExercises.map((exercise) => <option key={exercise} value={exercise}>{exercise}</option>)}
                            </select>
                          </div>
                          {entry.equipment !== "Bodyweight" && <input value={entry.weight} onChange={(e)=>updateLiftEntry(entry.id, "weight", e.target.value)} placeholder="Weight (kg)" type="number" className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none" />}
                          <input value={entry.reps} onChange={(e)=>updateLiftEntry(entry.id, "reps", e.target.value)} placeholder="Reps" type="number" className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none" />
                          <input value={entry.sets} onChange={(e)=>updateLiftEntry(entry.id, "sets", e.target.value)} placeholder="Sets" type="number" className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none" />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <select value={entry.equipment} onChange={(e)=>updateLiftEntry(entry.id, "equipment", e.target.value)} className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none">
                            {equipmentOptions.map((eq) => <option key={eq} value={eq}>{eq}</option>) }
                          </select>
                          <button onClick={()=>removeLiftLine(entry.id)} className="rounded-xl border border-red-500/40 px-3 py-2 text-sm text-red-400">Remove</button>
                        </div>
                      </div>
                    ))}
                    <button onClick={addLiftLine} className="rounded-xl border border-blue-500/40 px-4 py-2 text-sm font-medium text-blue-400">+ Add exercise</button>
                  </div>
                )}

                {workoutMode === "Cardio" && (
                  <div className="space-y-3">
                    {selectedDay.cardioEntries.map((entry) => (
                      <div key={entry.id} className="grid gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 p-3 md:grid-cols-[2fr_1fr_1fr_auto]">
                        <div className="flex items-center gap-2">
                          <span className="text-lg"><ExerciseEmoji exercise={entry.type} /></span>
                          <select value={entry.type} onChange={(e)=>updateCardioEntry(entry.id, "type", e.target.value as CardioType)} className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none">
                            {cardioOptions.map((type) => <option key={type} value={type}>{type}</option>)}
                          </select>
                        </div>
                        <input value={entry.distance} onChange={(e)=>updateCardioEntry(entry.id, "distance", e.target.value)} placeholder="Distance (km)" type="number" className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none" />
                        <input value={entry.time} onChange={(e)=>updateCardioEntry(entry.id, "time", e.target.value)} placeholder="Time (min)" type="number" className="rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none" />
                        <button onClick={()=>removeCardioLine(entry.id)} className="rounded-xl border border-red-500/40 px-3 py-2 text-sm text-red-400">Remove</button>
                      </div>
                    ))}
                    <button onClick={addCardioLine} className="rounded-xl border border-blue-500/40 px-4 py-2 text-sm font-medium text-blue-400">+ Add cardio line</button>
                  </div>
                )}

                <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                  <p className="mb-2 text-sm text-neutral-400">Workout notes</p>
                  <textarea value={selectedDay.notes} onChange={(e)=>updateSelectedDay((day)=>({ ...day, notes: e.target.value }))} placeholder="How did the session feel? Any notes for next time?" className="min-h-[90px] w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none" />
                </div>

                {workoutMode === "Lift" && (
                  <div className="mt-6 grid gap-5 lg:grid-cols-2">
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                      <h3 className="text-base font-semibold">Weight Conversion Crib Card</h3>
                      <p className="mt-1 text-sm text-neutral-400">Enter a top weight to see common training percentages.</p>
                      <input value={percentBase} onChange={(e)=>setPercentBase(e.target.value)} placeholder="Base weight (kg)" type="number" className="mt-4 w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm outline-none" />
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        {percentageValues.map((item) => <div key={item.p} className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-sm"><p className="text-neutral-400">{item.p}%</p><p className="mt-1 text-lg font-semibold">{item.value} kg</p></div>)}
                      </div>
                    </div>
                    <div className="flex items-end justify-end">
                      <button onClick={saveWorkout} className="w-full rounded-2xl bg-green-500 px-5 py-4 text-base font-semibold text-neutral-950">Save workout</button>
                    </div>
                  </div>
                )}

                {workoutMode === "Cardio" && (
                  <div className="mt-6 flex justify-end">
                    <button onClick={saveWorkout} className="w-full rounded-2xl bg-green-500 px-5 py-4 text-base font-semibold text-neutral-950">Save workout</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="space-y-5">
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                <h2 className="text-xl font-semibold">Profile</h2>
                <p className="mt-1 text-sm text-neutral-400">Strength grading uses your logged bodyweight to scale standards more appropriately.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <input value={profile.name} onChange={(e)=>setProfile({ ...profile, name: e.target.value })} placeholder="Name" className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 outline-none" />
                  <select value={profile.sex} onChange={(e)=>setProfile({ ...profile, sex: e.target.value as Sex })} className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 outline-none"><option value="male">Male</option><option value="female">Female</option></select>
                  <input value={profile.weightKg} onChange={(e)=>setProfile({ ...profile, weightKg: e.target.value })} placeholder="Weight (kg)" type="number" className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 outline-none" />
                  <input value={profile.heightCm} onChange={(e)=>setProfile({ ...profile, heightCm: e.target.value })} placeholder="Height (cm)" type="number" className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 outline-none" />
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                  <h3 className="text-lg font-semibold">Body Map</h3>
                  <p className="mt-1 text-sm text-neutral-400">This is an inferred training balance view built from your exercise log.</p>
                  <div className="mt-4 flex justify-center">
                    <MuscleRadar values={muscleValues} />
                  </div>
                  <div className="mt-5 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-medium">Fitness Level</p>
                      <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">{latestFitnessLabel}</span>
                    </div>
                    <p className="mb-3 text-sm text-neutral-400">{latestFitnessScore} points out of 1000</p>
                    <FitnessLineChart points={fitnessTrend} />
                  </div>
                </div>

                <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">Exercise Levels</h3>
                      <p className="mt-1 text-sm text-neutral-400">Most recent benchmark exercises first.</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setExerciseIndex((i) => Math.max(0, i - 1))} className="rounded-xl border border-neutral-800 px-3 py-2 text-sm text-neutral-300">←</button>
                      <button onClick={() => setExerciseIndex((i) => Math.min(Math.max(0, exerciseCards.length - 4), i + 1))} className="rounded-xl border border-neutral-800 px-3 py-2 text-sm text-neutral-300">→</button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {visibleExerciseCards.length ? visibleExerciseCards.map((card) => (
                      <div key={card.name} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium">{card.name}</p>
                            <p className="text-sm text-neutral-400">{card.subtitle}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${card.level === "Elite" ? "bg-green-500/20 text-green-400" : card.level === "Advanced" ? "bg-blue-500/20 text-blue-300" : card.level === "Intermediate" ? "bg-blue-500/10 text-blue-400" : card.level === "Novice" ? "bg-neutral-800 text-neutral-300" : "bg-red-500/10 text-red-400"}`}>{card.level}</span>
                        </div>
                        <ProgressBar value={card.progress} colorClass={card.color} />
                      </div>
                    )) : <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 p-4 text-sm text-neutral-400">No benchmark exercises logged yet.</div>}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-4">
                <h3 className="text-lg font-semibold">Training History</h3>
                <p className="mt-1 text-sm text-neutral-400">Showing the last 7 days only.</p>
                <div className="mt-4 grid gap-5 lg:grid-cols-2">
                  <div>
                    <h4 className="mb-2 text-sm uppercase tracking-wide text-blue-400">Lift History</h4>
                    <div className="space-y-2">
                      {liftHistory.length ? liftHistory.map((day) => (
                        <div key={`lift-${day.date}`} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">{prettyDate(day.date)} · {day.liftCategory}</p>
                              <div className="mt-2 space-y-1 text-sm text-neutral-400">
                                {day.liftEntries.filter((entry) => entry.weight || entry.reps || entry.sets || entry.equipment === "Bodyweight").map((entry) => (
                                  <p key={entry.id} className="flex items-center gap-2"><ExerciseEmoji exercise={entry.exercise} /> {entry.exercise}{entry.weight ? ` · ${entry.weight} kg` : ""} · {entry.reps || 0} reps · {entry.sets || 0} sets</p>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => editDay(day.date)} className="rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-300">Edit</button>
                              <button onClick={() => deleteDay(day.date)} className="rounded-xl border border-red-500/40 px-3 py-2 text-xs text-red-400">Delete</button>
                            </div>
                          </div>
                        </div>
                      )) : <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 p-4 text-sm text-neutral-400">No lift history yet.</div>}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm uppercase tracking-wide text-green-400">Cardio History</h4>
                    <div className="space-y-2">
                      {cardioHistory.length ? cardioHistory.map((day) => (
                        <div key={`cardio-${day.date}`} className="rounded-2xl border border-neutral-800 bg-neutral-950 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium">{prettyDate(day.date)}</p>
                              <div className="mt-2 space-y-1 text-sm text-neutral-400">
                                {day.cardioEntries.filter((entry) => entry.distance || entry.time).map((entry) => (
                                  <p key={entry.id} className="flex items-center gap-2"><ExerciseEmoji exercise={entry.type} /> {entry.type} · {entry.distance || 0} km · {entry.time || 0} min</p>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => editDay(day.date)} className="rounded-xl border border-neutral-700 px-3 py-2 text-xs text-neutral-300">Edit</button>
                              <button onClick={() => deleteDay(day.date)} className="rounded-xl border border-red-500/40 px-3 py-2 text-xs text-red-400">Delete</button>
                            </div>
                          </div>
                        </div>
                      )) : <div className="rounded-2xl border border-dashed border-neutral-700 bg-neutral-950 p-4 text-sm text-neutral-400">No cardio history yet.</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur">
          <div className="mx-auto grid max-w-6xl grid-cols-4 px-3 py-3 text-center text-xs font-medium">
            {navItems.map((item) => (
              <button key={item} onClick={() => setActiveTab(item)} className="flex flex-col items-center justify-center gap-1">
                <AppIcon name={item} active={activeTab === item} />
              </button>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
