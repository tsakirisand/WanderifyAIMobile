export type TripActivity = { time?: string; place: string; description: string };
export type TripDay = { day: number; morning: TripActivity[]; afternoon: TripActivity[]; evening: TripActivity[]; tips?: string[] };
export type AiTripResult = {
  destination: string;
  days: TripDay[];
  budget_estimate: string;
  hidden_gems: string[];
  food_recommendations: { name: string; rating?: string; description: string }[];
  flight_suggestions?: { route: string; airlines: string[]; typical_duration: string; estimated_cost: string }[];
  hotel_recommendations?: { name: string; rating?: string; price_range: string; description: string }[];
  summary: string;
};

export type Trip = {
  id: string;
  userId: string;
  destination: string;
  days: number;
  budget: string;
  travelStyle: string;
  travelers: string;
  interests: string[];
  notes?: string;
  aiResult?: AiTripResult;
  coordinates?: Record<string, { lat: number; lon: number }>;
  startDate?: string | null;
  createdAt: string;
  isGenerating?: boolean;
};

export type TripConfig = {
  destination: string;
  days: number;
  budget: string;
  travelStyle: string;
  travelers: "solo" | "couple" | "family" | "friends";
  interests: string[];
  notes: string;
  startDate: string;
};

export function tripEndDate(trip: Trip) {
  if (!trip.startDate) return null;
  const date = new Date(`${trip.startDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + Math.max(0, trip.days - 1));
  return date.toISOString().slice(0, 10);
}

export function formatTripDate(value?: string | null) {
  if (!value) return "Dates not set";
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.valueOf()) ? "Date unavailable" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export function formatDateRange(trip: Trip) {
  return `${formatTripDate(trip.startDate)} – ${formatTripDate(tripEndDate(trip))}`;
}
