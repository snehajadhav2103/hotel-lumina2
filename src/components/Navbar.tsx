import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { LogOut, User, LayoutDashboard, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { user, profile, login, logout, isAdmin } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Rooms', path: '/rooms' },
  ];

  if (user) {
    navLinks.push({ name: 'Bookings', path: '/dashboard' });
    if (isAdmin) {
      navLinks.push({ name: 'Admin', path: '/admin' });
    }
  }

  return (
    <header className="h-[80px] bg-surface border-b border-border-theme px-10 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-primary tracking-tighter">
        LUMINA SUITES
      </Link>
      
      <nav className="flex gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              location.pathname === link.path 
                ? "text-primary border-b-2 border-accent pb-1" 
                : "text-text-muted"
            )}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-text-main leading-none">
                {profile?.displayName || 'User'}
              </p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-accent">
                {profile?.role}
              </p>
            </div>
            <div className="relative group">
              <img
                src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName || 'U'}&background=1A365D&color=fff`}
                alt="Profile"
                className="w-10 h-10 rounded-lg object-cover cursor-pointer border border-border-theme"
              />
              <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-theme border border-border-theme opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-2">
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-bg text-text-main">
                  <User size={14} /> My Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-xs hover:bg-bg text-text-main">
                    <ShieldCheck size={14} /> Admin Panel
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs hover:bg-bg text-red-500 text-left"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={login} className="btn-primary">
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
