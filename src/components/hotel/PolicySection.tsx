import type { HotelPolicies } from '../../types/hotel';

type PolicySectionProps = {
  policies: HotelPolicies;
};

export function PolicySection({ policies }: PolicySectionProps) {
  const items = [
    { label: '체크인', value: policies.checkIn },
    { label: '체크아웃', value: policies.checkOut },
    { label: '취소 정책', value: policies.cancellation },
    { label: '반려동물', value: policies.pet },
    { label: '보증금/추가 요금', value: policies.deposit },
  ];

  return (
    <section id="policies" className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="text-xl font-bold text-ink-900">숙소 정책</h2>
      <dl className="mt-4 divide-y divide-slate-100">
        {items.map((item) => (
          <div key={item.label} className="grid gap-2 py-4 sm:grid-cols-[160px_1fr]">
            <dt className="font-semibold text-ink-900">{item.label}</dt>
            <dd className="text-sm leading-6 text-ink-600">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
