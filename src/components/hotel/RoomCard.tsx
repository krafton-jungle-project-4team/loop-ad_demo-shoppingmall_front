import { CheckCircle2, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUMMER_LASTCALL_DEAL } from '../../data/hotels';
import type { Hotel, Room } from '../../types/hotel';
import type { SearchState } from '../../types/search';
import { formatCurrency } from '../../utils/format';
import { calculatePrice } from '../../utils/pricing';
import { createSearchParams } from '../../utils/searchParams';
import { Badge } from '../common/Badge';
import { buttonClassName } from '../common/buttonClassName';

type RoomCardProps = {
  hotel: Hotel;
  room: Room;
  searchState: SearchState;
};

export function RoomCard({ hotel, room, searchState }: RoomCardProps) {
  const isLastCallDeal = searchState.deal === SUMMER_LASTCALL_DEAL;
  const price = calculatePrice({
    pricePerNight: room.pricePerNight,
    originalPrice: room.originalPrice,
    checkIn: searchState.checkIn,
    checkOut: searchState.checkOut,
    rooms: searchState.rooms,
  });
  const checkoutPath = `/checkout/${hotel.id}?roomId=${room.id}&${createSearchParams(searchState)}`;

  return (
    <article className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:grid-cols-[220px_1fr_190px]">
      <div className="image-fallback min-h-[180px]">
        <img
          className="h-full w-full object-cover"
          src={room.image}
          alt={`${room.name} 객실 사진`}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-ink-900">{room.name}</h3>
        <p className="mt-1 text-sm text-ink-500">
          {room.bedType} · {room.size}
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink-700">
          <UsersRound size={16} aria-hidden="true" />
          최대 {room.capacity}명
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {room.refundable ? <Badge tone="green">무료 취소 가능</Badge> : null}
          {room.breakfastIncluded ? <Badge tone="blue">조식 포함</Badge> : <Badge tone="slate">조식 별도</Badge>}
        </div>
        <ul className="mt-4 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
          {room.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600" aria-hidden="true" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col justify-end border-t border-slate-100 p-4 text-right md:border-l md:border-t-0">
        {room.originalPrice && isLastCallDeal ? (
          <p className="text-sm text-ink-500">
            기존 프로모션가 <span className="line-through">{formatCurrency(room.originalPrice)}</span>
          </p>
        ) : null}
        {room.originalPrice && !isLastCallDeal ? <p className="text-sm text-ink-500 line-through">{formatCurrency(room.originalPrice)}</p> : null}
        <p className={isLastCallDeal ? 'text-sm font-semibold text-rose-600' : 'text-sm font-semibold text-ink-500'}>
          {isLastCallDeal ? 'D-3 최종 할인가 · 1박' : '1박'}
        </p>
        <p className={isLastCallDeal ? 'text-2xl font-bold text-rose-700' : 'text-2xl font-bold text-ink-900'}>{formatCurrency(room.pricePerNight)}</p>
        <p className="mt-1 text-sm text-ink-500">총 {formatCurrency(price.total)}</p>
        <Link className={buttonClassName({ className: 'mt-4 w-full' })} to={checkoutPath}>
          예약하기
        </Link>
      </div>
    </article>
  );
}
