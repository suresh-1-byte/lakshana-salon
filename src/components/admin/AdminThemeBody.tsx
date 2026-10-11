'use client';

import { useEffect } from 'react';

/**
 * Radix popups (Select, Dialog, Popover, DropdownMenu…) are portalled
 * directly under <body>, outside the admin layout wrapper. Putting the
 * `admin-theme` class on <body> while the admin panel is mounted gives
 * them the same theme tokens, so they render with a solid background.
 */
export function AdminThemeBody() {
  useEffect(() => {
    document.body.classList.add('admin-theme');
    return () => document.body.classList.remove('admin-theme');
  }, []);
  return null;
}
