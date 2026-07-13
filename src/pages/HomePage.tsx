import { MapPin, ShieldCheck, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdSlot } from '../components/ads/AdSlot';
import { Badge } from '../components/common/Badge';
import { SectionTitle } from '../components/common/SectionTitle';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { SearchBox } from '../components/search/SearchBox';
import { destinations } from '../data/destinations';
import { hotels } from '../data/hotels';
import { formatCurrency } from '../utils/format';
import { createSearchParams, DEFAULT_SEARCH_STATE } from '../utils/searchParams';

const HERO_IMAGE = '/stayloop/hero/home-hero.jpg';

function PromotionBanner() {
  return (
    <PageContainer className="pt-8">
      <AdSlot slotId="C1_MAIN_TOP" className="min-h-[11rem] sm:min-h-[12rem]" />
    </PageContainer>
  );
}

export function HomePage() {
  const featuredHotels = hotels.filter((hotel) => hotel.badge).slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header transparent />
      <main>
        <section className="relative overflow-hidden bg-loop-900">
          <img className="absolute inset-0 h-full w-full object-cover opacity-45" src={HERO_IMAGE} alt="도시 호텔 라운지 전경" />
          <div className="absolute inset-0 bg-loop-900/55" />
          <PageContainer className="relative pb-10 pt-14 sm:pb-12 sm:pt-16 lg:pb-16">
            <div className="max-w-3xl text-white">
              <Badge tone="green" className="mb-4 bg-white/95">
                <ShieldCheck size={14} aria-hidden="true" />
                무료 취소 숙소를 한눈에 비교
              </Badge>
              <h1 className="text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                <span className="block sm:inline">좋은 숙소에서</span>
                <span className="block sm:inline sm:ml-3">시작되는 여행</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
                <span className="block sm:inline">도시 호텔부터 오션뷰 리조트까지,</span>
                <span className="block sm:inline sm:ml-1">예약 전 정보를 편하게 확인하세요.</span>
              </p>
            </div>
            <div className="mt-8 max-w-6xl">
              <SearchBox />
            </div>
          </PageContainer>
        </section>

        <PromotionBanner />

        <PageContainer className="py-10">
          <SectionTitle
            eyebrow="인기 여행지"
            title="이번 시즌 많이 찾는 숙소 지역"
            description="도심 호텔부터 해변 리조트까지, 여행 스타일에 맞는 지역을 골라보세요."
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {destinations.slice(0, 8).map((destination) => (
              <Link
                key={destination.id}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift"
                to={`/search?${createSearchParams({ ...DEFAULT_SEARCH_STATE, destination: destination.id })}`}
              >
                <div className="image-fallback h-36 overflow-hidden">
                  <img
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    src={destination.image}
                    alt={`${destination.name} 여행지`}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-ink-900">{destination.name}</h3>
                    <span className="text-xs font-semibold text-loop-700">{destination.hotelCountLabel}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-ink-500">{destination.description}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                    <MapPin size={14} aria-hidden="true" />
                    {destination.popularAreas.slice(0, 3).join(' · ')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </PageContainer>

        <PageContainer className="py-10">
          <SectionTitle eyebrow="추천 숙소" title="지금 예약하기 좋은 StayLoop 추천" description="평점, 위치, 취소 정책을 함께 살펴볼 수 있는 인기 숙소입니다." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {featuredHotels.map((hotel) => (
              <Link
                key={hotel.id}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lift"
                to={`/hotel/${hotel.id}?${createSearchParams(DEFAULT_SEARCH_STATE)}`}
              >
                <div className="image-fallback relative h-48 overflow-hidden">
                  <img
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    src={hotel.images[0]}
                    alt={`${hotel.name} 숙소 사진`}
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                  {hotel.badge ? <Badge className="absolute left-3 top-3 bg-white">{hotel.badge}</Badge> : null}
                </div>
                <div className="p-4">
                  <p className="flex items-center gap-1 text-sm font-semibold text-amber-500">
                    <Star size={15} fill="currentColor" aria-hidden="true" />
                    {hotel.starRating}성급 · {hotel.destination} {hotel.neighborhood}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-ink-900">{hotel.name}</h3>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="text-sm font-semibold text-loop-700">
                      {hotel.guestRating.toFixed(1)} {hotel.reviewCount.toLocaleString('ko-KR')}개 후기
                    </p>
                    <p className="text-right">
                      <span className="block text-xs text-ink-500">1박</span>
                      <span className="text-lg font-bold text-ink-900">{formatCurrency(hotel.pricePerNight)}</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}
