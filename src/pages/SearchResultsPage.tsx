import { Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AdSlot } from '../components/ads/AdSlot';
import { Button } from '../components/common/Button';
import { Footer } from '../components/layout/Footer';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { HotelCard } from '../components/hotel/HotelCard';
import { FilterSidebar } from '../components/results/FilterSidebar';
import { SortDropdown } from '../components/results/SortDropdown';
import { SearchSummaryBar } from '../components/search/SearchSummaryBar';
import { hotels } from '../data/hotels';
import type { Hotel } from '../types/hotel';
import type { Filters, PriceBucket, SortOption } from '../types/search';
import { getDestinationName } from '../utils/searchParams';
import { createSearchParams, parseSearchParams } from '../utils/searchParams';

const EMPTY_FILTERS: Filters = {
  priceBuckets: [],
  refundable: false,
  payLater: false,
  starRatings: [],
  minRating: null,
  amenities: [],
  propertyTypes: [],
};

function isInPriceBucket(price: number, bucket: PriceBucket): boolean {
  if (bucket === 'under100') return price <= 100000;
  if (bucket === '100to200') return price > 100000 && price <= 200000;
  if (bucket === '200to300') return price > 200000 && price <= 300000;
  return price > 300000;
}

function matchesFilters(hotel: Hotel, filters: Filters): boolean {
  const matchesPrice = filters.priceBuckets.length === 0 || filters.priceBuckets.some((bucket) => isInPriceBucket(hotel.pricePerNight, bucket));
  const matchesRefund = !filters.refundable || hotel.refundable;
  const matchesPayLater = !filters.payLater || hotel.payLater;
  const matchesStars = filters.starRatings.length === 0 || filters.starRatings.includes(hotel.starRating);
  const matchesRating = filters.minRating === null || hotel.guestRating >= filters.minRating;
  const matchesAmenities = filters.amenities.every((amenity) => hotel.amenities.includes(amenity));
  const matchesType = filters.propertyTypes.length === 0 || filters.propertyTypes.includes(hotel.propertyType);

  return matchesPrice && matchesRefund && matchesPayLater && matchesStars && matchesRating && matchesAmenities && matchesType;
}

function sortHotels(items: Hotel[], sortOption: SortOption, deal?: string): Hotel[] {
  return [...items].sort((left, right) => {
    if (deal === 'summer') {
      const leftDealScore = left.originalPrice ? 1 : 0;
      const rightDealScore = right.originalPrice ? 1 : 0;

      if (leftDealScore !== rightDealScore) return rightDealScore - leftDealScore;
    }

    if (sortOption === 'priceLow') return left.pricePerNight - right.pricePerNight;
    if (sortOption === 'ratingHigh') return right.guestRating - left.guestRating;
    if (sortOption === 'starHigh') return right.starRating - left.starRating;
    if (sortOption === 'reviewMany') return right.reviewCount - left.reviewCount;

    return right.guestRating * 100 + right.reviewCount / 100 - (left.guestRating * 100 + left.reviewCount / 100);
  });
}

function ResultsPromotionBanner() {
  return (
    <aside className="lg:sticky lg:top-20">
      <AdSlot slotId="W1_WING" className="min-h-[13rem] lg:min-h-[28rem]" />
    </aside>
  );
}

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchState = parseSearchParams(searchParams);
  const destinationName = getDestinationName(searchState.destination);

  const visibleHotels = useMemo(() => {
    const destinationHotels = searchState.destination ? hotels.filter((hotel) => hotel.destinationId === searchState.destination) : hotels;
    const dealAwareHotels = searchState.deal === 'summer' ? destinationHotels.filter((hotel) => hotel.originalPrice || hotel.badge === '오늘의 특가') : destinationHotels;
    const sourceHotels = dealAwareHotels.length > 0 ? dealAwareHotels : destinationHotels;
    const filteredHotels = sourceHotels.filter((hotel) => matchesFilters(hotel, filters));

    return sortHotels(filteredHotels, sortOption, searchState.deal);
  }, [filters, searchState.deal, searchState.destination, sortOption]);

  const displayCount = visibleHotels.length ? visibleHotels.length + 180 : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <SearchSummaryBar
        searchState={searchState}
        onSearchChange={(nextState) => {
          setSearchParams(createSearchParams(nextState));
        }}
      />
      <main>
        <PageContainer className="py-5">
          <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-loop-700">{searchState.deal === 'summer' ? '여름 특가 숙소' : `${destinationName} 숙소`}</p>
              <h2 className="mt-1 text-2xl font-bold text-ink-900">{displayCount.toLocaleString('ko-KR')}개 숙소를 비교해보세요</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="lg:hidden" variant="outline" onClick={() => setFiltersOpen((current) => !current)}>
                <Filter size={17} aria-hidden="true" />
                필터
              </Button>
              <SortDropdown value={sortOption} onChange={setSortOption} />
            </div>
          </div>

          {filtersOpen ? (
            <div className="mb-4 lg:hidden">
              <FilterSidebar filters={filters} onChange={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} />
            </div>
          ) : null}

          <div className="mb-4 lg:hidden">
            <ResultsPromotionBanner />
          </div>

          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
            <div className="hidden lg:block">
              <FilterSidebar filters={filters} onChange={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} />
            </div>

            <section className="space-y-4" aria-label="검색 결과 숙소 목록">
              {visibleHotels.length > 0 ? (
                visibleHotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} searchState={searchState} />
                ))
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <h3 className="text-xl font-bold text-ink-900">조건에 맞는 숙소가 없어요</h3>
                  <p className="mt-2 text-sm text-ink-500">필터를 줄이거나 다른 날짜로 검색해보세요.</p>
                  <Button className="mt-5" onClick={() => setFilters(EMPTY_FILTERS)}>
                    필터 초기화
                  </Button>
                </div>
              )}
            </section>

            <div className="hidden lg:block">
              <ResultsPromotionBanner />
            </div>
          </div>
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}
