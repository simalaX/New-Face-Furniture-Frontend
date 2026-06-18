'use client';
import { useEffect, useState } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://new-face-backend-ba3q.onrender.com';

export default function AdminPage() {
  const [admin, setAdmin] = useState('Admin');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    fetch(`${BACKEND_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.username) setAdmin(data.username); })
      .catch(() => { });
  }, []);

  return <AdminDashboard admin={admin} />;
}