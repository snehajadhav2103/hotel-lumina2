import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Room, RoomType } from '../types';
import { RoomCard } from '../components/RoomCard';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<RoomType | 'All'>('All');

  useEffect(() => {
    async function fetchRooms() {
      try {
        const q = query(collection(db, 'rooms'), orderBy('pricePerNight', 'asc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Room[];
        setRooms(data);
        setFilteredRooms(data);
      } catch (err) {
        console.error('Error fetching rooms:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  useEffect(() => {
    let result = rooms;
    if (searchTerm) {
      result = result.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (typeFilter !== 'All') {
      result = result.filter(r => r.type === typeFilter);
    }
    setFilteredRooms(result);
  }, [searchTerm, typeFilter, rooms]);

  return (
    <div className="container mx-auto px-10 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-primary mb-2">Available Suites</h1>
          <p className="text-text-muted font-medium">Find the perfect space for your next stay.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10 w-64 h-11"
            />
          </div>
          
          <div className="relative group">
            <div className="flex items-center gap-2 h-11 px-4 border border-border-theme rounded-md bg-surface cursor-pointer text-sm font-semibold text-text-main">
              <SlidersHorizontal size={16} />
              Category: {typeFilter}
            </div>
            <div className="absolute top-12 right-0 w-48 bg-surface rounded-lg shadow-theme border border-border-theme overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              {['All', 'Standard', 'Deluxe', 'Suite', 'Penthouse'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type as any)}
                  className={`w-full px-4 py-2 text-left text-xs font-medium hover:bg-bg ${typeFilter === type ? 'text-accent bg-primary/5' : 'text-text-main'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-[400px] bg-border-theme/50 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <div key={room.id}>
              <RoomCard room={room} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="text-xl font-bold text-primary mb-2">No rooms found</p>
          <p className="text-text-muted">Try adjusting your search or filters.</p>
          <button 
            onClick={() => { setSearchTerm(''); setTypeFilter('All'); }}
            className="mt-6 text-accent font-bold underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
