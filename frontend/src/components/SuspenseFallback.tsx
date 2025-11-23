import { memo } from 'react';
import { Loading } from '@/components/ui';

/**
 * Suspense Fallback Component
 * ===========================
 * Displayed while lazy-loaded components are loading
 */
function SuspenseFallback() {
  return <Loading text="Loading page..." overlay />;
}

export default memo(SuspenseFallback);

SuspenseFallback.displayName = 'SuspenseFallback';
