import React, { useState } from 'react';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { Room } from '../types';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

interface BookingWidgetProps {
  room: Room;
}

export function BookingWidget({ room }: BookingWidgetProps) {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nights = Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)));
  const total = nights * room.pricePerNight;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      login();
      return;
    }

    if (nights <= 0) {
      setError('Checkout must be after check-in');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bookingData = {
        userId: user.uid,
        userEmail: user.email,
        roomId: room.id,
        roomName: room.name,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        status: 'pending',
        totalPrice: total,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);

      // Trigger Email Confirmation (Asynchronous)
      fetch('/api/bookings/confirm-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          roomName: room.name,
          checkIn: format(new Date(checkIn), 'MMM dd, yyyy'),
          checkOut: format(new Date(checkOut), 'MMM dd, yyyy'),
          totalPrice: total,
          status: 'pending',
          bookingId: docRef.id
        }),
      }).catch(err => console.error('Email trigger failed:', err));

      navigate('/dashboard', { state: { bookingSuccess: true } });
    } catch (err: any) {
      console.error('Booking error:', err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="widget bg-surface p-6 rounded-xl border border-border-theme shadow-theme">
      <h3 className="text-lg font-bold text-primary mb-6">Quick Booking</h3>
      <form onSubmit={handleBooking} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Check-in</label>
          <input
            type="date"
            min={format(new Date(), 'yyyy-MM-dd')}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Check-out</label>
          <input
            type="date"
            min={format(addDays(new Date(checkIn), 1), 'yyyy-MM-dd')}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            className="form-input"
            required
          />
        </div>
        
        {nights > 0 && (
          <div className="bg-bg p-4 rounded-lg space-y-2 mt-4">
            <div className="flex justify-between text-xs text-text-muted">
              <span>{nights} nights x ${room.pricePerNight}</span>
              <span>${total}</span>
            </div>
            <div className="border-t border-border-theme pt-2 flex justify-between font-bold text-primary">
              <span>Total cost</span>
              <span>${total}</span>
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading || !room.isAvailable}
          className="w-full btn-accent mt-4 disabled:opacity-50"
        >
          {loading ? 'Processing...' : room.isAvailable ? 'Confirm Booking' : 'Room Occupied'}
        </button>
      </form>
    </div>
  );
}
