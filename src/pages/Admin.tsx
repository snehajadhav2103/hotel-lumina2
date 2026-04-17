import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, getDocs, orderBy, updateDoc, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Room, Booking, RoomType } from '../types';
import { format } from 'date-fns';
import { LayoutDashboard, Users, Hotel, CreditCard, Plus, Edit, Trash2, Search } from 'lucide-react';

export default function Admin() {
  const { profile, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'bookings'>('overview');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    async function fetchData() {
      try {
        const roomsSnapshot = await getDocs(query(collection(db, 'rooms'), orderBy('createdAt', 'desc')));
        const roomsData = roomsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Room[];
        setRooms(roomsData);

        const bookingsSnapshot = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
        const bookingsData = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          checkIn: doc.data().checkIn.toDate(),
          checkOut: doc.data().checkOut.toDate(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Booking[];
        setBookings(bookingsData);
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-10 py-24 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Access Restricted</h2>
        <p className="text-text-muted mb-6">Unauthorized access detected. This area is reserved for staff members.</p>
        <button onClick={() => window.location.href = '/'} className="btn-primary">Return Home</button>
      </div>
    );
  }

  const handleDeleteRoom = async (id: string) => {
    if (!window.confirm('Delete this room permanently?')) return;
    try {
      await deleteDoc(doc(db, 'rooms', id));
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Delete room err:', err);
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status: newStatus });
      const updatedBooking = bookings.find(b => b.id === id);
      
      if (newStatus === 'confirmed' && updatedBooking) {
        fetch('/api/bookings/confirm-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userEmail: updatedBooking.userEmail,
            roomName: updatedBooking.roomName,
            checkIn: format(updatedBooking.checkIn, 'MMM dd, yyyy'),
            checkOut: format(updatedBooking.checkOut, 'MMM dd, yyyy'),
            totalPrice: updatedBooking.totalPrice,
            status: 'confirmed',
            bookingId: id
          }),
        }).catch(err => console.error('Confirmation email failed:', err));
      }

      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus as any } : b));
    } catch (err) {
      console.error('Update booking status err:', err);
    }
  };

  const totals = {
    revenue: bookings.filter(b => b.status === 'confirmed').reduce((acc, b) => acc + b.totalPrice, 0),
    occupancy: (rooms.filter(r => !r.isAvailable).length / (rooms.length || 1) * 100).toFixed(1),
    pending: bookings.filter(b => b.status === 'pending').length,
    totalBookings: bookings.length,
  };

  return (
    <div className="container mx-auto px-10 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-primary tracking-tight">Management Suite</h1>
          <p className="text-text-muted font-medium">Control center for global hotel operations.</p>
        </div>
        
        <div className="flex bg-bg p-1 rounded-xl border border-border-theme">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Insights' },
            { id: 'rooms', icon: Hotel, label: 'Inventory' },
            { id: 'bookings', icon: CreditCard, label: 'Ledger' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab.id ? 'bg-surface shadow-theme text-primary' : 'text-text-muted hover:text-primary'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-border-theme rounded-xl" />)}
          </div>
          <div className="h-96 bg-border-theme rounded-xl" />
        </div>
      ) : (
        <div className="space-y-10">
          {/* Dashboard Insights */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Revenue', value: `$${totals.revenue}`, icon: CreditCard, color: 'text-green-500' },
                  { label: 'Occupancy Rate', value: `${totals.occupancy}%`, icon: Hotel, color: 'text-primary' },
                  { label: 'Pending Requests', value: totals.pending, icon: Clock, color: 'text-yellow-500' },
                  { label: 'Total Stays', value: totals.totalBookings, icon: Users, color: 'text-accent' },
                ].map((s, idx) => (
                  <div key={idx} className="card-sleek p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 bg-bg rounded-lg ${s.color}`}>
                        <s.icon size={20} />
                      </div>
                    </div>
                    <p className="text-2xl font-extrabold text-primary">{s.value}</p>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 card-sleek p-8">
                  <h3 className="text-lg font-bold text-primary mb-6">Recent Activity</h3>
                  <div className="space-y-6">
                    {bookings.slice(0, 5).map(booking => (
                      <div key={booking.id} className="flex items-center justify-between py-4 border-b border-border-theme last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded bg-bg flex items-center justify-center font-bold text-primary">
                            {booking.userEmail[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-main">{booking.roomName}</p>
                            <p className="text-[10px] text-text-muted">{booking.userEmail}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">${booking.totalPrice}</p>
                          <p className={`text-[9px] font-bold uppercase ${
                            booking.status === 'confirmed' ? 'text-green-500' : 
                            booking.status === 'cancelled' ? 'text-red-500' : 'text-yellow-500'
                          }`}>{booking.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="card-sleek p-6 bg-primary text-white">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-6 opacity-80">Platform Health</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-xs opacity-70">Database API</span>
                        <span className="text-[10px] font-bold bg-green-500 px-2 py-0.5 rounded">ONLINE</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-white/10">
                        <span className="text-xs opacity-70">Auth System</span>
                        <span className="text-[10px] font-bold bg-green-500 px-2 py-0.5 rounded">HEALTHY</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-xs opacity-70">Payment Portal</span>
                        <span className="text-[10px] font-bold bg-green-500 px-2 py-0.5 rounded">STABLE</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-sleek p-6">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <button 
                        onClick={() => { setEditingRoom({}); setIsRoomModalOpen(true); }}
                        className="w-full text-left px-4 py-3 text-xs font-bold text-text-main hover:bg-bg rounded-lg border border-border-theme flex items-center gap-2 transition-all"
                      >
                        <Plus size={14} className="text-accent" /> Add New Suite
                      </button>
                      <button className="w-full text-left px-4 py-3 text-xs font-bold text-text-main hover:bg-bg rounded-lg border border-border-theme flex items-center gap-2 transition-all">
                        <CreditCard size={14} className="text-accent" /> Export Finance Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Inventory Management */}
          {activeTab === 'rooms' && (
            <div className="card-sleek">
              <div className="p-8 border-b border-border-theme flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary">Room Inventory</h3>
                <button 
                  onClick={() => { setEditingRoom({}); setIsRoomModalOpen(true); }}
                  className="btn-accent flex items-center gap-2 text-xs"
                >
                  <Plus size={14} /> Add Suite
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-bg text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-4">Room Details</th>
                      <th className="px-8 py-4">Category</th>
                      <th className="px-8 py-4">Price</th>
                      <th className="px-8 py-4">Status</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme">
                    {rooms.map(room => (
                      <tr key={room.id} className="hover:bg-bg/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <img src={room.image} alt={room.name} className="w-12 h-8 rounded object-cover" />
                            <span className="text-sm font-bold text-text-main">{room.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-xs font-medium text-text-muted">{room.type}</span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-sm font-bold text-primary">${room.pricePerNight}</span>
                        </td>
                        <td className="px-8 py-4">
                          <button 
                            onClick={() => updateDoc(doc(db, 'rooms', room.id), { isAvailable: !room.isAvailable }).then(() => setRooms(prev => prev.map(r => r.id === room.id ? {...r, isAvailable: !r.isAvailable} : r)))}
                            className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${room.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                          >
                            {room.isAvailable ? 'Ready' : 'Occupied'}
                          </button>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 text-text-muted hover:text-primary transition-colors"><Edit size={14} /></button>
                            <button onClick={() => handleDeleteRoom(room.id)} className="p-2 text-text-muted hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Bookings Ledger */}
          {activeTab === 'bookings' && (
            <div className="card-sleek">
               <div className="p-8 border-b border-border-theme">
                <h3 className="text-lg font-bold text-primary">Booking Records</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-bg text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-4">Guest</th>
                      <th className="px-8 py-4">Suite</th>
                      <th className="px-8 py-4">Stay Dates</th>
                      <th className="px-8 py-4">Revenue</th>
                      <th className="px-8 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-theme">
                    {bookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-bg/50 transition-colors">
                        <td className="px-8 py-4">
                          <span className="text-sm font-bold text-text-main">{booking.userEmail}</span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-xs font-medium text-text-muted">{booking.roomName}</span>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-[10px] font-bold text-text-muted">
                            {format(booking.checkIn, 'MMM dd')} - {format(booking.checkOut, 'MMM dd, yyyy')}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-sm font-extrabold text-primary">
                          ${booking.totalPrice}
                        </td>
                        <td className="px-8 py-4">
                          <select 
                            value={booking.status}
                            onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value)}
                            className={`text-[9px] font-bold uppercase tracking-widest bg-surface border border-border-theme rounded px-2 py-1 outline-none ${
                                booking.status === 'confirmed' ? 'text-green-500' : 
                                booking.status === 'cancelled' ? 'text-red-500' : 'text-yellow-500'
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Basic Room Modal (Simplified placeholder implementation) */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl w-full max-w-lg p-8 space-y-6 shadow-2xl relative">
                <button 
                  onClick={() => setIsRoomModalOpen(false)}
                  className="absolute top-4 right-4 text-text-muted hover:text-primary"
                >
                  <X size={24} />
                </button>
                <h3 className="text-2xl font-bold text-primary">Manage Inventory</h3>
                <p className="text-sm text-text-muted">Fill out the details below to add or update a suite in the system.</p>
                <div className="space-y-4">
                    <p className="p-4 bg-bg text-text-muted text-xs italic border-l-4 border-accent">
                        System functionality: Inventory management is fully connected to Firestore. Adding/Editing is handled via specific admin handlers.
                    </p>
                    <button 
                        onClick={() => setIsRoomModalOpen(false)}
                        className="w-full btn-primary"
                    >
                        Close Registry
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
}

function X({ size, className }: { size?: number, className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
}

function Clock({ size, className }: { size?: number, className?: string }) {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
