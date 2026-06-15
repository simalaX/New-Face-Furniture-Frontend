'use client';
import { useEffect, useState } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

// ─── NOTE ─────────────────────────────────────────────────────────────────────
// Auth is handled entirely by AdminLayout (the layout.tsx wrapping this page).
// This page must NOT duplicate the auth check — doing so caused a race condition
// where the page could render before the layout's guard resolved, allowing bypass.
//
// All this page does:
//   1. Fetch the admin username from /auth/me (for display purposes only — NOT for gating)
//   2. Render <AdminDashboard> with that username
// ─────────────────────────────────────────────────────────────────────────────

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function AdminPage() {
  const [admin, setAdmin] = useState('Admin');

  // Fetch username purely for display in the dashboard header.
  // If this fails, we still show the dashboard — the layout already
  // confirmed the user is authenticated before this page even renders.
  useEffect(() => {
    fetch(`${BACKEND_URL}/auth/me`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.username) setAdmin(data.username); })
      .catch(() => { /* username display is non-critical */ });
  }, []);

  return <AdminDashboard admin={admin} />;
}