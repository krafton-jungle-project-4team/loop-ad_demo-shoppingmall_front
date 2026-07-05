import type { Hotel } from '../../types/hotel';
import { getRatingLabel } from '../../utils/format';
import { RatingBadge } from './RatingBadge';

type ReviewSummaryProps = {
  hotel: Hotel;
};

const breakdownLabels = {
  cleanliness: '청결도',
  service: '서비스',
  location: '위치',
  amenities: '편의시설',
};

export function ReviewSummary({ hotel }: ReviewSummaryProps) {
  return (
    <section id="reviews" className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-bold text-ink-900">후기</h2>
      <div className="mt-4 grid gap-5 lg:grid-cols-[240px_1fr]">
        <div className="rounded-lg bg-loop-50 p-4">
          <RatingBadge rating={hotel.guestRating} reviewCount={hotel.reviewCount} />
          <p className="mt-3 text-sm leading-6 text-ink-700">
            투숙객들은 이 숙소의 {getRatingLabel(hotel.guestRating)} 위치와 객실 컨디션을 높게 평가했습니다.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(hotel.reviewBreakdown).map(([key, value]) => (
            <div key={key}>
              <div className="mb-1 flex justify-between text-sm font-semibold text-ink-700">
                <span>{breakdownLabels[key as keyof typeof breakdownLabels]}</span>
                <span>{value.toFixed(1)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-loop-600" style={{ width: `${value * 10}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {hotel.reviews.map((review) => (
          <article key={review.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-md bg-loop-700 px-2 py-1 text-xs font-bold text-white">{review.rating.toFixed(1)}</span>
              <span className="text-xs font-semibold text-ink-500">{review.tripType}</span>
            </div>
            <h3 className="mt-3 font-bold text-ink-900">{review.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-600">{review.content}</p>
            <p className="mt-3 text-xs text-ink-500">
              {review.author} · {review.date}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
