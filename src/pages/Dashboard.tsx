import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Booking } from '../types';
import { format } from 'date-fns';
import { Calendar, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (location.state?.bookingSuccess) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  }, [location]);

  useEffect(() => {
    async function fetchUserBookings() {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          checkIn: doc.data().checkIn.toDate(),
          checkOut: doc.data().checkOut.toDate(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Booking[];
        setBookings(data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUserBookings();
  }, [user]);

  const cancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await updateDoc(doc(db, 'bookings', id), { status: 'cancelled' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      console.error('Cancel booking error:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-yellow-500" />;
    }
  };

  return (
    <div className="container mx-auto px-10 py-12">
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bounce">
          🎉 Reservation successfully created!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-6">
          <div className="card-sleek p-8 text-center bg-gradient-to-br from-primary to-primary/80 text-white border-none">
            <img
              src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName || 'U'}&background=C0A080&color=fff`}
              alt="Avatar"
              className="w-24 h-24 rounded-2xl mx-auto mb-4 border-4 border-white/20 object-cover"
            />
            <h2 className="text-xl font-bold mb-1">{profile?.displayName}</h2>
            <p className="text-xs opacity-70 mb-4">{profile?.email}</p>
            <div className="inline-block bg-accent px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest">
              {profile?.role} Member
            </div>
          </div>

          <div className="card-sleek p-6 space-y-4">
            <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Account Status</h3>
            <div className="flex justify-between items-center py-2 border-b border-border-theme">
              <span className="text-xs text-text-muted font-medium">Joined Date</span>
              <span className="text-xs font-bold">{profile ? format(profile.createdAt, 'MMM yyyy') : '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-xs text-text-muted font-medium">Total Stays</span>
              <span className="text-xs font-bold">{bookings.filter(b => b.status === 'confirmed').length}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-primary tracking-tight">Your Reservations</h1>
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
              {bookings.length} Records
            </span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="h-32 bg-border-theme/50 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-6">
              {bookings.map((booking) => (
                <div key={booking.id} className="card-sleek group hover:border-primary/30 transition-all">
                  <div className="p-6 flex flex-col md:flex-row gap-6 md:items-center">
                    <div className="flex-grow space-y-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                          booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {booking.status}
                        </span>
                        <h4 className="text-lg font-bold text-primary">{booking.roomName}</h4>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Calendar size={14} className="text-accent" />
                          <span>Check-in: <strong>{format(booking.checkIn, 'MMM dd, yyyy')}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Calendar size={14} className="text-accent" />
                          <span>Check-out: <strong>{format(booking.checkOut, 'MMM dd, yyyy')}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-text-muted">
                          <Package size={14} className="text-accent" />
                          <span>Total: <strong>${booking.totalPrice}</strong></span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="px-4 py-2 text-xs font-bold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Cancel Stay
                        </button>
                      )}
                      <button className="px-4 py-2 text-xs font-bold text-primary border border-border-theme rounded-lg hover:bg-bg transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-surface border border-dashed border-border-theme rounded-2xl">
              <Calendar size={48} className="mx-auto mb-4 text-border-theme" />
              <p className="text-xl font-bold text-primary mb-2">No bookings yet</p>
              <p className="text-text-muted mb-6">Plan your getaway today and experience Lumiere hospitality.</p>
              <Link to="/rooms" className="btn-primary">Browse Available Suites</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
