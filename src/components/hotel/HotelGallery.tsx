import type { Hotel } from '../../types/hotel';

type HotelGalleryProps = {
  hotel: Hotel;
};

export function HotelGallery({ hotel }: HotelGalleryProps) {
  const [mainImage, ...restImages] = hotel.images;

  return (
    <section className="grid gap-2 overflow-hidden rounded-lg md:grid-cols-[2fr_1fr_1fr] md:grid-rows-2">
      <div className="image-fallback min-h-[280px] md:row-span-2">
        <img
          className="h-full w-full object-cover"
          src={mainImage}
          alt={`${hotel.name} 메인 사진`}
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      </div>
      {restImages.slice(0, 4).map((image, index) => (
        <div key={image} className="image-fallback relative min-h-[140px]">
          <img
            className="h-full w-full object-cover"
            src={image}
            alt={`${hotel.name} 갤러리 사진 ${index + 2}`}
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          {index === 3 ? (
            <button className="absolute bottom-3 right-3 rounded-md bg-white px-3 py-2 text-sm font-bold text-ink-900 shadow-card" type="button">
              사진 모두 보기
            </button>
          ) : null}
        </div>
      ))}
    </section>
  );
}
