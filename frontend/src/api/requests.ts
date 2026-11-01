/**
 * API client for rental request endpoints.
 * Attaches Supabase JWT from session automatically.
 */
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) {
      headers["Authorization"] = `Bearer ${data.session.access_token}`;
      return headers;
    }
  }

  // Fallback to simulated profile in demo / local mode
  try {
    const saved = localStorage.getItem("localconnect_simulated_user");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.id) headers["X-Demo-User-Id"] = parsed.id;
      if (parsed.role) headers["X-Demo-Role"] = parsed.role;
      if (parsed.fullName) headers["X-Demo-Name"] = parsed.fullName;
      return headers;
    }
  } catch {
    /* ignore localStorage errors */
  }

  headers["X-Demo-User-Id"] = "demo-tourist-01";
  headers["X-Demo-Role"] = "tourist";
  return headers;
}

export interface CreateRequestPayload {
  item_id: string;
  rental_start: string; // YYYY-MM-DD
  rental_end: string;   // YYYY-MM-DD
  quantity: number;
  handover_method: "pickup" | "delivery";
  tourist_note?: string;
}

export interface RentalRequest {
  id: string;
  tourist_id: string;
  lender_id: string;
  item_id: string;
  item_title: string;
  tourist_name: string;
  tourist_email: string;
  lender_name: string;
  quantity: number;
  rental_start: string;
  rental_end: string;
  handover_method: string;
  tourist_note?: string | null;
  rental_subtotal: number;
  platform_fee: number;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityInfo {
  item_id: string;
  total_quantity: number;
  available_quantity: number;
  reserved_quantity: number;
  status: "available" | "partially_available" | "unavailable";
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    let detail = `API error ${res.status}`;
    try {
      const json = await res.json();
      detail = json.detail || detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export const requestsApi = {
  create: (payload: CreateRequestPayload) =>
    apiFetch<RentalRequest>("/api/v1/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  listMine: (params?: { status?: string }) => {
    const qs = params?.status ? `?status=${params.status}` : "";
    return apiFetch<RentalRequest[]>(`/api/v1/requests/mine${qs}`);
  },

  getDetail: (id: string) =>
    apiFetch<RentalRequest>(`/api/v1/requests/${id}`),

  accept: (id: string, reason?: string) =>
    apiFetch<RentalRequest>(`/api/v1/requests/${id}/accept`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  reject: (id: string, reason?: string) =>
    apiFetch<RentalRequest>(`/api/v1/requests/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  cancel: (id: string) =>
    apiFetch<RentalRequest>(`/api/v1/requests/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({}),
    }),

  checkAvailability: (itemId: string, start: string, end: string) =>
    apiFetch<AvailabilityInfo>(`/api/v1/items/${itemId}/availability?start=${start}&end=${end}`),
};

export interface Notification {
  id: string;
  recipient_id: string;
  title: string;
  content: string;
  reference_id: string;
  read_at: string | null;
  created_at: string;
}

export const notificationsApi = {
  list: () => apiFetch<Notification[]>("/api/v1/notifications"),
  markRead: (id: string) =>
    apiFetch<Notification>(`/api/v1/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    apiFetch<{ marked_read: number }>("/api/v1/notifications/read-all", { method: "PATCH" }),
};

