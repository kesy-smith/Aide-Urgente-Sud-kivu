import { auth } from './firebase';
import { FirestoreErrorInfo } from '../types';

export function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null): never {
  if (error?.code === 'permission-denied') {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message || 'Missing or insufficient permissions',
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || 'none',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous ?? true,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || '',
        })) || [],
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}
