import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface SidebarProps {
  menuItems: MenuItem[];
  onSignOut: () => void;
}

export function Sidebar({ menuItems, onSignOut }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className="w-64 bg-white shadow-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">ERP System</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                isActive ? 'bg-gray-100' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-64 p-6">
        <button
          onClick={onSignOut}
          className="flex items-center text-gray-700 hover:text-gray-900"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}