import type { PropertyType } from '../types/hotel';

export function formatCurrency(value: number): string {
  return `${Math.round(value).toLocaleString('ko-KR')}원`;
}

export function formatDate(date: string): string {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const day = String(parsedDate.getDate()).padStart(2, '0');

  return `${year}.${month}.${day}`;
}

export function formatDateRange(checkIn: string, checkOut: string): string {
  return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
}

export function getRatingLabel(rating: number): string {
  if (rating >= 9) return '최고예요';
  if (rating >= 8.5) return '훌륭해요';
  if (rating >= 8) return '매우 좋아요';
  return '좋아요';
}

export function getStars(starRating: number): string {
  return '★'.repeat(starRating);
}

export function getPropertyTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    hotel: '호텔',
    resort: '리조트',
    apartment: '아파트먼트',
    guesthouse: '게스트하우스',
  };

  return labels[type];
}
