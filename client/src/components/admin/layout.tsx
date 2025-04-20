// This file is a compatibility layer that reexports the new AdminLayout
// to avoid breaking existing imports in admin pages

import AdminLayout from '@/components/layout/AdminLayout';

// Re-export as both named export and default export to satisfy all import styles
export { AdminLayout };
export default AdminLayout;