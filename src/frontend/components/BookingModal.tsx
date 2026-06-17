'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBooking } from '@/frontend/context/BookingContext';
import { X, Calendar, Clock, CheckCircle } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string | null;
}

export default function BookingModal({ isOpen, onClose, tableId }: BookingModalProps) {
  const { bookTable, isTableBooked } = useBooking();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('12:00');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const menuItems = [
    { id: 'item_1', name: 'Scarlet Aero Blend', price: 6.50 },
    { id: 'item_2', name: 'Double Apex Espresso', price: 4.50 },
    { id: 'item_3', name: 'Carbon Stealth Roast', price: 7.00 },
    { id: 'item_4', name: 'Pit Stop Pastry', price: 5.50 },
  ];

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]
    );
  };

  const handleBook = () => {
    if (!tableId) return;
    
    if (isTableBooked(tableId, date, time)) {
      alert('This table is already booked for this time slot.');
      return;
    }

    bookTable(tableId, date, time, selectedItems);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass rounded-3xl border border-white/10 p-8 bg-black/90 shadow-[0_0_50px_rgba(225,6,0,0.2)]"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                <h2 className="font-orbitron text-2xl font-black text-white uppercase mb-2">Booking Confirmed</h2>
                <p className="text-white/70">Your table ({tableId}) has been reserved.</p>
              </div>
            ) : (
              <>
                <h2 className="font-orbitron text-2xl font-black text-white uppercase mb-2">Reserve Table</h2>
                <p className="text-white/50 text-sm mb-6 font-mono border-b border-white/10 pb-4">ID: {tableId}</p>

                <div className="space-y-4 mb-8">
                  <div>
                    <label className="block text-xs font-orbitron tracking-widest text-white/70 uppercase mb-2">Date</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-racing-red transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-orbitron tracking-widest text-white/70 uppercase mb-2">Time Slot</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-racing-red transition-colors appearance-none"
                      >
                        <option value="10:00">10:00 AM</option>
                        <option value="12:00">12:00 PM</option>
                        <option value="14:00">2:00 PM</option>
                        <option value="16:00">4:00 PM</option>
                        <option value="18:00">6:00 PM</option>
                        <option value="20:00">8:00 PM</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-orbitron tracking-widest text-white/70 uppercase mb-2">Pre-Order Fuel (Optional)</label>
                    <div className="space-y-2">
                      {menuItems.map(item => (
                        <div 
                          key={item.id}
                          onClick={() => handleItemToggle(item.id)}
                          className={`flex justify-between items-center p-3 rounded-xl border cursor-pointer transition-colors ${selectedItems.includes(item.id) ? 'border-racing-red bg-racing-red/10' : 'border-white/10 bg-white/5 hover:border-white/30'}`}
                        >
                          <span className="font-mono text-xs text-white">{item.name}</span>
                          <span className="font-orbitron font-bold text-white text-xs">€{item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  className="w-full bg-racing-red hover:bg-red-700 text-white font-orbitron font-bold uppercase tracking-widest py-4 rounded-xl transition-colors shadow-[0_0_20px_rgba(225,6,0,0.4)]"
                >
                  Confirm Reservation
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
