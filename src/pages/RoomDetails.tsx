import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Room } from '../types';
import { BookingWidget } from '../components/BookingWidget';
import { Check, ArrowLeft, Wifi, Tv, Coffee, Wind, Utensils, Star, ShieldCheck } from 'lucide-react';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Ocean View': <Wifi size={16} />,
  'King Bed': <Coffee size={16} />,
  'Private Balcony': <Check size={16} />,
  'Smart TV': <Tv size={16} />,
  'Kitchenette': <Utensils size={16} />,
  'Rain Shower': <Wind size={16} />,
};

export default function RoomDetails() {
  const { id } = useParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRoom() {
      if (!id) return;
      try {
        const docRef = doc(db, 'rooms', id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setRoom({
            id: snapshot.id,
            ...snapshot.data(),
            createdAt: snapshot.data().createdAt?.toDate() || new Date(),
          } as Room);
        }
      } catch (err) {
        console.error('Error fetching room:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-10 py-12 animate-pulse">
        <div className="h-[400px] bg-border-theme rounded-2xl mb-10" />
        <div className="grid grid-cols-3 gap-10">
          <div className="col-span-2 space-y-6">
            <div className="h-10 bg-border-theme w-1/2 rounded" />
            <div className="h-32 bg-border-theme rounded" />
          </div>
          <div className="h-64 bg-border-theme rounded-xl" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto px-10 py-24 text-center">
        <h2 className="text-2xl font-bold text-primary mb-4">Room Not Found</h2>
        <Link to="/rooms" className="text-accent font-bold underline">Back to all rooms</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-10 py-12">
      <Link to="/rooms" className="inline-flex items-center gap-2 text-sm font-bold text-text-muted hover:text-primary transition-colors mb-8">
        <ArrowLeft size={16} /> Back to Rooms
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-10">
          <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-theme">
            <img
              src={room.image}
              alt={room.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-6 left-6 space-x-2">
              <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold text-primary uppercase tracking-widest">
                {room.type} Series
              </span>
              <span className={cn(
                "px-4 py-1.5 rounded-full text-xs font-bold text-white uppercase tracking-widest",
                room.isAvailable ? "bg-green-500" : "bg-red-500"
              )}>
                {room.isAvailable ? 'Available' : 'Occupied'}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-extrabold text-primary mb-2 tracking-tight">{room.name}</h1>
                <p className="text-text-muted font-medium flex items-center gap-2">
                  <Star size={16} className="text-yellow-400 fill-current" />
                  4.9 Guest Rating • {room.capacity} Guests Max
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-extrabold text-primary">${room.pricePerNight}</p>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider">Per Night</p>
              </div>
            </div>

            <hr className="border-border-theme" />

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary">About the Suite</h2>
              <p className="text-text-muted leading-relaxed font-medium">
                {room.description}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-primary">Amenities & Features</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {room.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg bg-bg border border-border-theme">
                    <div className="text-primary">
                      {AMENITY_ICONS[amenity] || <Check size={16} />}
                    </div>
                    <span className="text-sm font-semibold text-text-main">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 self-start sticky top-[112px]">
          <BookingWidget room={room} />
          
          <div className="mt-8 p-6 bg-primary rounded-xl text-white space-y-4">
            <h4 className="font-bold flex items-center gap-2">
              <ShieldCheck size={20} className="text-accent" />
              Lumiere Safe Stay
            </h4>
            <p className="text-xs opacity-80 leading-relaxed font-medium">
              Your safety is our priority. Every suite undergoes a rigorous 24-point professional cleaning process between stays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
