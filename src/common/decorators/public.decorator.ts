import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator to mark endpoints as publicly accessible.
 * Bypasses the global JWT authentication guard.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
