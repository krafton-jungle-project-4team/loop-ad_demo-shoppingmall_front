import { getRatingLabel } from '../../utils/format';

type RatingBadgeProps = {
  rating: number;
  reviewCount?: number;
};

export function RatingBadge({ rating, reviewCount }: RatingBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-md bg-loop-700 px-2 py-1 text-sm font-bold text-white">{rating.toFixed(1)}</span>
      <span className="text-sm font-semibold text-ink-900">{getRatingLabel(rating)}</span>
      {reviewCount ? <span className="text-sm text-ink-500">후기 {reviewCount.toLocaleString('ko-KR')}개</span> : null}
    </div>
  );
}
