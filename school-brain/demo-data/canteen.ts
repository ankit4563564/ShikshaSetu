import type { CanteenMenuItem } from '../models/index';

export const DEMO_CANTEEN_MENU: CanteenMenuItem[] = [
  {
    day: 'Monday',
    category: 'Lunch',
    items: ['Rajma Chawal', 'Paneer Butter Masala', 'Steamed Rice', 'Tandoori Roti', 'Green Salad'],
    specialItem: 'Mango Lassi & Gulab Jamun',
  },
  {
    day: 'Tuesday',
    category: 'Lunch',
    items: ['Chole Bhature', 'Mixed Vegetable Curry', 'Jeera Rice', 'Butter Naan', 'Boonde Raita'],
    specialItem: 'Cold Coffee & Brownie',
  },
  {
    day: 'Wednesday', // Today! (2026-07-22)
    category: 'Lunch',
    items: ['Dal Makhani', 'Shahi Paneer', 'Veg Pulao', 'Wheat Chapati', 'Cucumber Raita'],
    specialItem: 'Fresh Watermelon Juice & Rasgulla',
  },
  {
    day: 'Thursday', // Tomorrow!
    category: 'Lunch',
    items: ['Kadhi Pakoda', 'Aloo Gobi', 'Steamed Basmati Rice', 'Phulka', 'Salad'],
    specialItem: 'Badam Milk & Ice Cream Cup',
  },
  {
    day: 'Friday',
    category: 'Lunch',
    items: ['Pav Bhaji', 'Veg Biryani with Mirchi Salan', 'Paneer Tikka Roll', 'Curd Rice'],
    specialItem: 'Chocolate Milkshake & Moong Dal Halwa',
  },
];

export function getTodayCanteenMenu(dayName: string = 'Wednesday'): CanteenMenuItem {
  return DEMO_CANTEEN_MENU.find(m => m.day.toLowerCase() === dayName.toLowerCase()) || DEMO_CANTEEN_MENU[2];
}
