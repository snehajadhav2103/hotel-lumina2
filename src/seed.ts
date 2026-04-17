import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

const SAMPLE_ROOMS = [
  {
    name: "Ocean Deluxe Suite",
    description: "Experience the ultimate in luxury with panoramic views of the turquoise waters. This signature suite features a private balcony, floor-to-ceiling windows, and artisanal decor.",
    pricePerNight: 450,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1000",
    type: "Deluxe",
    capacity: 2,
    amenities: ["Ocean View", "Mini Bar", "King Bed", "Private Balcony", "Smart TV"],
    isAvailable: true,
  },
  {
    name: "Premier Garden Loft",
    description: "A serene escape nestled within our lush botanical gardens. Spacious two-level living area with contemporary furniture and a deep-soaking Japanese tub.",
    pricePerNight: 290,
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1000",
    type: "Standard",
    capacity: 2,
    amenities: ["Garden Access", "Kitchenette", "Queen Bed", "Work Desk", "Espresso Machine"],
    isAvailable: true,
  },
  {
    name: "The Royal Penthouse",
    description: "The pinnacle of Lumiere hospitality. Occupying the entire top floor, featuring a private infinity pool, cinema room, and dedicated butler service.",
    pricePerNight: 2200,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1000",
    type: "Penthouse",
    capacity: 4,
    amenities: ["Private Pool", "Butler Service", "Cinema Room", "Wine Cellar", "Helipad Access"],
    isAvailable: true,
  },
  {
    name: "Skyline Executive Studio",
    description: "Modern minimalism meeting urban luxury. Overlooking the city skyline, this studio is perfect for the sophisticated traveler seeking comfort and class.",
    pricePerNight: 350,
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=1000",
    type: "Suite",
    capacity: 2,
    amenities: ["City View", "High-speed WiFi", "King Bed", "Rain Shower", "Executive Lounge Access"],
    isAvailable: true,
  }
];

export async function seedRoomsIfEmpty() {
  try {
    const roomsCol = collection(db, 'rooms');
    const snapshot = await getDocs(roomsCol);
    
    if (snapshot.empty) {
      console.log('Seeding initial rooms...');
      // Note: This will only succeed if the user is an admin
      for (const room of SAMPLE_ROOMS) {
        await addDoc(roomsCol, {
          ...room,
          createdAt: serverTimestamp()
        });
      }
      console.log('Successfully seeded rooms.');
    }
  } catch (error: any) {
    if (error?.code === 'permission-denied' || error?.message?.includes('permission-denied')) {
      console.log('Seed skipped: Missing permissions (normal user)');
    } else {
      console.error('Seed error:', error);
    }
  }
}
