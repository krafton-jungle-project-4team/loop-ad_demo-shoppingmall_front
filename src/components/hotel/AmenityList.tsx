import type { LucideIcon } from 'lucide-react';
import { Car, Coffee, Dumbbell, PawPrint, Waves, Wifi } from 'lucide-react';

const amenityIconMap: Record<string, LucideIcon> = {
  '무료 Wi-Fi': Wifi,
  '조식 가능': Coffee,
  수영장: Waves,
  '주차 가능': Car,
  '피트니스 센터': Dumbbell,
  '반려동물 동반 가능': PawPrint,
};

type AmenityListProps = {
  amenities: string[];
  limit?: number;
};

export function AmenityList({ amenities, limit = amenities.length }: AmenityListProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {amenities.slice(0, limit).map((amenity) => {
        const Icon = amenityIconMap[amenity];

        return (
          <span key={amenity} className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-ink-700">
            {Icon ? <Icon size={14} aria-hidden="true" /> : null}
            {amenity}
          </span>
        );
      })}
    </div>
  );
}
