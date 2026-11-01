/**
 * useRequests — typed hook for rental request operations.
 * Handles loading, error, and optimistic updates.
 */
import { useState, useEffect, useCallback } from "react";
import { requestsApi, type RentalRequest } from "../api/requests";
import { useAuth } from "../context/AuthContext";

interface UseRequestsResult {
  requests: RentalRequest[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useRequests(statusFilter?: string): UseRequestsResult {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    setError(null);
    try {
      const data = await requestsApi.listMine(statusFilter ? { status: statusFilter } : undefined);
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, [profile, statusFilter]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { requests, loading, error, refresh: fetch };
}

interface UseRequestActionsResult {
  accepting: Set<string>;
  rejecting: Set<string>;
  cancelling: Set<string>;
  acceptRequest: (id: string, reason?: string) => Promise<boolean>;
  rejectRequest: (id: string, reason?: string) => Promise<boolean>;
  cancelRequest: (id: string) => Promise<boolean>;
}

export function useRequestActions(
  onSuccess: (updated: RentalRequest) => void,
  onError: (msg: string) => void
): UseRequestActionsResult {
  const [accepting, setAccepting] = useState<Set<string>>(new Set());
  const [rejecting, setRejecting] = useState<Set<string>>(new Set());
  const [cancelling, setCancelling] = useState<Set<string>>(new Set());

  const acceptRequest = useCallback(async (id: string, reason?: string) => {
    setAccepting((s) => new Set(s).add(id));
    try {
      const updated = await requestsApi.accept(id, reason);
      onSuccess(updated);
      return true;
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to accept request.");
      return false;
    } finally {
      setAccepting((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }, [onSuccess, onError]);

  const rejectRequest = useCallback(async (id: string, reason?: string) => {
    setRejecting((s) => new Set(s).add(id));
    try {
      const updated = await requestsApi.reject(id, reason);
      onSuccess(updated);
      return true;
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to reject request.");
      return false;
    } finally {
      setRejecting((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }, [onSuccess, onError]);

  const cancelRequest = useCallback(async (id: string) => {
    setCancelling((s) => new Set(s).add(id));
    try {
      const updated = await requestsApi.cancel(id);
      onSuccess(updated);
      return true;
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to cancel request.");
      return false;
    } finally {
      setCancelling((s) => { const n = new Set(s); n.delete(id); return n; });
    }
  }, [onSuccess, onError]);

  return { accepting, rejecting, cancelling, acceptRequest, rejectRequest, cancelRequest };
}

