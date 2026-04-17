import React, { useEffect, useState } from 'react';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Room } from '../types';
import { RoomCard } from '../components/RoomCard';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  const [featuredRooms, setFeaturedRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const q = query(
          collection(db, 'rooms'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const rooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as Room[];
        setFeaturedRooms(rooms);
      } catch (err) {
        console.error('Error fetching featured rooms:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-primary/40 z-10" />
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury Resort"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse-slow"
        />
        <div className="container mx-auto px-10 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="text-accent font-bold uppercase tracking-[0.3em] text-xs mb-4 block">
              Escape to Excellence
            </span>
            <h1 className="text-6xl font-extrabold text-white leading-[1.1] mb-6">
              Modern Elegance <br /> In Every Detail.
            </h1>
            <p className="text-white/80 text-lg mb-10 leading-relaxed font-medium">
              Discover a sanctuary of sophisticated luxury at Lumiere. Our curated collections offer unrivaled comfort and world-class hospitality for the modern traveler.
            </p>
            <div className="flex gap-4">
              <Link to="/rooms" className="btn-accent px-8 py-4 flex items-center gap-2">
                Explore Our Suites <ArrowRight size={18} />
              </Link>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-lg font-bold hover:bg-white/20 transition-all">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Trust Bar */}
      <section className="container mx-auto px-10">
        <div className="bg-surface border border-border-theme shadow-theme rounded-2xl p-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Member Rating', value: '4.9/5', icon: Star },
            { label: 'Secure Payments', value: '100%', icon: ShieldCheck },
            { label: 'Global Locations', value: '24+', icon: MapPin },
            { label: 'Verified Suites', value: '120+', icon: ShieldCheck },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center md:items-start space-y-2">
              <div className="p-2 bg-primary/5 rounded-lg text-primary">
                <stat.icon size={20} />
              </div>
              <p className="text-2xl font-extrabold text-primary">{stat.value}</p>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="container mx-auto px-10 space-y-10">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-primary tracking-tight">Our Signature Suites</h2>
            <p className="text-text-muted font-medium">Carefully selected accommodations for your ultimate comfort.</p>
          </div>
          <Link to="/rooms" className="text-primary font-bold hover:text-accent flex items-center gap-2 transition-colors">
            View All Rooms <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[400px] bg-border-theme/50 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredRooms.map((room) => (
              <div key={room.id}>
                <RoomCard room={room} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
