export type PropertyType = 'hotel' | 'resort' | 'apartment' | 'guesthouse';

export type HotelBadge = '회원가' | '인기 숙소' | '오늘의 특가' | '무료 취소';

export type Destination = {
  id: string;
  name: string;
  country: string;
  description: string;
  hotelCountLabel: string;
  image: string;
  popularAreas: string[];
};

export type HotelPolicies = {
  checkIn: string;
  checkOut: string;
  cancellation: string;
  pet: string;
  deposit: string;
};

export type ReviewBreakdown = {
  cleanliness: number;
  service: number;
  location: number;
  amenities: number;
};

export type Room = {
  id: string;
  hotelId: string;
  name: string;
  image: string;
  bedType: string;
  capacity: number;
  size: string;
  breakfastIncluded: boolean;
  refundable: boolean;
  pricePerNight: number;
  originalPrice?: number;
  features: string[];
};

export type Review = {
  id: string;
  hotelId: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  date: string;
  tripType: '커플 여행' | '가족 여행' | '출장' | '친구와 여행' | '혼자 여행';
};

export type Hotel = {
  id: string;
  name: string;
  destinationId: string;
  destination: string;
  neighborhood: string;
  address: string;
  starRating: 3 | 4 | 5;
  guestRating: number;
  reviewCount: number;
  pricePerNight: number;
  originalPrice?: number;
  refundable: boolean;
  payLater: boolean;
  amenities: string[];
  propertyType: PropertyType;
  images: string[];
  distanceText: string;
  badge?: HotelBadge;
  description: string;
  highlights: string[];
  policies: HotelPolicies;
  reviewBreakdown: ReviewBreakdown;
  rooms: Room[];
  reviews: Review[];
  mapPosition: {
    x: number;
    y: number;
  };
};
