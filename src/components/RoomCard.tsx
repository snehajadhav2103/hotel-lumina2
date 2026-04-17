import React from 'react';
import { Room } from '../types';
import { Link } from 'react-router-dom';

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="card-sleek group">
      <div className="h-[200px] bg-border-theme relative overflow-hidden">
        <img
          src={room.image}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {!room.isAvailable && (
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Currently Occupied
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] uppercase font-bold text-accent tracking-widest">
            {room.type} Series
          </span>
          <span className="text-xs text-text-muted">
            Up to {room.capacity} Guests
          </span>
        </div>
        <h3 className="text-lg font-bold text-text-main mb-3 line-clamp-1">{room.name}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {room.amenities.slice(0, 3).map((amenity) => (
            <span key={amenity} className="text-[9px] bg-bg px-2 py-0.5 rounded text-text-muted font-medium">
              {amenity}
            </span>
          ))}
          {room.amenities.length > 3 && (
            <span className="text-[9px] bg-bg px-2 py-0.5 rounded text-text-muted font-medium">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="text-xl font-extrabold text-primary">
            ${room.pricePerNight} <span className="text-xs font-normal text-text-muted">/ night</span>
          </div>
          <Link
            to={`/rooms/${room.id}`}
            className="text-xs font-bold text-primary hover:text-accent transition-colors"
          >
            Details →
          </Link>
        </div>
        <Link
          to={room.isAvailable ? `/rooms/${room.id}` : '#'}
          className={`w-full btn-primary block text-center mt-5 text-sm ${!room.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {room.isAvailable ? 'Reserve Now' : 'Not Available'}
        </Link>
      </div>
    </div>
  );
}
