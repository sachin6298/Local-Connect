import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type { UserProfile, UserRole } from "../types/auth";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, role: "tourist" | "lender", fullName: string, phone?: string) => Promise<{ success: boolean; message: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; message: string }>;
  loginAsDemoUser: (role: UserRole) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // In-flight promise tracker to avoid duplicate profile fetches
  const fetchingProfileRef = useRef<string | null>(null);

  async function loadProfile(currentUser: User): Promise<UserProfile> {
    if (fetchingProfileRef.current === currentUser.id && profile) {
      return profile;
    }
    fetchingProfileRef.current = currentUser.id;

    try {
      if (isSupabaseConfigured) {
        const { data, error: dbError } = await supabase
          .from("profiles")
          .select("id, full_name, phone, role, preferred_language, avatar_path")
          .eq("id", currentUser.id)
          .single();

        if (!dbError && data) {
          const userProf: UserProfile = {
            id: data.id,
            email: currentUser.email || "",
            role: (data.role as UserRole) || "tourist",
            fullName: data.full_name || "LocalConnect User",
            phone: data.phone,
            avatarPath: data.avatar_path,
            preferredLanguage: data.preferred_language || "en",
          };
          setProfile(userProf);
          return userProf;
        }
      }

      // Fallback from metadata or defaults
      const rawRole = currentUser.user_metadata?.role;
      const safeRole: UserRole = rawRole === "admin" || rawRole === "lender" ? rawRole : "tourist";
      const fallbackProf: UserProfile = {
        id: currentUser.id,
        email: currentUser.email || "",
        role: safeRole,
        fullName: currentUser.user_metadata?.full_name || "LocalConnect User",
        phone: currentUser.user_metadata?.phone,
        preferredLanguage: "en",
      };
      setProfile(fallbackProf);
      return fallbackProf;
    } finally {
      fetchingProfileRef.current = null;
    }
  }

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        if (!isSupabaseConfigured) {
          // Check local simulated session
          const stored = localStorage.getItem("localconnect_simulated_user");
          if (stored) {
            const parsed = JSON.parse(stored) as UserProfile;
            if (mounted) {
              setProfile(parsed);
              setUser({ id: parsed.id, email: parsed.email } as User);
            }
          }
          if (mounted) setLoading(false);
          return;
        }

        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            await loadProfile(initialSession.user);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to initialize session.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          if (!mounted) return;
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (event === "SIGNED_OUT" || !newSession) {
            setProfile(null);
          } else if (newSession?.user) {
            await loadProfile(newSession.user);
          }
        }
      );

      return () => {
        mounted = false;
        authListener?.subscription.unsubscribe();
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  async function signUp(
    email: string,
    password: string,
    role: "tourist" | "lender",
    fullName: string,
    phone?: string
  ): Promise<{ success: boolean; message: string }> {
    setError(null);

    // Security check: never permit public admin self-registration
    if ((role as string) === "admin") {
      const msg = "Unauthorized: Administrator accounts cannot be self-registered.";
      setError(msg);
      return { success: false, message: msg };
    }

    try {
      if (!isSupabaseConfigured) {
        // Simulated local signup
        const newProf: UserProfile = {
          id: `sim-${Date.now()}`,
          email,
          role,
          fullName,
          phone: phone || null,
          preferredLanguage: "en",
        };
        setProfile(newProf);
        setUser({ id: newProf.id, email: newProf.email } as User);
        localStorage.setItem("localconnect_simulated_user", JSON.stringify(newProf));
        return {
          success: true,
          message: "Account created successfully! Welcome to LocalConnect.",
        };
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName,
            phone: phone || null,
          },
        },
      });

      if (signUpError) throw signUpError;

      if (data.user && data.session) {
        await loadProfile(data.user);
        return { success: true, message: "Registration successful! Welcome to LocalConnect." };
      } else if (data.user && !data.session) {
        return {
          success: true,
          message: "Registration successful! Please check your email inbox to verify your account.",
        };
      }

      return { success: true, message: "Registration request processed." };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setError(msg);
      return { success: false, message: msg };
    }
  }

  async function signIn(email: string, password: string): Promise<{ success: boolean; message: string }> {
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        // Fallback demo sign-in
        const demoRole: UserRole = email.includes("admin") ? "admin" : email.includes("lender") ? "lender" : "tourist";
        loginAsDemoUser(demoRole);
        return { success: true, message: `Signed in as ${demoRole} (development mode).` };
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        await loadProfile(data.user);
      }
      return { success: true, message: "Signed in successfully." };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setError(msg);
      return { success: false, message: msg };
    }
  }

  async function signOut(): Promise<void> {
    setError(null);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem("localconnect_simulated_user");
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign out.");
    }
  }

  async function resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    setError(null);
    try {
      if (!isSupabaseConfigured) {
        return {
          success: true,
          message: "Password reset link sent (simulated). Check your inbox.",
        };
      }

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (resetError) throw resetError;

      return {
        success: true,
        message: "Password reset link has been dispatched to your email address.",
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send reset email.";
      setError(msg);
      return { success: false, message: msg };
    }
  }

  async function updateProfile(updates: Partial<UserProfile>): Promise<{ success: boolean; message: string }> {
    if (!profile) return { success: false, message: "No active user profile." };

    // Prevent non-admin self-elevation
    if (updates.role && updates.role !== profile.role && profile.role !== "admin") {
      return { success: false, message: "Unauthorized: User role cannot be self-modified." };
    }

    try {
      if (isSupabaseConfigured && profile.id) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            full_name: updates.fullName,
            phone: updates.phone,
            preferred_language: updates.preferredLanguage,
          })
          .eq("id", profile.id);

        if (updateError) throw updateError;
      }

      const updated = { ...profile, ...updates };
      setProfile(updated);
      localStorage.setItem("localconnect_simulated_user", JSON.stringify(updated));
      return { success: true, message: "Profile updated successfully." };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      return { success: false, message: msg };
    }
  }

  function loginAsDemoUser(role: UserRole) {
    const demoProfiles: Record<UserRole, UserProfile> = {
      tourist: {
        id: "demo-tourist-01",
        email: "ramesh.tourist@example.com",
        role: "tourist",
        fullName: "Ramesh Kumar (Tourist)",
        phone: "+91 97777 33333",
        preferredLanguage: "en",
      },
      lender: {
        id: "demo-lender-01",
        email: "sharma.lender@example.com",
        role: "lender",
        fullName: "Radhe Mohan Sharma (Lender)",
        phone: "+91 98888 11111",
        preferredLanguage: "hi",
      },
      admin: {
        id: "demo-admin-01",
        email: "operator.admin@localconnect.app",
        role: "admin",
        fullName: "LocalConnect Administrator",
        phone: "+91 99999 00000",
        preferredLanguage: "en",
      },
    };

    const target = demoProfiles[role];
    setProfile(target);
    setUser({ id: target.id, email: target.email } as User);
    localStorage.setItem("localconnect_simulated_user", JSON.stringify(target));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        loginAsDemoUser,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

