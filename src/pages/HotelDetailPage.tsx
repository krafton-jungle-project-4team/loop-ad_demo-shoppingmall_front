import { ChevronRight, MapPin, Share2, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import { buttonClassName } from '../components/common/buttonClassName';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { AmenityList } from '../components/hotel/AmenityList';
import { BookingPanel } from '../components/hotel/BookingPanel';
import { HotelGallery } from '../components/hotel/HotelGallery';
import { PolicySection } from '../components/hotel/PolicySection';
import { RatingBadge } from '../components/hotel/RatingBadge';
import { ReviewSummary } from '../components/hotel/ReviewSummary';
import { RoomCard } from '../components/hotel/RoomCard';
import { hotels } from '../data/hotels';
import { formatCurrency, formatDateRange, getStars } from '../utils/format';
import { calculatePrice } from '../utils/pricing';
import { trackHotelView } from '../utils/booking-events';
import { createSearchParams, parseSearchParams } from '../utils/searchParams';

const detailTabs = [
  { href: '#overview', label: '개요' },
  { href: '#rooms', label: '객실' },
  { href: '#amenities', label: '편의시설' },
  { href: '#location', label: '위치' },
  { href: '#policies', label: '정책' },
  { href: '#reviews', label: '후기' },
];

export function HotelDetailPage() {
  const { hotelId } = useParams();
  const [searchParams] = useSearchParams();
  const searchState = parseSearchParams(searchParams);
  const { adults, checkIn, checkOut, children, deal, destination, rooms } = searchState;
  const hotel = hotels.find((item) => item.id === hotelId);

  useEffect(() => {
    if (!hotel) {
      return;
    }

    trackHotelView(hotel, { adults, checkIn, checkOut, children, deal, destination, rooms });
  }, [adults, checkIn, checkOut, children, deal, destination, hotel, rooms]);

  if (!hotel) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <PageContainer className="py-16 text-center">
          <h1 className="text-2xl font-bold text-ink-900">숙소를 찾을 수 없어요</h1>
          <p className="mt-2 text-ink-500">다른 숙소를 검색해보세요.</p>
          <Link className={buttonClassName({ className: 'mt-6' })} to="/">
            홈으로 이동
          </Link>
        </PageContainer>
      </div>
    );
  }

  const firstRoom = hotel.rooms[0];
  const price = calculatePrice({
    pricePerNight: firstRoom.pricePerNight,
    originalPrice: firstRoom.originalPrice,
    checkIn: searchState.checkIn,
    checkOut: searchState.checkOut,
    rooms: searchState.rooms,
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-0">
      <Header />
      <main>
        <PageContainer className="py-5">
          <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-ink-500" aria-label="Breadcrumb">
            <Link className="hover:text-loop-700" to="/">
              홈
            </Link>
            <ChevronRight size={15} aria-hidden="true" />
            <Link className="hover:text-loop-700" to={`/search?${createSearchParams(searchState)}`}>
              {hotel.destination} 숙소
            </Link>
            <ChevronRight size={15} aria-hidden="true" />
            <span>{hotel.neighborhood}</span>
          </nav>

          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-amber-500">{getStars(hotel.starRating)}</span>
                {hotel.badge ? <Badge>{hotel.badge}</Badge> : null}
                {hotel.refundable ? <Badge tone="green">무료 취소 가능</Badge> : null}
              </div>
              <h1 className="text-3xl font-bold text-ink-900 sm:text-4xl">{hotel.name}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-500">
                <MapPin size={16} aria-hidden="true" />
                {hotel.address} · {hotel.distanceText}
              </p>
              <div className="mt-3">
                <RatingBadge rating={hotel.guestRating} reviewCount={hotel.reviewCount} />
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 shadow-sm hover:bg-slate-50" type="button">
              <Share2 size={16} aria-hidden="true" />
              공유
            </button>
          </div>

          <HotelGallery hotel={hotel} />

          <nav className="sticky top-16 z-30 mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white px-2 py-2 shadow-sm" aria-label="상세 섹션">
            <div className="flex min-w-max gap-1">
              {detailTabs.map((tab) => (
                <a key={tab.href} className="rounded-md px-4 py-2 text-sm font-bold text-ink-700 hover:bg-loop-50 hover:text-loop-700" href={tab.href}>
                  {tab.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-6">
              <section id="overview" className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-bold text-ink-900">숙소 개요</h2>
                <p className="mt-3 leading-7 text-ink-600">{hotel.description}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {hotel.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 text-sm font-semibold text-ink-700">
                      <ShieldCheck size={18} className="text-emerald-600" aria-hidden="true" />
                      {highlight}
                    </div>
                  ))}
                </div>
              </section>

              <section id="amenities" className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-bold text-ink-900">인기 편의시설</h2>
                <div className="mt-4">
                  <AmenityList amenities={hotel.amenities} />
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    ['인터넷', '전 객실 및 공용 공간 무료 Wi-Fi'],
                    ['주차/교통', hotel.amenities.includes('공항 셔틀') ? '공항 셔틀 및 주차 가능' : '주차 가능 객실 옵션 제공'],
                    ['식음료', hotel.amenities.includes('조식 가능') ? '조식 가능, 주변 레스토랑 다수' : '주변 식당과 카페 이용 편리'],
                    ['객실', '금연 객실, 에어컨, 업무용 데스크'],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-slate-50 p-4">
                      <h3 className="font-bold text-ink-900">{label}</h3>
                      <p className="mt-1 text-sm text-ink-600">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section id="rooms" className="scroll-mt-32">
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-ink-900">객실 선택</h2>
                  <p className="mt-2 text-sm text-ink-500">{formatDateRange(searchState.checkIn, searchState.checkOut)} · 객실 {searchState.rooms}개 기준 요금입니다.</p>
                </div>
                <div className="space-y-4">
                  {hotel.rooms.map((room) => (
                    <RoomCard key={room.id} hotel={hotel} room={room} searchState={searchState} />
                  ))}
                </div>
              </section>

              <section id="location" className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-xl font-bold text-ink-900">위치 정보</h2>
                <p className="mt-2 text-sm text-ink-500">{hotel.address}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {['주요 관광지와 대중교통 접근성이 좋아요.', `${hotel.neighborhood} 중심 지역까지 편하게 이동할 수 있어요.`, '주변에 식당, 카페, 편의시설이 모여 있어요.'].map((item) => (
                    <p key={item} className="rounded-lg bg-slate-50 p-4 text-sm font-semibold leading-6 text-ink-700">
                      {item}
                    </p>
                  ))}
                </div>
              </section>

              <PolicySection policies={hotel.policies} />
              <ReviewSummary hotel={hotel} />
            </div>

            <div className="hidden lg:block">
              <div className="sticky top-36">
                <BookingPanel hotel={hotel} selectedRoom={firstRoom} searchState={searchState} />
              </div>
            </div>
          </div>
        </PageContainer>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-lift lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-ink-500">총 {formatCurrency(price.total)}</p>
            <p className="text-lg font-bold text-ink-900">{formatCurrency(firstRoom.pricePerNight)} / 1박</p>
          </div>
          <a className={buttonClassName({})} href="#rooms">
            객실 선택
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
