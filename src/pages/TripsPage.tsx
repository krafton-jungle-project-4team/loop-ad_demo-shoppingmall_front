import { CalendarDays, MapPin, Search, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { buttonClassName } from '../components/common/buttonClassName';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { hotels } from '../data/hotels';
import type { StoredBooking } from '../types/booking';
import { cancelLastBooking, getLastBooking } from '../utils/bookingStorage';
import { trackBookingCancel } from '../utils/booking-events';
import { formatCurrency, formatDateRange } from '../utils/format';
import { calculatePrice } from '../utils/pricing';
import { DEFAULT_SEARCH_STATE } from '../utils/searchParams';

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
    status: 'confirmed',
  };
}

export function TripsPage() {
  const [storedBooking, setStoredBooking] = useState<StoredBooking | null>(() => getLastBooking());
  const booking = useMemo(() => storedBooking || createFallbackBooking(), [storedBooking]);
  const hotel = hotels.find((item) => item.id === booking.hotelId) || hotels[0];
  const isCancelled = booking.status === 'cancelled';

  function handleBookingCancel() {
    if (isCancelled) {
      return;
    }

    trackBookingCancel(booking);
    setStoredBooking(cancelLastBooking(booking));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <PageContainer className="py-8">
          <div className="mb-6">
            <p className="text-sm font-semibold text-loop-700">내 예약</p>
            <h1 className="mt-1 text-3xl font-bold text-ink-900">최근 예약</h1>
          </div>

          <article className="grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card lg:grid-cols-[320px_1fr]">
            <div className="image-fallback min-h-[240px]">
              <img
                className="h-full w-full object-cover"
                src={hotel.images[0]}
                alt={`${hotel.name} 숙소 사진`}
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className={isCancelled ? 'inline-flex rounded-md bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700' : 'inline-flex rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700'}>
                    {isCancelled ? '예약 취소됨' : '예약 확정'}
                  </span>
                  <h2 className="mt-3 text-2xl font-bold text-ink-900">{booking.hotelName}</h2>
                  <p className="mt-1 text-sm text-ink-500">{booking.roomName}</p>
                </div>
                <p className="rounded-lg bg-loop-50 px-3 py-2 text-sm font-bold text-loop-700">{booking.bookingNumber}</p>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <InfoBlock icon={<CalendarDays size={18} aria-hidden="true" />} label="숙박 날짜" value={formatDateRange(booking.checkIn, booking.checkOut)} />
                <InfoBlock icon={<MapPin size={18} aria-hidden="true" />} label="위치" value={`${hotel.destination} ${hotel.neighborhood}`} />
                <InfoBlock
                  icon={<CalendarDays size={18} aria-hidden="true" />}
                  label="여행자/객실"
                  value={`성인 ${booking.adults}명${booking.children ? `, 아동 ${booking.children}명` : ''} · 객실 ${booking.rooms}개`}
                />
                <InfoBlock icon={<Search size={18} aria-hidden="true" />} label="총 결제 금액" value={formatCurrency(booking.total)} />
                {booking.cancelledAt ? (
                  <InfoBlock icon={<XCircle size={18} aria-hidden="true" />} label="취소 일시" value={new Date(booking.cancelledAt).toLocaleString('ko-KR')} />
                ) : null}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link className={buttonClassName({ className: 'flex-1' })} to={`/hotel/${booking.hotelId}`}>
                  예약 상세 보기
                </Link>
                <Link className={buttonClassName({ variant: 'outline', className: 'flex-1' })} to="/">
                  다른 숙소 찾아보기
                </Link>
                <button
                  className={buttonClassName({ variant: 'ghost', className: 'flex-1 text-rose-700 hover:bg-rose-50' })}
                  disabled={isCancelled}
                  type="button"
                  onClick={handleBookingCancel}
                >
                  예약 취소
                </button>
              </div>
            </div>
          </article>
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}

function InfoBlock({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-ink-900">
        <span className="text-loop-600">{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-sm text-ink-600">{value}</p>
    </div>
  );
}
