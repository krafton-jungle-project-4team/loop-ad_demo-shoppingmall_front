import { CreditCard, Mail, Phone, UserRound } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { buttonClassName } from '../components/common/buttonClassName';
import { PriceSummary } from '../components/checkout/PriceSummary';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { hotels } from '../data/hotels';
import type { StoredBooking } from '../types/booking';
import { cn } from '../utils/cn';
import { createBookingNumber, saveLastBooking } from '../utils/bookingStorage';
import { trackBookingComplete, trackCheckoutStart } from '../utils/booking-events';
import { formatDateRange } from '../utils/format';
import { calculatePrice } from '../utils/pricing';
import { parseSearchParams } from '../utils/searchParams';

type GuestForm = {
  name: string;
  email: string;
  phone: string;
  request: string;
};

type FormErrors = Partial<Record<keyof Pick<GuestForm, 'name' | 'email' | 'phone'>, string>>;

export function CheckoutPage() {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchState = parseSearchParams(searchParams);
  const hotel = hotels.find((item) => item.id === hotelId);
  const roomId = searchParams.get('roomId') || 'standard-double';
  const room = hotel?.rooms.find((item) => item.id === roomId) || hotel?.rooms[0];
  const { adults, checkIn, checkOut, children, deal, destination, rooms } = searchState;
  const [guestForm, setGuestForm] = useState<GuestForm>({ name: '', email: '', phone: '', request: '' });
  const [paymentOption, setPaymentOption] = useState<'now' | 'later'>('now');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!hotel || !room) {
      return;
    }

    trackCheckoutStart(hotel, room, { adults, checkIn, checkOut, children, deal, destination, rooms });
  }, [adults, checkIn, checkOut, children, deal, destination, hotel, room, rooms]);

  if (!hotel || !room) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <PageContainer className="py-16 text-center">
          <h1 className="text-2xl font-bold text-ink-900">예약할 숙소를 찾을 수 없어요</h1>
          <Link className={buttonClassName({ className: 'mt-6' })} to="/">
            홈으로 이동
          </Link>
        </PageContainer>
      </div>
    );
  }

  const price = calculatePrice({
    pricePerNight: room.pricePerNight,
    originalPrice: room.originalPrice,
    checkIn: searchState.checkIn,
    checkOut: searchState.checkOut,
    rooms: searchState.rooms,
  });

  const updateGuestForm = (key: keyof GuestForm, value: string) => {
    setGuestForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateForm = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!guestForm.name.trim()) nextErrors.name = '성명을 입력해주세요.';
    if (!guestForm.email.trim()) nextErrors.email = '이메일을 입력해주세요.';
    if (guestForm.email.trim() && !guestForm.email.includes('@')) nextErrors.email = '이메일 형식을 확인해주세요.';
    if (!guestForm.phone.trim()) nextErrors.phone = '전화번호를 입력해주세요.';

    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const booking: StoredBooking = {
      bookingNumber: createBookingNumber(),
      hotelId: hotel.id,
      hotelName: hotel.name,
      roomId: room.id,
      roomName: room.name,
      guestName: guestForm.name,
      email: guestForm.email,
      phone: guestForm.phone,
      checkIn: searchState.checkIn,
      checkOut: searchState.checkOut,
      adults: searchState.adults,
      children: searchState.children,
      rooms: searchState.rooms,
      total: price.total,
      paymentOption,
      cancellation: hotel.policies.cancellation,
    };

    saveLastBooking(booking);
    trackBookingComplete(booking);
    navigate('/booking-complete');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <PageContainer className="py-6">
          <div className="mb-6">
            <p className="text-sm font-semibold text-loop-700">예약 정보 입력</p>
            <h1 className="mt-1 text-3xl font-bold text-ink-900">예약 전 정보를 확인해주세요</h1>
          </div>

          <form className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" onSubmit={handleSubmit} noValidate>
            <div className="space-y-5">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold text-ink-900">예약자 정보</h2>
                <div className="mt-5 grid gap-4">
                  <TextField
                    error={errors.name}
                    icon={<UserRound size={17} aria-hidden="true" />}
                    id="guest-name"
                    label="성명"
                    placeholder="홍길동"
                    value={guestForm.name}
                    onChange={(value) => updateGuestForm('name', value)}
                  />
                  <TextField
                    error={errors.email}
                    icon={<Mail size={17} aria-hidden="true" />}
                    id="guest-email"
                    label="이메일"
                    placeholder="stayloop@example.com"
                    type="email"
                    value={guestForm.email}
                    onChange={(value) => updateGuestForm('email', value)}
                  />
                  <TextField
                    error={errors.phone}
                    icon={<Phone size={17} aria-hidden="true" />}
                    id="guest-phone"
                    label="전화번호"
                    placeholder="010-1234-5678"
                    value={guestForm.phone}
                    onChange={(value) => updateGuestForm('phone', value)}
                  />
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-ink-900">요청사항</span>
                    <textarea
                      className="min-h-28 w-full rounded-md border border-slate-200 px-3 py-3 text-sm text-ink-900"
                      placeholder="높은 층, 조용한 객실 등 요청사항을 입력하세요."
                      value={guestForm.request}
                      onChange={(event) => updateGuestForm('request', event.target.value)}
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold text-ink-900">예약 요약</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-[180px_1fr]">
                  <img
                    className="h-36 w-full rounded-lg object-cover"
                    src={room.image}
                    alt={`${room.name} 객실 사진`}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone="green">무료 취소 가능</Badge>
                      {hotel.payLater ? <Badge>숙소에서 결제 가능</Badge> : null}
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-ink-900">{hotel.name}</h3>
                    <p className="mt-1 text-sm text-ink-500">{room.name}</p>
                    <dl className="mt-4 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
                      <div>
                        <dt className="font-bold text-ink-900">숙박 날짜</dt>
                        <dd>{formatDateRange(searchState.checkIn, searchState.checkOut)}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-ink-900">여행자</dt>
                        <dd>
                          성인 {searchState.adults}명
                          {searchState.children ? `, 아동 ${searchState.children}명` : ''} · 객실 {searchState.rooms}개
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-bold text-ink-900">결제 옵션</h2>
                <p className="mt-2 text-sm text-ink-500">예약 확정 전까지 원하는 결제 방식을 선택할 수 있습니다.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <PaymentOption
                    checked={paymentOption === 'now'}
                    description="예약 확정과 동시에 결제하는 옵션"
                    label="지금 결제"
                    onClick={() => setPaymentOption('now')}
                  />
                  <PaymentOption
                    checked={paymentOption === 'later'}
                    description="숙소 도착 후 현장에서 결제"
                    label="숙소에서 결제"
                    onClick={() => setPaymentOption('later')}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-emerald-100 bg-emerald-50 p-5">
                <h2 className="text-lg font-bold text-emerald-900">취소 정책</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-800">{hotel.policies.cancellation}</p>
              </section>
            </div>

            <div className="space-y-4">
              <PriceSummary hotel={hotel} room={room} searchState={searchState} />
              <Button className="w-full" size="lg" type="submit">
                <CreditCard size={18} aria-hidden="true" />
                예약 완료하기
              </Button>
              <p className="text-center text-xs text-ink-500">예약 확인 안내가 입력한 이메일로 발송될 예정입니다.</p>
            </div>
          </form>
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
  icon: ReactNode;
  type?: string;
};

