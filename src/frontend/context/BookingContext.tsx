'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Booking {
  id: string;
  tableId: string;
  userId: string;
  date: string;
  timeSlot: string;
  preOrderItems?: string[];
}

interface BookingContextType {
  bookings: Booking[];
  bookTable: (tableId: string, date: string, timeSlot: string, preOrderItems?: string[]) => void;
  isTableBooked: (tableId: string, date: string, timeSlot: string) => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('apex_table_bookings');
    if (saved) {
      try {
        setBookings(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing bookings from localStorage");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('apex_table_bookings', JSON.stringify(bookings));
  }, [bookings]);

  const bookTable = (tableId: string, date: string, timeSlot: string, preOrderItems: string[] = []) => {
    const newBooking: Booking = {
      id: Math.random().toString(36).substring(2, 9),
      tableId,
      userId: user?.id || 'guest',
      date,
      timeSlot,
      preOrderItems,
    };
    setBookings((prev) => [...prev, newBooking]);
  };

  const isTableBooked = (tableId: string, date: string, timeSlot: string) => {
    return bookings.some(
      (b) => b.tableId === tableId && b.date === date && b.timeSlot === timeSlot
    );
  };

  return (
    <BookingContext.Provider value={{ bookings, bookTable, isTableBooked }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}
