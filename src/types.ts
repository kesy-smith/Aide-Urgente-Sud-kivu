export type UserRole = 'user' | 'volunteer' | 'ngo';
export type RequestStatus = 'open' | 'in_progress' | 'resolved';
export type RequestCategory = 'medical' | 'food' | 'financial' | 'emergency';

export interface UserProfile {
  uid: string;
  displayName: string;
  phoneNumber?: string;
  email?: string;
  role: UserRole;
  rating?: number;
  totalHelped?: number;
  createdAt: string;
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  location: {
    area: string;
    lat?: number;
    lng?: number;
  };
  contact: string;
  status: RequestStatus;
  urgency: 'low' | 'medium' | 'high';
  userId: string;
  userName: string;
  volunteerId?: string;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}
