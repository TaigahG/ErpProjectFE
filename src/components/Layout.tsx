import React from 'react';
import { Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  BarChart3, 
  LogOut,
  Archive
} from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../store/authStore';

export function Layout() {
  const { signOut } = useAuthStore();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Receipt, label: 'Transactions', path: '/transactions' },
    { icon: FileText, label: 'Invoices', path: '/invoices' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    {icon: Archive, label: 'Inventory', path: '/inventory'},
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar menuItems={menuItems} onSignOut={signOut} />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}