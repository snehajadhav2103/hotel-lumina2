export type UserRole = 'admin' | 'user';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: Date;
}

export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Penthouse';

export interface Room {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  image: string;
  type: RoomType;
  capacity: number;
  amenities: string[];
  isAvailable: boolean;
  createdAt: Date;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  userId: string;
  userEmail: string;
  roomId: string;
  roomName: string;
  checkIn: Date;
  checkOut: Date;
  status: BookingStatus;
  totalPrice: number;
  createdAt: Date;
}
