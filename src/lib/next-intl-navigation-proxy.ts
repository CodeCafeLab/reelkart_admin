// This file is a workaround attempt for issues resolving exports from 'next-intl/navigation'.
// It explicitly re-exports the needed utilities.
'use client'; // Important: these are client-side utilities

import {
  usePathname as usePathnameOriginal,
  useRouter as useRouterOriginal,
  Link as LinkOriginal,
  type Pathnames // Ensure type exports are also handled if needed by Link
} from 'next-intl/navigation';

// Re-export them to be used by other client components
export const usePathname = usePathnameOriginal;
export const useRouter = useRouterOriginal;
export const Link = LinkOriginal;
export type { Pathnames };
