import { CalendarDays, UsersRound } from 'lucide-react';
import { SUMMER_LASTCALL_DEAL } from '../../data/hotels';
import type { Hotel, Room } from '../../types/hotel';
import type { SearchState } from '../../types/search';
import { formatCurrency, formatDateRange } from '../../utils/format';
import { calculatePrice } from '../../utils/pricing';
import { buttonClassName } from '../common/buttonClassName';

type BookingPanelProps = {
  hotel: Hotel;
  selectedRoom?: Room;
  searchState: SearchState;
};

export function BookingPanel({ hotel, selectedRoom, searchState }: BookingPanelProps) {
  const isLastCallDeal = searchState.deal === SUMMER_LASTCALL_DEAL;
  const pricePerNight = selectedRoom?.pricePerNight || hotel.pricePerNight;
  const originalPrice = selectedRoom?.originalPrice || hotel.originalPrice;
  const price = calculatePrice({
    pricePerNight,
    originalPrice,
    checkIn: searchState.checkIn,
    checkOut: searchState.checkOut,
    rooms: searchState.rooms,
  });

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      {isLastCallDeal && originalPrice ? (
        <p className="text-sm text-ink-500">
          기존 프로모션가 <span className="line-through">{formatCurrency(originalPrice)}</span>
        </p>
      ) : null}
      <p className={isLastCallDeal ? 'text-sm font-semibold text-rose-600' : 'text-sm font-semibold text-ink-500'}>
        {isLastCallDeal ? 'D-3 최종 할인가 · 1박' : '1박 최저가'}
      </p>
      <p className={isLastCallDeal ? 'mt-1 text-3xl font-bold text-rose-700' : 'mt-1 text-3xl font-bold text-ink-900'}>{formatCurrency(pricePerNight)}</p>
      <div className="mt-5 space-y-3 rounded-lg bg-slate-50 p-4">
        <div className="flex items-start gap-3 text-sm text-ink-700">
          <CalendarDays size={17} className="mt-0.5 text-loop-600" aria-hidden="true" />
          <span>{formatDateRange(searchState.checkIn, searchState.checkOut)}</span>
        </div>
        <div className="flex items-start gap-3 text-sm text-ink-700">
          <UsersRound size={17} className="mt-0.5 text-loop-600" aria-hidden="true" />
          <span>
            성인 {searchState.adults}명
            {searchState.children ? `, 아동 ${searchState.children}명` : ''} · 객실 {searchState.rooms}개
          </span>
        </div>
      </div>
      <div className="mt-5 border-t border-slate-200 pt-4">
        <div className="flex justify-between text-sm text-ink-500">
          <span>{price.nights}박 객실 요금</span>
          <span>{formatCurrency(price.subtotal)}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm text-ink-500">
          <span>세금 및 수수료</span>
          <span>{formatCurrency(price.taxAndFees)}</span>
        </div>
        <div className="mt-3 flex justify-between text-base font-bold text-ink-900">
          <span>총액</span>
          <span>{formatCurrency(price.total)}</span>
        </div>
      </div>
      <a className={buttonClassName({ className: 'mt-5 w-full', size: 'lg' })} href="#rooms">
        객실 선택하기
      </a>
      <p className="mt-3 text-center text-xs text-ink-500">예약 전까지 요금은 청구되지 않습니다.</p>
    </aside>
  );
}
