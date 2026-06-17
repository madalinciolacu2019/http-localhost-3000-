import { products } from './products';

const F1_NAMES = [
  'lando.norris@mclaren.f1',
  'max.verstappen@redbull.f1',
  'charles.leclerc@ferrari.f1',
  'lewis.hamilton@mercedes.f1',
  'carlos.sainz@ferrari.f1',
  'george.russell@mercedes.f1',
  'oscar.piastri@mclaren.f1',
  'fernando.alonso@astonmartin.f1',
  'alex.albon@williams.f1',
  'yuki.tsunoda@visacashapp.f1'
];

export function generateBotOrder() {
  if (typeof window === 'undefined') return;

  const randomOrderId = 'bot_' + Math.random().toString(36).slice(2, 10).toUpperCase();
  
  // Pick 1-3 random products
  const numItems = Math.floor(Math.random() * 3) + 1;
  const demoItems = [];
  let total = 0;
  
  for (let i = 0; i < numItems; i++) {
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const qty = Math.floor(Math.random() * 2) + 1; // 1 or 2
    demoItems.push({
      product_id: randomProduct.id,
      product_name: randomProduct.name,
      quantity: qty,
      price: randomProduct.price
    });
    total += randomProduct.price * qty;
  }
  
  const customerEmail = F1_NAMES[Math.floor(Math.random() * F1_NAMES.length)];
  
  const mockOrder = {
    id: randomOrderId,
    ref: randomOrderId.replace('bot_', ''),
    total: total,
    currency: 'EUR',
    items: demoItems,
    customerEmail,
    created: Math.floor(Date.now() / 1000),
    isDemo: true,
    isBot: true
  };

  localStorage.setItem(`order_${randomOrderId}`, JSON.stringify(mockOrder));
  localStorage.setItem(`status_${randomOrderId}`, 'pending');
  
  // Dispatch a storage event manually so other tabs/components might pick it up
  window.dispatchEvent(new Event('storage'));
}

export function processBotOrders() {
  if (typeof window === 'undefined') return;

  const now = Math.floor(Date.now() / 1000);
  let updated = false;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('order_')) {
      const orderId = key.replace('order_', '');
      const statusKey = `status_${orderId}`;
      const status = localStorage.getItem(statusKey);
      
      const orderDataStr = localStorage.getItem(key);
      if (!orderDataStr) continue;
      
      try {
        const orderData = JSON.parse(orderDataStr);
        // Only process bot orders automatically
        if (!orderData.isBot) continue;

        const age = now - orderData.created;

        if (status === 'pending' && age > 5) {
          // Employee bot starts preparing after 5 seconds
          localStorage.setItem(statusKey, 'preparing');
          updated = true;
        } else if (status === 'preparing' && age > 15) {
          // Employee bot completes the order after 15 seconds
          localStorage.setItem(statusKey, 'completed');
          updated = true;
        } else if (status === 'completed' && age > 30) {
          // Archive after 30 seconds to clean up
          localStorage.setItem(statusKey, 'archived');
          updated = true;
        }
      } catch (e) {
        // ignore parse error
      }
    }
  }

  if (updated) {
    window.dispatchEvent(new Event('storage'));
  }
}
