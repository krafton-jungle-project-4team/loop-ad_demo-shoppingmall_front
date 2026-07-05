import { CalendarCheck2, CheckCircle2, Hotel, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buttonClassName } from '../components/common/buttonClassName';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { hotels } from '../data/hotels';
import type { StoredBooking } from '../types/booking';
import { formatCurrency, formatDateRange } from '../utils/format';
import { calculatePrice } from '../utils/pricing';
import { DEFAULT_SEARCH_STATE } from '../utils/searchParams';
import { getLastBooking } from '../utils/bookingStorage';

function createFallbackBooking(): StoredBooking {
  const hotel = hotels[0];
  const room = hotel.rooms[0];
  const price = calculatePrice({
    pricePerNight: room.pricePerNight,
    originalPrice: room.originalPrice,
    checkIn: DEFAULT_SEARCH_STATE.checkIn,
    checkOut: DEFAULT_SEARCH_STATE.checkOut,
    rooms: DEFAULT_SEARCH_STATE.rooms,
  });

  return {
    bookingNumber: 'STAY-20260702-1042',
    hotelId: hotel.id,
    hotelName: hotel.name,
    roomId: room.id,
    roomName: room.name,
    guestName: 'StayLoop Guest',
    email: 'guest@stayloop.example',
    phone: '010-0000-0000',
    checkIn: DEFAULT_SEARCH_STATE.checkIn,
    checkOut: DEFAULT_SEARCH_STATE.checkOut,
    adults: DEFAULT_SEARCH_STATE.adults,
    children: DEFAULT_SEARCH_STATE.children,
    rooms: DEFAULT_SEARCH_STATE.rooms,
    total: price.total,
    paymentOption: 'now',
    cancellation: hotel.policies.cancellation,
  };
}

export function BookingCompletePage() {
  const [storedBooking] = useState<StoredBooking | null>(() => getLastBooking());
  const booking = useMemo(() => storedBooking || createFallbackBooking(), [storedBooking]);
  const paymentLabel = booking.paymentOption === 'now' ? '지금 결제' : '숙소에서 결제';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <PageContainer className="py-10">
          <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-card sm:p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <CheckCircle2 size={34} aria-hidden="true" />
            </div>
            <h1 className="mt-5 text-3xl font-bold text-ink-900">예약이 완료되었습니다</h1>
            <p className="mt-3 text-sm leading-6 text-ink-500">예약 확인 메일이 입력하신 이메일로 발송될 예정입니다.</p>
            <p className="mt-4 rounded-lg bg-loop-50 px-4 py-3 text-lg font-bold text-loop-700">예약 번호 {booking.bookingNumber}</p>
          </section>

          <section className="mx-auto mt-6 max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-ink-900">예약 요약</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              <SummaryRow label="숙소" value={booking.hotelName} />
              <SummaryRow label="객실" value={booking.roomName} />
              <SummaryRow label="숙박 날짜" value={formatDateRange(booking.checkIn, booking.checkOut)} />
              <SummaryRow
                label="여행자/객실"
                value={`성인 ${booking.adults}명${booking.children ? `, 아동 ${booking.children}명` : ''} · 객실 ${booking.rooms}개`}
              />
              <SummaryRow label="결제 옵션" value={paymentLabel} />
              <SummaryRow label="총 결제 금액" value={formatCurrency(booking.total)} strong />
            </dl>
            <div className="mt-5 rounded-lg bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-900">취소 정책</p>
              <p className="mt-1 text-sm leading-6 text-emerald-800">{booking.cancellation}</p>
            </div>
          </section>

          <div className="mx-auto mt-6 flex max-w-3xl flex-col gap-3 sm:flex-row">
            <Link className={buttonClassName({ className: 'flex-1', size: 'lg' })} to="/trips">
              <CalendarCheck2 size={18} aria-hidden="true" />
              내 예약 보기
            </Link>
            <Link className={buttonClassName({ variant: 'outline', className: 'flex-1', size: 'lg' })} to="/">
              <Search size={18} aria-hidden="true" />
              다른 숙소 찾아보기
            </Link>
            <Link className={buttonClassName({ variant: 'ghost', className: 'flex-1', size: 'lg' })} to={`/hotel/${booking.hotelId}`}>
              <Hotel size={18} aria-hidden="true" />
              숙소 다시 보기
            </Link>
          </div>
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}

function SummaryRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[150px_1fr]">
      <dt className="text-sm font-bold text-ink-900">{label}</dt>
      <dd className={strong ? 'text-lg font-bold text-loop-700' : 'text-sm font-semibold text-ink-700'}>{value}</dd>
    </div>
  );
}
