import type { Hotel, Room } from '../../types/hotel';
import type { SearchState } from '../../types/search';
import { SUMMER_LASTCALL_DEAL } from '../../data/hotels';
import { formatCurrency } from '../../utils/format';
import { calculatePrice } from '../../utils/pricing';

type PriceSummaryProps = {
  hotel: Hotel;
  room: Room;
  searchState: SearchState;
};

export function PriceSummary({ hotel, room, searchState }: PriceSummaryProps) {
  const isLastCallDeal = searchState.deal === SUMMER_LASTCALL_DEAL;
  const price = calculatePrice({
    pricePerNight: room.pricePerNight,
    originalPrice: room.originalPrice,
    checkIn: searchState.checkIn,
    checkOut: searchState.checkOut,
    rooms: searchState.rooms,
  });

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
      <h2 className="text-lg font-bold text-ink-900">요금 상세</h2>
      <div className="mt-4 flex gap-3 border-b border-slate-100 pb-4">
        <img
          className="h-20 w-24 rounded-md object-cover"
          src={hotel.images[0]}
          alt={`${hotel.name} 사진`}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
        <div>
          <p className="font-bold text-ink-900">{hotel.name}</p>
          <p className="mt-1 text-sm text-ink-500">{room.name}</p>
          <p className="mt-1 text-sm text-ink-500">{price.nights}박 · 객실 {searchState.rooms}개</p>
          {isLastCallDeal && room.originalPrice ? (
            <p className="mt-2 text-xs text-ink-500">
              기존 프로모션가 <span className="line-through">{formatCurrency(room.originalPrice)}</span> / 1박
            </p>
          ) : null}
        </div>
      </div>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-3 text-ink-600">
          <dt>
            객실 요금 {formatCurrency(room.pricePerNight)} x {price.nights}박
          </dt>
          <dd>{formatCurrency(price.subtotal)}</dd>
        </div>
        {price.discount ? (
          <div className="flex justify-between gap-3 text-emerald-700">
            <dt>{isLastCallDeal ? 'D-3 추가 할인' : '할인 금액'}</dt>
            <dd>-{formatCurrency(price.discount)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3 text-ink-600">
          <dt>세금 및 수수료</dt>
          <dd>{formatCurrency(price.taxAndFees)}</dd>
        </div>
        <div className="flex justify-between gap-3 border-t border-slate-200 pt-4 text-lg font-bold text-ink-900">
          <dt>총 결제 금액</dt>
          <dd>{formatCurrency(price.total)}</dd>
        </div>
      </dl>
      <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">무료 취소 가능 객실은 체크인 전 정책에 따라 취소할 수 있습니다.</p>
    </aside>
  );
}
