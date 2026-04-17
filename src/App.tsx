/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import RoomDetails from './pages/RoomDetails';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import { seedRoomsIfEmpty } from './seed';

export default function App() {
  useEffect(() => {
    // Seed initial data if the collection is empty
    seedRoomsIfEmpty();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-bg flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/rooms" element={<Rooms />} />
                <Route path="/rooms/:id" element={<RoomDetails />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </main>
            <footer className="bg-surface border-t border-border-theme py-10">
              <div className="container mx-auto px-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <p className="text-sm font-bold text-primary">LUMIERE RESORT & SUITES</p>
                  <p className="text-xs text-text-muted mt-1">© 2026 Lumiere Hospitality Group. All rights reserved.</p>
                </div>
                <div className="flex gap-8">
                  <span className="text-xs font-bold text-text-muted cursor-pointer hover:text-primary transition-colors uppercase tracking-widest">Privacy</span>
                  <span className="text-xs font-bold text-text-muted cursor-pointer hover:text-primary transition-colors uppercase tracking-widest">Terms</span>
                  <span className="text-xs font-bold text-text-muted cursor-pointer hover:text-primary transition-colors uppercase tracking-widest">Support</span>
                </div>
              </div>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
