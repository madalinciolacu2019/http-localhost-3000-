'use client';

import { SoundProvider } from "@/context/SoundContext";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import CartDrawer from "@/components/CartDrawer";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <UIProvider>
        <SoundProvider>
          <CartProvider>
            <CartDrawer />
            {children}
          </CartProvider>
        </SoundProvider>
      </UIProvider>
    </AuthProvider>
  );
}