function TextField({ id, label, value, onChange, placeholder, error, icon, type = 'text' }: TextFieldProps) {
  return (
    <label className="block" htmlFor={id}>
      <span className="mb-2 block text-sm font-bold text-ink-900">{label}</span>
      <span className={cn('flex items-center gap-2 rounded-md border px-3', error ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-white')}>
        <span className="text-ink-500">{icon}</span>
        <input
          className="h-12 min-w-0 flex-1 bg-transparent text-sm text-ink-900 outline-none"
          id={id}
          placeholder={placeholder}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
      {error ? <span className="mt-1 block text-sm font-semibold text-rose-600">{error}</span> : null}
    </label>
  );
}

type PaymentOptionProps = {
  checked: boolean;
  label: string;
  description: string;
  onClick: () => void;
};

function PaymentOption({ checked, label, description, onClick }: PaymentOptionProps) {
  return (
    <button
      className={cn(
        'rounded-lg border p-4 text-left transition',
        checked ? 'border-loop-500 bg-loop-50 ring-2 ring-loop-100' : 'border-slate-200 bg-white hover:border-loop-200',
      )}
      type="button"
      onClick={onClick}
    >
      <span className="flex items-center gap-2 font-bold text-ink-900">
        <span className={cn('h-4 w-4 rounded-full border', checked ? 'border-loop-600 bg-loop-600' : 'border-slate-300')} />
        {label}
      </span>
      <span className="mt-2 block text-sm leading-6 text-ink-500">{description}</span>
    </button>
  );
}
