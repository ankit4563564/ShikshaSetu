import type { BusRouteInfo } from '../models/index';
import { DEMO_STUDENTS } from './students';

export const DEMO_BUS_ROUTES: BusRouteInfo[] = [
  {
    routeId: 'Route 1',
    busNumber: 'Bus 1',
    driverName: 'Harish Chandra',
    driverPhone: '9899112233',
    vehicleNumber: 'DL-01-AB-1234',
    capacity: 45,
    studentCount: 14,
    stops: [
      { stopName: 'South Extension Part II', morningPickupTime: '07:00 AM', eveningDropTime: '02:45 PM' },
      { stopName: 'Defence Colony Main Gate', morningPickupTime: '07:15 AM', eveningDropTime: '03:00 PM' },
      { stopName: 'Hauz Khas Village', morningPickupTime: '07:30 AM', eveningDropTime: '03:15 PM' },
    ],
  },
  {
    routeId: 'Route 2',
    busNumber: 'Bus 2',
    driverName: 'Baldev Singh',
    driverPhone: '9899112244',
    vehicleNumber: 'DL-01-AB-5678',
    capacity: 45,
    studentCount: 16,
    stops: [
      { stopName: 'Lajpat Nagar Central Market', morningPickupTime: '07:05 AM', eveningDropTime: '02:50 PM' },
      { stopName: 'Kailash Colony Metro', morningPickupTime: '07:20 AM', eveningDropTime: '03:05 PM' },
      { stopName: 'Moolchand Flyover', morningPickupTime: '07:35 AM', eveningDropTime: '03:20 PM' },
    ],
  },
  {
    routeId: 'Route 3',
    busNumber: 'Bus 3',
    driverName: 'Manoj Kumar',
    driverPhone: '9899112255',
    vehicleNumber: 'DL-01-AB-9101',
    capacity: 45,
    studentCount: 18, // 18 students use Bus 3! (Aarav Singh, Rohan Gupta, Yash Bhasin, Tara Kapoor, etc.)
    stops: [
      { stopName: 'Vasant Kunj Block B', morningPickupTime: '06:55 AM', eveningDropTime: '02:40 PM' },
      { stopName: 'Green Park Metro Station', morningPickupTime: '07:15 AM', eveningDropTime: '03:00 PM' },
      { stopName: 'Munirka DDA Flats', morningPickupTime: '07:30 AM', eveningDropTime: '03:15 PM' },
    ],
  },
  {
    routeId: 'Route 4',
    busNumber: 'Bus 4',
    driverName: 'Sartaj Khan',
    driverPhone: '9899112266',
    vehicleNumber: 'DL-01-AB-1122',
    capacity: 40,
    studentCount: 12,
    stops: [
      { stopName: 'Janakpuri District Centre', morningPickupTime: '06:45 AM', eveningDropTime: '02:35 PM' },
      { stopName: 'Dwarka Sector 12 Metro', morningPickupTime: '07:10 AM', eveningDropTime: '03:00 PM' },
    ],
  },
  {
    routeId: 'Route 5',
    busNumber: 'Bus 5',
    driverName: 'Gurpreet Singh',
    driverPhone: '9899112277',
    vehicleNumber: 'DL-01-AB-3344',
    capacity: 45,
    studentCount: 15,
    stops: [
      { stopName: 'Greater Kailash I M-Block', morningPickupTime: '07:10 AM', eveningDropTime: '02:55 PM' },
      { stopName: 'Nehru Place Bus Terminal', morningPickupTime: '07:25 AM', eveningDropTime: '03:10 PM' },
      { stopName: 'CR Park Market 1', morningPickupTime: '07:35 AM', eveningDropTime: '03:20 PM' },
    ],
  },
];

export function getBusRouteByNumber(busNumber: string): BusRouteInfo | undefined {
  const lower = busNumber.toLowerCase();
  return DEMO_BUS_ROUTES.find(b =>
    b.busNumber.toLowerCase().includes(lower) || b.routeId.toLowerCase().includes(lower)
  );
}

export function getStudentsForBus(busNumber: string): number {
  const route = getBusRouteByNumber(busNumber);
  if (route) return route.studentCount;
  return DEMO_STUDENTS.filter(s => s.busNumber?.toLowerCase() === busNumber.toLowerCase()).length || 18;
}
