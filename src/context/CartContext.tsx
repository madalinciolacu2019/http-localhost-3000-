'use client';

import React, { createContext, useContext, useEffect, useReducer } from 'react';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  stats: { intensity: string; heat: string };
  color: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  isSubscription?: boolean;
  eventDate?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product; size?: string; isSubscription?: boolean; eventDate?: string }
  | { type: 'REMOVE_ITEM'; productId: number; size?: string; isSubscription?: boolean; eventDate?: string }
  | { type: 'UPDATE_QUANTITY'; productId: number; quantity: number; size?: string; isSubscription?: boolean; eventDate?: string }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'HYDRATE'; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'HYDRATE': {
      const merged: CartItem[] = [];
      action.items.forEach(item => {
        const size = item.size || undefined;
        const isSub = !!item.isSubscription;
        const eventDate = item.eventDate || undefined;
        
        const existing = merged.find(i => 
          String(i.product.id) === String(item.product.id) && 
          (i.size || undefined) === size && 
          !!i.isSubscription === isSub && 
          (i.eventDate || undefined) === eventDate
        );
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          merged.push({
            ...item,
            size,
            isSubscription: isSub,
            eventDate
          });
        }
      });
      return { ...state, items: merged };
    }
    case 'ADD_ITEM': {
      const size = action.size || undefined;
      const isSub = !!action.isSubscription;
      const eventDate = action.eventDate || undefined;
      
      const existing = state.items.find(i => 
        String(i.product.id) === String(action.product.id) && 
        (i.size || undefined) === size && 
        !!i.isSubscription === isSub && 
        (i.eventDate || undefined) === eventDate
      );
      
      const newItems = existing
        ? state.items.map(i =>
            (String(i.product.id) === String(action.product.id) && 
             (i.size || undefined) === size && 
             !!i.isSubscription === isSub && 
             (i.eventDate || undefined) === eventDate)
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...state.items, { product: action.product, quantity: 1, size, isSubscription: isSub, eventDate }];
      return { ...state, items: newItems };
    }
    case 'REMOVE_ITEM': {
      const size = action.size || undefined;
      const isSub = !!action.isSubscription;
      const eventDate = action.eventDate || undefined;
      return { 
        ...state, 
        items: state.items.filter(i => 
          !(String(i.product.id) === String(action.productId) && 
            (i.size || undefined) === size && 
            !!i.isSubscription === isSub && 
            (i.eventDate || undefined) === eventDate)
        ) 
      };
    }
    case 'UPDATE_QUANTITY': {
      const size = action.size || undefined;
      const isSub = !!action.isSubscription;
      const eventDate = action.eventDate || undefined;
      
      if (action.quantity <= 0) {
        return { 
          ...state, 
          items: state.items.filter(i => 
            !(String(i.product.id) === String(action.productId) && 
              (i.size || undefined) === size && 
              !!i.isSubscription === isSub && 
              (i.eventDate || undefined) === eventDate)
          ) 
        };
      }
      return {
        ...state,
        items: state.items.map(i =>
          (String(i.product.id) === String(action.productId) && 
           (i.size || undefined) === size && 
           !!i.isSubscription === isSub && 
           (i.eventDate || undefined) === eventDate) 
            ? { ...i, quantity: action.quantity } 
            : i
        ),
      };
    }
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    default:
      return state;
  }
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotal: number;
  bundleDiscount: number;
  weatherDiscount: number;
  weatherCondition: string | null;
  couponDiscount: number;
  appliedCoupon: string | null;
  totalPrice: number;
  addItem: (product: Product, size?: string, isSubscription?: boolean, eventDate?: string) => void;
  removeItem: (productId: number, size?: string, isSubscription?: boolean, eventDate?: string) => void;
  updateQuantity: (productId: number, quantity: number, size?: string, isSubscription?: boolean, eventDate?: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'apex-brews-cart';
const COUPON_STORAGE_KEY = 'apex-brews-coupon';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const [appliedCoupon, setAppliedCoupon] = React.useState<string | null>(null);
  const [couponDiscountRate, setCouponDiscountRate] = React.useState<number>(0);
  const [weatherCondition, setWeatherCondition] = React.useState<string | null>(null);
  const [weatherDiscountRate, setWeatherDiscountRate] = React.useState<number>(0);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items = JSON.parse(stored) as CartItem[];
        dispatch({ type: 'HYDRATE', items });
      }
      
      const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      const storedRate = localStorage.getItem('apex-brews-coupon-rate');
      if (storedCoupon) {
        setAppliedCoupon(storedCoupon);
        setCouponDiscountRate(storedRate ? parseFloat(storedRate) : 0);
      }
    } catch {
      // ignore
    }

    // Fetch dynamic weather discount
    const fetchWeather = async () => {
      try {
        const res = await fetch('/api/track-weather');
        const data = await res.json();
        if (data.discountActive) {
          setWeatherCondition(data.condition);
          setWeatherDiscountRate(data.discountPercentage / 100);
        }
      } catch {
        // ignore
      }
    };
    fetchWeather();
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      // ignore
    }
  }, [state.items]);

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data.code);
        setCouponDiscountRate(data.discountRate || 0);
        localStorage.setItem(COUPON_STORAGE_KEY, data.code);
        localStorage.setItem('apex-brews-coupon-rate', String(data.discountRate || 0));
        return true;
      }
    } catch {
      // Network error — fail silently
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountRate(0);
    localStorage.removeItem(COUPON_STORAGE_KEY);
    localStorage.removeItem('apex-brews-coupon-rate');
  };

  const totalItems = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  
  // Bundle Discount: 10% off if cart has both coffee and merch
  const hasCoffee = state.items.some(i => ['Espresso', 'Milk Based', 'Iced'].includes(i.product.category));
  const hasMerch = state.items.some(i => i.product.category === 'Merchandise');
  const bundleDiscount = (hasCoffee && hasMerch) ? subtotal * 0.10 : 0;
  
  const weatherDiscount = (subtotal - bundleDiscount) * weatherDiscountRate;
  const couponDiscount = (subtotal - bundleDiscount - weatherDiscount) * couponDiscountRate;
  const totalPrice = Math.max(0, subtotal - bundleDiscount - weatherDiscount - couponDiscount);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        totalItems,
        subtotal,
        bundleDiscount,
        weatherDiscount,
        weatherCondition,
        couponDiscount,
        appliedCoupon,
        totalPrice,
        addItem: (product, size, isSubscription, eventDate) => dispatch({ type: 'ADD_ITEM', product, size, isSubscription, eventDate }),
        removeItem: (productId, size, isSubscription, eventDate) => dispatch({ type: 'REMOVE_ITEM', productId, size, isSubscription, eventDate }),
        updateQuantity: (productId: number, quantity: number, size?: string, isSubscription?: boolean, eventDate?: string) => dispatch({ type: 'UPDATE_QUANTITY', productId, quantity, size, isSubscription, eventDate }),
        clearCart: () => dispatch({ type: 'CLEAR_CART' }),
        openCart: () => dispatch({ type: 'OPEN_CART' }),
        closeCart: () => dispatch({ type: 'CLOSE_CART' }),
        toggleCart: () => dispatch({ type: 'TOGGLE_CART' }),
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
