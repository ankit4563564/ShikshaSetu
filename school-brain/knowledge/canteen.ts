export interface CanteenMeal {
  type: string;
  items: string[];
  price: string;
}

export interface CanteenDayMenu {
  dayOfWeek: number;
  meals: CanteenMeal[];
}

export interface CanteenSpecial {
  dayOfWeek: number;
  name: string;
  description: string;
  item: string;
  price: string;
}

export const CANTEEN_MENU: CanteenDayMenu[] = [
  {
    dayOfWeek: 1,
    meals: [
      {
        type: 'Breakfast',
        items: ['Poha', 'Boiled Eggs', 'Bread Butter', 'Tea / Coffee'],
        price: '₹25',
      },
      {
        type: 'Snack',
        items: ['Samosa (2 pcs)', 'Chai', 'Biscuits'],
        price: '₹20',
      },
      {
        type: 'Lunch',
        items: [
          'Jeera Rice',
          'Dal Fry',
          'Aloo Gobi',
          'Salad',
          'Curd',
          'Roti (2 pcs)',
        ],
        price: '₹55',
      },
    ],
  },
  {
    dayOfWeek: 2,
    meals: [
      {
        type: 'Breakfast',
        items: ['Upma', 'Vada (2 pcs)', 'Coconut Chutney', 'Tea / Coffee'],
        price: '₹25',
      },
      {
        type: 'Snack',
        items: ['Vada Pav', 'Green Chutney', 'Chai'],
        price: '₹20',
      },
      {
        type: 'Lunch',
        items: [
          'Steamed Rice',
          'Sambar',
          'Bhindi Masala',
          'Papad',
          'Roti (2 pcs)',
        ],
        price: '₹55',
      },
    ],
  },
  {
    dayOfWeek: 3,
    meals: [
      {
        type: 'Breakfast',
        items: ['Vegetable Sandwich', 'Peanut Chutney', 'Juice'],
        price: '₹30',
      },
      {
        type: 'Snack',
        items: ['Fruit Chaat', 'Masala Chai'],
        price: '₹25',
      },
      {
        type: 'Lunch',
        items: [
          'Paneer Butter Masala',
          'Naan (2 pcs)',
          'Jeera Rice',
          'Raita',
          'Gulab Jamun (1 pc)',
        ],
        price: '₹65',
      },
    ],
  },
  {
    dayOfWeek: 4,
    meals: [
      {
        type: 'Breakfast',
        items: ['Aloo Paratha', 'Pickle', 'Curd', 'Tea / Coffee'],
        price: '₹30',
      },
      {
        type: 'Snack',
        items: ['Bread Pakora', 'Green Chutney', 'Chai'],
        price: '₹20',
      },
      {
        type: 'Lunch',
        items: [
          'Rajma',
          'Steamed Rice',
          'Mixed Veg',
          'Salad',
          'Roti (2 pcs)',
        ],
        price: '₹55',
      },
    ],
  },
  {
    dayOfWeek: 5,
    meals: [
      {
        type: 'Breakfast',
        items: ['Idli (3 pcs)', 'Sambar', 'Coconut Chutney', 'Tea / Coffee'],
        price: '₹30',
      },
      {
        type: 'Snack',
        items: ['Pani Puri (6 pcs)', 'Sweet Chutney'],
        price: '₹20',
      },
      {
        type: 'Lunch',
        items: [
          'Veg Biryani',
          'Raita',
          'Boiled Egg',
          'Salad',
          'Shahi Tukda (1 pc)',
        ],
        price: '₹65',
      },
    ],
  },
  {
    dayOfWeek: 6,
    meals: [
      {
        type: 'Breakfast',
        items: ['Puri Sabzi', 'Aloo Tamatar', 'Pickle', 'Tea / Coffee'],
        price: '₹30',
      },
      {
        type: 'Snack',
        items: ['Dhokla', 'Green Chutney', 'Chai'],
        price: '₹20',
      },
      {
        type: 'Lunch',
        items: [
          'Chole Bhature',
          'Rice',
          'Onion Salad',
          'Raita',
        ],
        price: '₹55',
      },
    ],
  },
];

export const CANTEEN_SPECIALS: CanteenSpecial[] = [
  {
    dayOfWeek: 5,
    name: 'Friday Biryani Special',
    description: 'Every Friday the canteen serves special Veg Biryani with Raita and Shahi Tukda.',
    item: 'Veg Biryani + Raita + Shahi Tukda',
    price: '₹65',
  },
  {
    dayOfWeek: 3,
    name: 'Wednesday Sweets Day',
    description: 'Wednesday lunch includes a complimentary sweet — Gulab Jamun with Paneer Butter Masala.',
    item: 'Gulab Jamun (1 pc)',
    price: 'Included in Lunch',
  },
  {
    dayOfWeek: 1,
    name: 'Monday Energy Breakfast',
    description: 'Start the week with a wholesome Poha and boiled eggs breakfast.',
    item: 'Poha + Boiled Eggs',
    price: '₹25',
  },
];

export function getTodayMenu(): CanteenDayMenu | undefined {
  const today = new Date().getDay();
  return CANTEEN_MENU.find((menu) => menu.dayOfWeek === today);
}

export function getMenuByDay(day: number): CanteenDayMenu | undefined {
  return CANTEEN_MENU.find((menu) => menu.dayOfWeek === day);
}

export function getMealByType(mealType: string): CanteenMeal[] {
  const lower = mealType.toLowerCase();
  return CANTEEN_MENU.flatMap((day) =>
    day.meals.filter((meal) => meal.type.toLowerCase() === lower)
  );
}
