import { Heart, MapPin, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { badgeTone } from '../../data/hotels';
import type { Hotel } from '../../types/hotel';
import type { SearchState } from '../../types/search';
import { cn } from '../../utils/cn';
import { formatCurrency, getPropertyTypeLabel, getStars } from '../../utils/format';
import { calculatePrice } from '../../utils/pricing';
import { createSearchParams } from '../../utils/searchParams';
import { Badge } from '../common/Badge';
import { buttonClassName } from '../common/buttonClassName';
import { AmenityList } from './AmenityList';
import { RatingBadge } from './RatingBadge';

type HotelCardProps = {
  hotel: Hotel;
  searchState: SearchState;
};

export function HotelCard({ hotel, searchState }: HotelCardProps) {
  const price = calculatePrice({
    pricePerNight: hotel.pricePerNight,
    originalPrice: hotel.originalPrice,
    checkIn: searchState.checkIn,
    checkOut: searchState.checkOut,
    rooms: searchState.rooms,
  });
  const detailPath = `/hotel/${hotel.id}?${createSearchParams(searchState)}`;

  return (
    <article
      className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift md:grid-cols-[240px_1fr] lg:grid-cols-[230px_1fr]"
    >
      <Link className="image-fallback relative min-h-[220px] overflow-hidden md:min-h-full" to={detailPath}>
        <img
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
          src={hotel.images[0]}
          alt={`${hotel.name} 대표 사진`}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        {hotel.badge ? (
          <span className={cn('absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-bold', badgeTone[hotel.badge])}>{hotel.badge}</span>
        ) : null}
      </Link>

      <div className="grid gap-5 p-4 md:grid-cols-[1fr_190px]">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-amber-500" aria-label={`${hotel.starRating}성급`}>
              {getStars(hotel.starRating)}
            </span>
            <span className="text-xs font-semibold text-ink-500">{getPropertyTypeLabel(hotel.propertyType)}</span>
          </div>
          <Link to={detailPath} className="text-xl font-bold text-ink-900 hover:text-loop-700">
            {hotel.name}
          </Link>
          <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
            <MapPin size={15} aria-hidden="true" />
            {hotel.neighborhood} · {hotel.distanceText}
          </div>
          <div className="mt-3">
            <RatingBadge rating={hotel.guestRating} reviewCount={hotel.reviewCount} />
          </div>
          <div className="mt-4">
            <AmenityList amenities={hotel.amenities} limit={4} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {hotel.refundable ? <Badge tone="green">무료 취소 가능</Badge> : null}
            {hotel.payLater ? <Badge tone="blue">숙소에서 결제 가능</Badge> : null}
            <Badge tone="amber">
              <Sparkles size={13} aria-hidden="true" />
              최근 24시간 내 {Math.max(5, Math.round(hotel.reviewCount / 140))}회 예약됨
            </Badge>
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-slate-100 pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
          <button className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-ink-500 hover:bg-slate-100 hover:text-rose-600" type="button" aria-label="관심 숙소 저장">
            <Heart size={18} aria-hidden="true" />
          </button>
          <div className="mt-6 text-right md:mt-auto">
            {hotel.originalPrice ? <p className="text-sm text-ink-500 line-through">{formatCurrency(hotel.originalPrice)}</p> : null}
            <p className="text-sm font-semibold text-ink-500">1박</p>
            <p className="text-2xl font-bold text-ink-900">{formatCurrency(hotel.pricePerNight)}</p>
            <p className="mt-1 text-sm text-ink-500">총 {formatCurrency(price.total)}</p>
            <p className="text-xs text-ink-500">세금 및 수수료 포함</p>
            <Link className={buttonClassName({ className: 'mt-4 w-full' })} to={detailPath}>
              자세히 보기
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
