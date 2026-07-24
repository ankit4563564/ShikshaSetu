export type CoinTxType =
  | 'earn_attendance'
  | 'earn_homework'
  | 'earn_competition'
  | 'earn_club'
  | 'earn_sports'
  | 'earn_behaviour'
  | 'earn_bonus'
  | 'earn_achievement'
  | 'earn_mystery'
  | 'earn_campaign'
  | 'redeem_reward'
  | 'admin_adjust';



export type RewardCategory = 'canteen' | 'library' | 'sports' | 'merchandise' | 'event_ticket' | 'other';
export type RewardType = 'item' | 'coupon' | 'facility';
export type InventoryStatus = 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
export type RedemptionStatus = 'pending' | 'completed' | 'cancelled' | 'refunded' | 'expired';
export type TokenStatus = 'pending' | 'ready' | 'redeemed' | 'expired' | 'cancelled';
export type VendorType = 'canteen' | 'library' | 'sports' | 'facility' | 'general';
export type FacilityCategory = 'sports' | 'library' | 'music' | 'art' | 'lab' | 'studio' | 'other';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type CouponCategory = 'food' | 'print' | 'pass' | 'merchandise' | 'other';
export type CouponStatus = 'active' | 'used' | 'expired' | 'cancelled';
export type AchievementCategory = 'attendance' | 'homework' | 'sports' | 'behaviour' | 'academic' | 'club' | 'transport' | 'special';
export type HousePeriod = 'weekly' | 'monthly' | 'yearly' | 'all_time';

export interface RewardConfig {
  id: string;
  name: string;
  description: string | null;
  category: RewardCategory;
  cost: number;
  stock: number | null;
  imageUrl: string | null;
  isActive: boolean;
  dailyLimit: number | null;
  weeklyLimit: number | null;
  monthlyLimit: number | null;
  availabilityWindowStart: string | null;
  availabilityWindowEnd: string | null;
  inventoryStatus: InventoryStatus;
  rewardType: RewardType;
  facilityId: string | null;
}

export interface StudentBalance {
  studentId: string;
  balance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface CoinTransaction {
  id: string;
  studentId: string;
  txType: CoinTxType;
  amount: number;
  direction: 'earn' | 'spend';
  description: string;
  referenceId: string | null;
  createdBy: string | null;
  createdAt: string;
}

export interface Redemption {
  id: string;
  studentId: string;
  rewardId: string;
  rewardName?: string;
  coinTxId: string;
  status: RedemptionStatus;
  redeemedAt: string;
}

export interface RedemptionToken {
  id: string;
  redemptionId: string;
  token: string;
  qrData: string | null;
  expiresAt: string;
  status: TokenStatus;
  scannedAt: string | null;
  scannedBy: string | null;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  clerkUserId: string | null;
  vendorType: VendorType;
  isActive: boolean;
}

export interface Facility {
  id: string;
  name: string;
  description: string | null;
  category: FacilityCategory;
  location: string | null;
  capacity: number;
  isActive: boolean;
}

export interface FacilitySlot {
  id: string;
  facilityId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxBookings: number;
}

export interface FacilityBooking {
  id: string;
  studentId: string;
  facilityId: string;
  facilityName?: string;
  slotId: string;
  redemptionId: string | null;
  bookingDate: string;
  status: BookingStatus;
  qrToken: string | null;
  checkedInAt: string | null;
}

export interface Coupon {
  id: string;
  studentId: string;
  redemptionId: string | null;
  code: string;
  description: string;
  category: CouponCategory;
  expiryDate: string;
  usageLimit: number;
  usageCount: number;
  status: CouponStatus;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  bonusMultiplier: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface MysteryBox {
  id: string;
  name: string;
  description: string | null;
  cost: number;
  imageUrl: string | null;
  isActive: boolean;
}

export interface MysteryBoxItem {
  id: string;
  boxId: string;
  itemType: string;
  itemName: string;
  itemDescription: string | null;
  itemValue: number;
  probability: number;
  quantity: number | null;
  isActive: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: AchievementCategory;
  coinsReward: number;
  isActive: boolean;
}

export interface StudentAchievement {
  id: string;
  studentId: string;
  achievementId: string;
  achievementName?: string;
  achievementIcon?: string;
  achievementCategory?: string;
  coinTxId: string | null;
  earnedAt: string;
}

export interface HouseScore {
  id: string;
  house: string;
  periodType: HousePeriod;
  periodStart: string;
  periodEnd: string | null;
  score: number;
}

export interface EarnCoinsInput {
  studentId: string;
  amount: number;
  txType: CoinTxType;
  description: string;
  teacherId?: string;
}

export interface AIRecommendation {
  type: 'coins_to_reward' | 'expiring' | 'activity_match' | 'trending';
  message: string;
  rewardId?: string;
  priority: number;
}
