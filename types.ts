
export type TripType = 'Adventure' | 'Laid Back' | 'Family' | 'Romantic';
export type GroupType = 'Family' | 'Couples' | 'Group' | 'Friends';

export type Interest = 
  | 'Parasailing' 
  | 'Charter Fishing' 
  | 'Boat Rentals' 
  | 'Dolphin Tours & Cruises' 
  | 'Jet Ski Rentals' 
  | 'Dinner & Sunset Cruises' 
  | 'Snorkeling' 
  | 'Crab Island Adventures' 
  | 'Paddleboard & Kayak Rentals';

export interface TripPreferences {
  tripType: TripType;
  groupType: GroupType;
  days: number;
  interests: Interest[];
  destination?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
  type: 'web' | 'maps';
}

export interface GeminiResponse {
  text: string;
  sources: GroundingSource[];
}
