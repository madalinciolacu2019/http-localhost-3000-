'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart, Product } from '@/context/CartContext';
import { useSound } from '@/context/SoundContext';

const SECRET_MENU: Record<string, Product> = {
  'SYS-01': {
    id: 991,
    name: 'V12 Turbo Roast',
    category: 'Secret Menu',
    price: 12.00,
    image: '',
    description: 'Ultra-caffeinated triple ristretto infused with raw telemetry data.',
    stats: { intensity: 'High', heat: 'Hot' },
    color: '#E10600'
  },
  'SYS-02': {
    id: 992,
    name: 'Carbon Ceramic Brownie',
    category: 'Secret Menu',
    price: 8.50,
    image: '',
    description: 'Dark cocoa brownie with a charcoal infused crust.',
    stats: { intensity: 'Medium', heat: 'N/A' },
    color: '#38383F'
  },
  'SYS-03': {
    id: 993,
    name: 'Telemetry Fuel Cell',
    category: 'Secret Menu',
    price: 15.00,
    image: '',
    description: '1L insulated pouch of cold brew. Pure endurance.',
    stats: { intensity: 'Max', heat: 'Cold' },
    color: '#007FFF'
  }
};

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TerminalModal({ isOpen, onClose }: TerminalModalProps) {
  const { playSound } = useSound();
  const { addItem, openCart } = useCart();
  const [history, setHistory] = useState<string[]>([
    'APEX_OS v1.0.4',
    'SECURE CONNECTION ESTABLISHED',
    'Type "help" for a list of commands.'
  ]);
  const [input, setInput] = useState('');
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    playSound('click');
    const cmdStr = input.trim();
    const args = cmdStr.split(' ');
    const cmd = args[0].toLowerCase();
    
    let response: string | string[] = '';

    switch (cmd) {
      case 'help':
        response = [
          'AVAILABLE COMMANDS:',
          '  scan           - Scan the network for encrypted files',
          '  decrypt <id>   - Attempt to decrypt an item ID',
          '  order <id>     - Inject item directly into the active cart session',
          '  clear          - Clear terminal output',
          '  exit           - Disconnect from APEX_OS'
        ];
        break;
      case 'scan':
        response = [
          'Scanning network...',
          '[WARNING] Encrypted datalogs found:',
          '  - SYS-01',
          '  - SYS-02',
          '  - SYS-03',
          'Use decrypt <id> to reveal.'
        ];
        break;
      case 'decrypt':
        if (!args[1]) {
          response = 'Error: Missing target ID. Syntax: decrypt <id>';
        } else {
          const target = args[1].toUpperCase();
          if (SECRET_MENU[target]) {
            if (unlockedItems.includes(target)) {
              response = `[SYS] ${target} already decrypted.`;
            } else {
              setUnlockedItems(prev => [...prev, target]);
              response = `[SUCCESS] ${target} decrypted: ${SECRET_MENU[target].name} - ${SECRET_MENU[target].description}`;
              playSound('success');
            }
          } else {
            response = `[FAIL] Target ID ${target} not found on the network.`;
            playSound('error');
          }
        }
        break;
      case 'order':
        if (!args[1]) {
          response = 'Error: Missing target ID. Syntax: order <id>';
        } else {
          const target = args[1].toUpperCase();
          if (SECRET_MENU[target]) {
            if (unlockedItems.includes(target)) {
              addItem(SECRET_MENU[target]);
              response = `[CART INJECTION] ${SECRET_MENU[target].name} successfully routed to your session cart.`;
              openCart();
              playSound('gear-shift');
            } else {
              response = `[LOCKED] Target ID ${target} must be decrypted before ordering.`;
              playSound('error');
            }
          } else {
            response = `[FAIL] Target ID ${target} not found on the network.`;
            playSound('error');
          }
        }
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'exit':
        onClose();
        setInput('');
        return;
      default:
        response = `Command not recognized: ${cmd}. Type "help" for a list of commands.`;
        playSound('error');
    }

    setHistory(prev => [
      ...prev,
      `> ${cmdStr}`,
      ...(Array.isArray(response) ? response : [response])
    ]);
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl h-[600px] border border-green-500/30 bg-black/90 shadow-[0_0_50px_rgba(34,197,94,0.15)] flex flex-col font-mono rounded-lg overflow-hidden"
          >
            {/* Terminal Header */}
            <div className="bg-green-900/20 border-b border-green-500/30 px-4 py-2 flex items-center justify-between">
              <span className="text-green-500 text-xs font-bold uppercase tracking-widest">root@apex-paddock-node:~</span>
              <button onClick={onClose} className="text-green-500/50 hover:text-green-500 transition-colors">
                [X]
              </button>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 overflow-y-auto p-4 text-green-500/80 text-sm space-y-2" onClick={() => inputRef.current?.focus()}>
              {history.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap">{line}</div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Terminal Input */}
            <form onSubmit={handleCommand} className="border-t border-green-500/30 bg-black p-4 flex">
              <span className="text-green-500 mr-2">{'>'}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent text-green-500 focus:outline-none placeholder-green-900"
                autoComplete="off"
                spellCheck="false"
                autoFocus
              />
            </form>

            {/* CRT Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFElEQVQIW2NkYGD4z8DAwMgAI0AMDA4FAQLXfAAAAABJRU5ErkJggg==')] opacity-10" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
