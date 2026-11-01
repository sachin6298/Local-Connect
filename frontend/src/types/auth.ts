export type UserRole = "tourist" | "lender" | "admin";

export type VerificationStatus = "draft" | "submitted" | "approved" | "rejected" | "suspended";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string | null;
  avatarPath?: string | null;
  preferredLanguage?: string;
  createdAt?: string;
}

export interface LenderProfile {
  userId: string;
  displayName: string;
  description?: string | null;
  localityId?: string | null;
  publicAreaLabel?: string | null;
  verificationStatus: VerificationStatus;
  languages?: string[];
}

export type AuthModalMode = "login" | "register" | "forgot_password";

