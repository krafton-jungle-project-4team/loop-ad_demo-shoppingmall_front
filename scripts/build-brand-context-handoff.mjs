import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPT_DIR, '..');
const SOURCE_ASSET_ROOT = path.join(REPO_ROOT, 'public', 'stayloop');
const SOURCE_MANIFEST_PATH = path.join(SOURCE_ASSET_ROOT, 'manifest.json');
const SOURCE_BRAND_KIT_PATH = path.join(REPO_ROOT, 'brand-context', 'brand-kit.json');
const SOURCE_LOGO_ROOT = path.join(REPO_ROOT, 'public', 'brand_logo');

const PROJECT_ID = 'demo_project';
const BRAND_ID = 'stayloop';
const CONTEXT_VERSION = 'v1';
const CREATED_AT = '2026-07-13T00:00:00Z';
const BUNDLE_NAME = `brand-context-handoff-${PROJECT_ID}-${CONTEXT_VERSION}`;
const BUNDLE_ROOT = path.join(REPO_ROOT, BUNDLE_NAME);
const PAYLOAD_ROOT = path.join(BUNDLE_ROOT, 'brand-context', PROJECT_ID);
const GENERATED_ASSET_IDS = new Set([
  'destination-seoul',
  'destination-busan',
  'destination-gyeongju',
  'destination-yeosu',
]);

const HOTEL_IDS = [
  'seoul-loop-city-001',
  'seoul-gangnam-premier-002',
  'seoul-hongdae-artstay-003',
  'seoul-jamsil-river-004',
  'seoul-bukchon-calm-005',
  'jeju-ocean-breeze-006',
  'jeju-aewol-sunset-007',
  'jeju-seongsan-morning-008',
  'jeju-halla-garden-009',
  'busan-blue-harbor-010',
  'busan-gwangalli-wave-011',
  'busan-seomyeon-link-012',
  'gangneung-pine-sea-013',
  'gangneung-anmok-coffee-014',
  'gyeongju-hanok-garden-015',
  'yeosu-night-bay-016',
  'tokyo-urban-terrace-017',
  'tokyo-ginza-light-018',
  'osaka-namba-comfort-019',
  'bangkok-river-sky-020',
];

const DESTINATION_META = {
  seoul: {
    alt: '한강과 산, 도심 불빛이 함께 보이는 서울의 푸른 저녁 전경',
    tags: ['city', 'blue-hour', 'han-river', 'skyline', 'seoul', 'ai-generated'],
    copySpace: ['top-left'],
    focalPoint: [0.58, 0.62],
    active: true,
    contentStatus: 'ai_generated_destination_visual',
    advertisingUse: 'demo_only_ai_generated_human_reviewed',
  },
  jeju: {
    alt: '제주 성산일출봉과 해안 마을을 내려다본 항공 전경',
    tags: ['coast', 'aerial', 'seongsan-ilchulbong', 'jeju'],
    copySpace: ['top-right'],
    focalPoint: [0.45, 0.58],
    active: true,
    contentStatus: 'verified_location',
    advertisingUse: 'allowed_with_attribution_and_share_alike',
  },
  busan: {
    alt: '푸른 바다와 곡선형 해변, 고층 건물이 이어지는 부산 해안 전경',
    tags: ['city', 'coast', 'beach', 'skyline', 'busan', 'ai-generated'],
    copySpace: ['top-left'],
    focalPoint: [0.62, 0.58],
    active: true,
    contentStatus: 'ai_generated_destination_visual',
    advertisingUse: 'demo_only_ai_generated_human_reviewed',
  },
  gangneung: {
    alt: '잔잔한 파도와 햇빛이 비치는 모래 해변',
    tags: ['beach', 'sea', 'sunrise', 'gangneung', 'generic-location'],
    copySpace: ['top-left'],
    focalPoint: [0.58, 0.54],
    active: true,
    contentStatus: 'generic_location_illustration',
    advertisingUse: 'demo_only_location_unverified',
  },
  gyeongju: {
    alt: '초록빛 왕릉 고분군과 한옥 지붕, 낮은 산이 보이는 경주 전경',
    tags: ['heritage', 'royal-tombs', 'hanok', 'gyeongju', 'ai-generated'],
    copySpace: ['top-left'],
    focalPoint: [0.68, 0.6],
    active: true,
    contentStatus: 'ai_generated_destination_visual',
    advertisingUse: 'demo_only_ai_generated_human_reviewed',
  },
  yeosu: {
    alt: '섬이 이어진 바다와 항구, 해안 도시가 보이는 여수의 노을 전경',
    tags: ['coast', 'harbor', 'islands', 'cable-car', 'yeosu', 'ai-generated'],
    copySpace: ['top-left'],
    focalPoint: [0.62, 0.6],
    active: true,
    contentStatus: 'ai_generated_destination_visual',
    advertisingUse: 'demo_only_ai_generated_human_reviewed',
  },
  tokyo: {
    alt: '네온 간판과 보행자가 보이는 도쿄의 번화가 교차로',
    tags: ['city', 'night', 'neon', 'street', 'tokyo'],
    copySpace: ['top-right'],
    focalPoint: [0.5, 0.56],
    active: true,
    contentStatus: 'visually_consistent_location',
    advertisingUse: 'demo_only_third_party_rights_unverified',
  },
  osaka: {
    alt: '통천각과 상점 간판이 보이는 오사카 거리',
    tags: ['city', 'street', 'tsutenkaku', 'osaka'],
    copySpace: ['top-right'],
    focalPoint: [0.55, 0.42],
    active: true,
    contentStatus: 'visually_consistent_location',
    advertisingUse: 'demo_only_third_party_rights_unverified',
  },
  bangkok: {
    alt: '툭툭과 네온 간판이 보이는 비 내린 방콕 야시장 거리',
    tags: ['city', 'night', 'tuk-tuk', 'street', 'bangkok'],
    copySpace: ['top-right'],
    focalPoint: [0.52, 0.62],
    active: true,
    contentStatus: 'visually_consistent_location',
    advertisingUse: 'demo_only_third_party_rights_unverified',
  },
};

const HOTEL_META = [
  ['야자수 리조트의 야외 수영장과 선베드', ['resort', 'pool', 'palm-tree', 'exterior'], ['top-left'], [0.5, 0.62]],
  ['해 질 무렵 흰색 리조트 건물 앞 야외 수영장', ['resort', 'pool', 'twilight', 'exterior'], ['top-left'], [0.55, 0.58]],
  ['바다를 내려다보는 인피니티 풀과 데크 의자', ['resort', 'infinity-pool', 'ocean-view', 'deck'], ['top-left'], [0.52, 0.56]],
  ['산 전망 테라스에 놓인 두 개의 선베드', ['terrace', 'mountain-view', 'sunbed'], ['top-right'], [0.54, 0.54]],
  ['현대식 리조트 건물 앞 넓은 야외 수영장', ['resort', 'pool', 'exterior'], ['top-left'], [0.5, 0.62]],
  ['통유리 욕실이 보이는 자연 소재 호텔 객실', ['hotel-room', 'bed', 'bathroom', 'interior'], ['top-left'], [0.55, 0.58]],
  ['열대 정원 속 리조트 수영장과 방갈로', ['resort', 'pool', 'tropical-garden'], ['top-right'], [0.5, 0.6]],
  ['푸른 저녁 하늘 아래 조명이 켜진 호텔 수영장', ['hotel', 'pool', 'twilight', 'exterior'], ['top-left'], [0.55, 0.64]],
  ['소파와 침대가 함께 있는 클래식 호텔 객실', ['hotel-room', 'bed', 'sofa', 'interior'], ['none'], [0.58, 0.55]],
  ['바다가 보이는 객실 테라스와 라운지 공간', ['hotel-room', 'ocean-view', 'terrace', 'interior'], ['none'], [0.63, 0.53]],
  ['야간 조명이 반사되는 현대식 리조트 수영장', ['resort', 'pool', 'night', 'exterior'], ['top-right'], [0.53, 0.64]],
  ['야자수가 늘어선 햇살 밝은 리조트 수영장', ['resort', 'pool', 'palm-tree', 'daylight'], ['top-right'], [0.5, 0.58]],
  ['대리석과 샹들리에로 꾸민 호텔 로비', ['hotel', 'lobby', 'chandelier', 'interior'], ['none'], [0.5, 0.5]],
  ['짙은 대리석 프런트 데스크와 따뜻한 조명', ['hotel', 'front-desk', 'lobby', 'interior'], ['top-left'], [0.55, 0.56]],
  ['아치형 문과 패턴 카펫이 있는 부티크 호텔 복도', ['hotel', 'hallway', 'boutique', 'interior'], ['left'], [0.52, 0.46]],
  ['높은 통유리창과 도심 전망을 갖춘 호텔 라운지', ['hotel', 'lounge', 'city-view', 'interior'], ['top-right'], [0.52, 0.6]],
  ['목재 벽과 라운지 의자가 있는 밝은 호텔 로비', ['hotel', 'lobby', 'lounge', 'interior'], ['top-right'], [0.55, 0.58]],
  ['복층 구조와 다양한 좌석이 있는 현대식 호텔 로비', ['hotel', 'lobby', 'lounge', 'interior'], ['none'], [0.52, 0.58]],
  ['야자수 정원에 둘러싸인 야외 수영장의 항공 사진', ['resort', 'pool', 'aerial', 'tropical-garden'], ['none'], [0.5, 0.53]],
  ['흐린 날 바다와 산을 내려다보는 리조트 수영장', ['resort', 'pool', 'ocean-view', 'mountain-view'], ['top-right'], [0.52, 0.62]],
];

const ROOM_META = [
  ['회색 침구와 창가 의자가 있는 밝은 침실', ['bedroom', 'double-bed', 'daylight'], ['top-left'], [0.43, 0.58]],
  ['정원 창과 소파가 있는 넓은 객실 거실', ['suite', 'living-room', 'garden-view'], ['top-left'], [0.58, 0.58]],
  ['짙은 목재 벽과 더블 침대가 있는 객실', ['bedroom', 'double-bed', 'dark-wood'], ['top-right'], [0.55, 0.55]],
  ['도시 창문과 회색 헤드보드가 있는 호텔 객실', ['bedroom', 'double-bed', 'city-view'], ['top-left'], [0.53, 0.58]],
  ['나란히 놓인 침대와 간접 조명이 있는 객실', ['bedroom', 'twin-bed', 'ambient-light'], ['top-left'], [0.5, 0.58]],
  ['열대 정원 창과 목재 가구가 있는 따뜻한 객실', ['bedroom', 'double-bed', 'garden-view', 'wood'], ['top-left'], [0.58, 0.58]],
  ['회색 커튼과 낮은 침대가 있는 미니멀 객실', ['bedroom', 'double-bed', 'minimal'], ['top'], [0.53, 0.57]],
  ['남색 헤드보드와 펜던트 조명이 있는 침대', ['bedroom', 'double-bed', 'pendant-light'], ['left'], [0.5, 0.56]],
  ['큰 창과 소파가 있는 밝은 객실 거실', ['suite', 'living-room', 'daylight'], ['top-left'], [0.54, 0.58]],
  ['햇살 드는 창가와 낮은 침대가 있는 열대풍 객실', ['bedroom', 'double-bed', 'sunlight', 'tropical'], ['top-left'], [0.55, 0.58]],
  ['넓은 창과 흰 침구가 있는 도시형 객실', ['bedroom', 'double-bed', 'city-view'], ['top-left'], [0.52, 0.57]],
  ['여러 창과 라운지 의자가 있는 밝은 스위트 거실', ['suite', 'living-room', 'daylight'], ['top-left'], [0.5, 0.56]],
  ['욕조와 세면대가 있는 소형 객실 욕실', ['bathroom', 'bathtub', 'supporting-only'], ['none'], [0.52, 0.52]],
  ['베이지 침구와 벤치가 있는 클래식 침실', ['bedroom', 'king-bed', 'classic'], ['top'], [0.52, 0.56]],
  ['짙은 벽과 채광창이 있는 현대적인 침실', ['bedroom', 'king-bed', 'modern'], ['top-left'], [0.52, 0.57]],
  ['큰 창과 식물이 있는 햇살 밝은 객실 거실', ['suite', 'living-room', 'daylight'], ['top-left'], [0.6, 0.6]],
  ['주방과 소파가 연결된 오픈형 스위트 거실', ['suite', 'living-room', 'kitchen'], ['top-right'], [0.5, 0.58]],
  ['초록색 포인트 침구와 넓은 창이 있는 침실', ['bedroom', 'double-bed', 'city-view'], ['top-left'], [0.48, 0.58]],
  ['큰 나무 아래 잔디 정원이 있는 현대식 숙소 외관', ['property-exterior', 'house', 'garden', 'supporting-only'], ['top-right'], [0.52, 0.55]],
  ['야자수와 수영장이 보이는 리조트 외관', ['resort-exterior', 'pool', 'palm-tree', 'supporting-only'], ['top-left'], [0.53, 0.58]],
];

const BRAND_VOICE = `# StayLoop Brand Voice

## 역할

StayLoop는 숙박 예약을 빠르게 비교하고 예약 전에 필요한 정보를 조용하고 명확하게 보여주는 서비스다. 과장보다 신뢰, 재촉보다 안심, 장식보다 정보 밀도를 우선한다.

## 기본 원칙

- 짧고 분명하게 말한다.
- 숙소 선택에 필요한 이유를 먼저 말한다.
- 가격, 평점, 후기 수, 재고, 할인율은 검증된 데이터만 사용한다.
- 사용자가 위치, 취소 정책, 결제 시점처럼 결정에 필요한 조건을 쉽게 비교하도록 돕는다.
- 근거가 없는 우월·독점·보장 표현을 쓰지 않는다.
- 긴급성 표현은 실제 재고나 기간 데이터와 채널 정책이 모두 허용할 때만 쓴다.

## 권장 문구

- "무료 취소 가능한 숙소를 먼저 비교해보세요."
- "예약 전 위치와 취소 정책을 함께 확인하세요."
- "이번 여행에 맞는 숙소를 조건별로 골라보세요."
- "회원가와 오늘의 특가 숙소를 한눈에 확인하세요."

## 금지 문구

- "최저가 보장"
- "국내 유일"
- "업계 1위"
- "100% 만족"
- "놓치면 후회"
- "마감임박"
- "단 하루"

## 사이트 내 배너

- headline은 한 문장으로 끝낸다.
- CTA는 하나만 둔다.
- 검색 결과 사이드 레일은 한글 12자 안팎의 짧은 headline을 우선한다.
- 이미지가 전달하는 지역·숙소 정보를 문구로 과장하거나 바꾸지 않는다.

## 이메일

- 제목 앞에는 법무 확인된 광고 표기를 붙인다.
- 프리헤더는 혜택보다 비교와 안심의 가치를 설명한다.
- 가격, 평점, CTA, 배지는 이미지가 아니라 HTML 텍스트로 렌더한다.
- 수신자별 추천 근거를 단정적인 사실처럼 표현하지 않는다.

## SMS

- 한 문장 안에 제안, 링크, 수신거부 경로를 모두 넣는다.
- 자동 절삭하지 않는다.
- 이모지를 사용하지 않는다.
- 실제 유효 기간과 재고가 없는 긴급성 문구를 사용하지 않는다.
`;

const PHOTO_RECIPE = `# StayLoop Photo Recipe

## 목적

StayLoop가 보유한 숙소, 여행지, 객실 사진을 광고와 이메일에서 일관되게 선별하고 재사용하기 위한 기준이다. 사진 자체에 가격, 평점, CTA, 배지, 생성 문구를 굽지 않는다.

## 선택 게이트

- manifest에서 \`active=true\`인 asset만 선택한다.
- \`advertising_use\`가 \`blocked\`로 시작하거나 권리 검토 대기인 asset은 선택하지 않는다.
- destination, hotel, room의 \`entity_refs\`가 요청 문맥과 일치하는지 확인한다.
- 실제 지역이나 숙소로 오인될 수 있는 generic 또는 stock 사진은 데모 범위를 벗어나 사용하지 않는다.
- attribution이 필요한 asset은 채널이 출처와 라이선스 링크를 표시할 수 있을 때만 선택한다.

## 공통 기준

- 실제 숙박 경험을 상상할 수 있어야 한다.
- 침구, 수영장, 로비, 외관, 지역 풍경처럼 용도가 분명해야 한다.
- 사람 얼굴이 명확히 보이는 사진은 피한다.
- 어둡거나 흐리거나 피사체가 심하게 잘린 사진은 피한다.
- 배너는 \`copy_space\` 방향과 \`focal_point\`를 사용해 안전하게 crop한다.
- \`copy_space=["none"]\`인 사진 위에는 문구를 직접 겹치지 않는다.

## 사이트 카드

- 대표 이미지는 숙소 유형과 어긋나지 않아야 한다.
- 호텔과 리조트는 외관, 로비, 수영장, 라운지를 우선한다.
- 객실 카드는 침구와 창가가 분명한 사진을 우선한다.
- \`supporting-only\` tag가 있는 욕실, 거실, 외관 사진은 객실 대표 이미지로 쓰지 않는다.
- 여행지 카드는 지역이 검증되거나 최소한 지역 특성과 시각적으로 일치해야 한다.

## 배너

기본 배너는 약 78% 흰 스크림을 사용하는 구성을 전제로 한다.

- 고채도와 충분한 대비를 우선한다.
- 작은 슬롯에서도 주 피사체가 유지되어야 한다.
- 문구는 \`copy_space\`로 표시된 영역에 놓고 \`focal_point\`를 crop 밖으로 밀어내지 않는다.
- 출처 표기가 필요한 asset은 표기 공간을 별도로 확보한다.

## 이메일

- 썸네일은 3:2 비율을 우선한다.
- alt text는 manifest의 \`alt_text\`를 사용한다.
- 가격, 평점, CTA, 배지는 이미지가 아니라 HTML로 렌더한다.
- 세로 이미지나 정사각형 이미지는 focal point를 기준으로 crop하고 핵심 피사체 손실을 확인한다.
`;

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function jpegDimensions(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    throw new Error('Not a JPEG file');
  }

  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);
  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    if (marker === 0x00 || marker === 0xff || marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2;
      continue;
    }

    const segmentLength = bytes.readUInt16BE(offset + 2);
    if (sofMarkers.has(marker)) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + segmentLength;
  }

  throw new Error('JPEG dimensions not found');
}

function hotelEntityRefs(assetIndex) {
  return HOTEL_IDS.flatMap((hotelId, hotelIndex) => {
    const galleryIndices = Array.from({ length: 5 }, (_, offset) => (hotelIndex + offset) % HOTEL_IDS.length);
    if (!galleryIndices.includes(assetIndex)) return [];
    return [
      {
        type: 'hotel',
        id: hotelId,
        usage: hotelIndex === assetIndex ? 'primary' : 'gallery',
      },
    ];
  });
}

function roomEntityRefs(assetIndex) {
  const deluxeHotelIndex = (assetIndex + HOTEL_IDS.length / 2) % HOTEL_IDS.length;
  return [
    {
      type: 'room',
      id: 'standard-double',
      hotel_id: HOTEL_IDS[assetIndex],
      usage: 'room_card',
    },
    {
      type: 'room',
      id: 'deluxe-king',
      hotel_id: HOTEL_IDS[deluxeHotelIndex],
      usage: 'room_card',
    },
  ];
}

function sourceAssetPath(sourceAsset) {
  const prefix = '/stayloop/';
  if (!sourceAsset.localPath.startsWith(prefix)) {
    throw new Error(`${sourceAsset.id}: unexpected source path ${sourceAsset.localPath}`);
  }
  return path.join(SOURCE_ASSET_ROOT, sourceAsset.localPath.slice(prefix.length));
}

function imageMetadata(sourceAsset) {
  if (sourceAsset.id === 'home-hero') {
    return {
      role: 'hero',
      alt: '야자수와 선베드가 둘러싼 StayLoop 리조트 야외 수영장',
      tags: ['brand', 'hero', 'resort', 'pool', 'palm-tree'],
      copySpace: ['top'],
      focalPoint: [0.5, 0.62],
      entityRefs: [{ type: 'brand', id: BRAND_ID }],
      active: true,
      contentStatus: 'illustrative_demo_stock',
      advertisingUse: 'demo_only_third_party_rights_unverified',
    };
  }

  if (sourceAsset.id.startsWith('destination-')) {
    const destinationId = sourceAsset.id.slice('destination-'.length);
    const meta = DESTINATION_META[destinationId];
    if (!meta) throw new Error(`${sourceAsset.id}: missing destination metadata`);
    return {
      role: 'destination',
      ...meta,
      entityRefs: [{ type: 'destination', id: destinationId }],
    };
  }

  if (sourceAsset.id.startsWith('hotel-')) {
    const assetIndex = Number(sourceAsset.id.slice('hotel-'.length)) - 1;
    const [alt, tags, copySpace, focalPoint] = HOTEL_META[assetIndex] ?? [];
    if (!alt) throw new Error(`${sourceAsset.id}: missing hotel metadata`);
    return {
      role: 'hotel',
      alt,
      tags: ['hotel-gallery', ...tags],
      copySpace,
      focalPoint,
      entityRefs: hotelEntityRefs(assetIndex),
      primary_entity_ref: { type: 'hotel', id: HOTEL_IDS[assetIndex] },
      active: true,
      contentStatus: 'illustrative_demo_stock',
      advertisingUse: 'demo_only_third_party_rights_unverified',
    };
  }

  if (sourceAsset.id.startsWith('room-')) {
    const assetIndex = Number(sourceAsset.id.slice('room-'.length)) - 1;
    const [alt, tags, copySpace, focalPoint] = ROOM_META[assetIndex] ?? [];
    if (!alt) throw new Error(`${sourceAsset.id}: missing room metadata`);
    return {
      role: 'room',
      alt,
      tags: ['room-gallery', ...tags],
      copySpace,
      focalPoint,
      entityRefs: roomEntityRefs(assetIndex),
      active: true,
      contentStatus: tags.includes('supporting-only') ? 'illustrative_demo_supporting_stock' : 'illustrative_demo_stock',
      advertisingUse: 'demo_only_third_party_rights_unverified',
    };
  }

  throw new Error(`${sourceAsset.id}: unsupported asset id`);
}

function rightsMetadata(sourceAsset, meta) {
  if (GENERATED_ASSET_IDS.has(sourceAsset.id)) {
    return {
      source_url: `urn:openai:imagegen:stayloop:${sourceAsset.id}:v1`,
      source_page_url: null,
      source_type: 'ai_generated',
      ai_generated: true,
      generation_provider: 'OpenAI image generation',
      license: 'OpenAI Terms of Use — output ownership provision',
      license_url: 'https://openai.com/policies/terms-of-use/',
      attribution_required: false,
      attribution_text: null,
      commercial_use_permitted_by_license: true,
      advertising_use: meta.advertisingUse,
      rights_notes:
        'OpenAI assigns its rights in Output to the user to the extent permitted by law. Output may be non-unique or inaccurate; this image was human-reviewed for StayLoop demo suitability and must not be represented as a documentary photograph.',
    };
  }

  if (sourceAsset.id === 'destination-seoul') {
    return {
      source_url: sourceAsset.sourceUrl,
      source_page_url: 'https://commons.wikimedia.org/wiki/File:Seoul_(175734251)_(cropped).jpg',
      license: 'Creative Commons Attribution-ShareAlike 3.0 Unported',
      license_url: 'https://creativecommons.org/licenses/by-sa/3.0/',
      attribution_required: true,
      attribution_text: 'Seoul — Joon Kyu Park, CC BY-SA 3.0; Wikimedia Commons 960 px derivative; no further changes.',
      commercial_use_permitted_by_license: true,
      advertising_use: meta.advertisingUse,
      rights_notes: meta.rightsNotes,
    };
  }

  if (sourceAsset.id === 'destination-jeju') {
    return {
      source_url: sourceAsset.sourceUrl,
      source_page_url: 'https://commons.wikimedia.org/wiki/File:Seongsan_Ilchulbong_from_the_air.jpg',
      license: 'Creative Commons Attribution-ShareAlike 2.0 Generic',
      license_url: 'https://creativecommons.org/licenses/by-sa/2.0/',
      attribution_required: true,
      attribution_text:
        'Seongsan Ilchulbong from the air — Korea.net / Korean Culture and Information Service, CC BY-SA 2.0; Wikimedia Commons 960 px derivative; no further changes.',
      commercial_use_permitted_by_license: true,
      advertising_use: meta.advertisingUse,
      rights_notes: 'Attribution, license link, change notice, and ShareAlike conditions must be preserved.',
    };
  }

  return {
    source_url: sourceAsset.sourceUrl,
    source_page_url: null,
    license: 'Unsplash License',
    license_url: 'https://unsplash.com/license',
    attribution_required: false,
    attribution_text: null,
    commercial_use_permitted_by_license: true,
    advertising_use: meta.advertisingUse,
    rights_notes:
      meta.rightsNotes ??
      'Unsplash permits commercial use without attribution, but model, property, artwork, and trademark releases were not independently verified. Limit to the StayLoop demo until that review is complete.',
  };
}

async function writePayload(relativeKey, contents) {
  const outputPath = path.join(BUNDLE_ROOT, relativeKey);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, contents);
  const bytes = await readFile(outputPath);
  return {
    outputPath,
    sha256: sha256(bytes),
    byte_size: bytes.length,
  };
}

async function copyPayload(sourcePath, relativeKey) {
  const outputPath = path.join(BUNDLE_ROOT, relativeKey);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await copyFile(sourcePath, outputPath);
  const bytes = await readFile(outputPath);
  return {
    outputPath,
    sha256: sha256(bytes),
    byte_size: bytes.length,
    bytes,
  };
}

async function buildImageAssets(sourceAssets) {
  const assets = [];

  for (const sourceAsset of sourceAssets) {
    const meta = imageMetadata(sourceAsset);
    const sourcePath = sourceAssetPath(sourceAsset);
    const sourceFile = await stat(sourcePath);
    if (sourceFile.size !== sourceAsset.bytes) {
      throw new Error(`${sourceAsset.id}: source byte size differs from source manifest`);
    }

    const s3Key = `brand-context/${PROJECT_ID}/assets/${sourceAsset.id}/${CONTEXT_VERSION}/original.jpg`;
    const copied = await copyPayload(sourcePath, s3Key);
    const dimensions = jpegDimensions(copied.bytes);
    const rights = rightsMetadata(sourceAsset, meta);

    assets.push({
      asset_id: sourceAsset.id,
      version: CONTEXT_VERSION,
      role: meta.role,
      s3_key: s3Key,
      sha256: copied.sha256,
      content_type: 'image/jpeg',
      byte_size: copied.byte_size,
      ...dimensions,
      locale: 'ko-KR',
      tags: meta.tags,
      alt_text: meta.alt,
      copy_space: meta.copySpace,
      focal_point: { x: meta.focalPoint[0], y: meta.focalPoint[1], unit: 'normalized' },
      entity_refs: meta.entityRefs,
      ...(meta.primary_entity_ref ? { primary_entity_ref: meta.primary_entity_ref } : {}),
      content_status: meta.contentStatus,
      ...rights,
      rights_reviewed_at: '2026-07-13',
      rights_review_scope: 'source license and visual demo suitability; not legal clearance',
      active: meta.active,
    });
  }

  return assets;
}

async function buildLogoAsset(assetId, filename, role, viewBox) {
  const sourcePath = path.join(SOURCE_LOGO_ROOT, filename);
  const sourceText = await readFile(sourcePath, 'utf8');
  const unsafeSvgPattern = /<script|javascript:|on[a-z]+\s*=|<image|<use|(?:xlink:)?href\s*=|url\s*\(/i;
  if (unsafeSvgPattern.test(sourceText)) {
    throw new Error(`${assetId}: SVG contains a disallowed script or external-resource feature`);
  }
  if (!sourceText.includes(`viewBox="${viewBox}"`)) {
    throw new Error(`${assetId}: unexpected SVG viewBox`);
  }

  const s3Key = `brand-context/${PROJECT_ID}/assets/${assetId}/${CONTEXT_VERSION}/original.svg`;
  const copied = await copyPayload(sourcePath, s3Key);
  return {
    asset_id: assetId,
    version: CONTEXT_VERSION,
    role,
    s3_key: s3Key,
    sha256: copied.sha256,
    content_type: 'image/svg+xml',
    byte_size: copied.byte_size,
    view_box: viewBox,
    locale: 'ko-KR',
    tags: ['brand', 'logo', role],
    alt_text: role === 'logo_full' ? 'StayLoop 전체 로고' : 'StayLoop 심볼 로고',
    copy_space: ['none'],
    focal_point: { x: 0.5, y: 0.5, unit: 'normalized' },
    entity_refs: [{ type: 'brand', id: BRAND_ID }],
    content_status: 'project_supplied_brand_asset',
    source_url: `urn:stayloop:brand-asset:${assetId}:${CONTEXT_VERSION}`,
    source_page_url: null,
    license: 'StayLoop project-supplied brand asset',
    license_url: null,
    attribution_required: false,
    attribution_text: null,
    commercial_use_permitted_by_license: true,
    advertising_use: 'stayloop_project_use',
    rights_notes: 'Supplied as a StayLoop project brand asset; confirm brand ownership before use outside this project.',
    rights_reviewed_at: '2026-07-13',
    rights_review_scope: 'project provenance and SVG safety; not legal clearance',
    active: true,
  };
}

async function build() {
  const sourceManifest = JSON.parse(await readFile(SOURCE_MANIFEST_PATH, 'utf8'));
  if (sourceManifest.failures?.length) throw new Error('Source manifest contains download failures');
  if (sourceManifest.assets.length !== 50) throw new Error(`Expected 50 image assets, found ${sourceManifest.assets.length}`);
  if (HOTEL_META.length !== 20 || ROOM_META.length !== 20 || HOTEL_IDS.length !== 20) {
    throw new Error('Hotel and room metadata must contain exactly 20 entries');
  }

  await rm(BUNDLE_ROOT, { recursive: true, force: true });
  await mkdir(PAYLOAD_ROOT, { recursive: true });

  const assets = await buildImageAssets(sourceManifest.assets);
  assets.push(await buildLogoAsset('logo-full', 'logo_full.svg', 'logo_full', '0 0 132 36'));
  assets.push(await buildLogoAsset('logo-symbol', 'logo_symbol.svg', 'logo_symbol', '0 0 36 36'));
  assets.sort((a, b) => a.asset_id.localeCompare(b.asset_id));

  const guideSpecs = [
    {
      guide_id: 'brand-voice',
      applies_to: ['email', 'onsite_banner', 'sms'],
      content: BRAND_VOICE,
    },
    {
      guide_id: 'photo-recipe',
      applies_to: ['email', 'onsite_banner'],
      content: PHOTO_RECIPE,
    },
  ];
  const guidelines = [];
  for (const guide of guideSpecs) {
    const s3Key = `brand-context/${PROJECT_ID}/guidelines/${guide.guide_id}/${CONTEXT_VERSION}/content.md`;
    const file = await writePayload(s3Key, guide.content);
    guidelines.push({
      guide_id: guide.guide_id,
      version: CONTEXT_VERSION,
      s3_key: s3Key,
      sha256: file.sha256,
      content_type: 'text/markdown; charset=utf-8',
      byte_size: file.byte_size,
      required: true,
      applies_to: guide.applies_to,
    });
  }

  const brandKit = JSON.parse(await readFile(SOURCE_BRAND_KIT_PATH, 'utf8'));
  brandKit.logo = {
    full: {
      assetId: 'logo-full',
      role: 'logo_full',
      colorMode: 'fixed',
    },
    symbol: {
      assetId: 'logo-symbol',
      role: 'logo_symbol',
      colorMode: 'fixed',
    },
  };
  brandKit.notes = [
    'Runtime brand kit for renderers and generation.',
    'Do not store prices, review counts, inventory, or generated campaign copy in this file.',
    'Use sRGB values for email and non-browser renderers.',
    'Resolve logo variants through stable asset IDs in the brand-context manifest.',
  ];
  const brandKitKey = `brand-context/${PROJECT_ID}/brand-kits/${CONTEXT_VERSION}/brand-kit.json`;
  const brandKitFile = await writePayload(brandKitKey, json(brandKit));

  const manifestKey = `brand-context/${PROJECT_ID}/manifests/${CONTEXT_VERSION}/manifest.json`;
  const manifest = {
    schema_version: 'loopad.brand-context-manifest.v1',
    project_id: PROJECT_ID,
    brand_id: BRAND_ID,
    context_version: CONTEXT_VERSION,
    created_at: CREATED_AT,
    brand_kit: {
      version: CONTEXT_VERSION,
      s3_key: brandKitKey,
      sha256: brandKitFile.sha256,
      content_type: 'application/json; charset=utf-8',
      byte_size: brandKitFile.byte_size,
    },
    guidelines,
    assets,
    catalogs: [],
  };
  const manifestFile = await writePayload(manifestKey, json(manifest));

  const current = {
    schema_version: 'loopad.brand-context-pointer.v1',
    project_id: PROJECT_ID,
    context_version: CONTEXT_VERSION,
    manifest_key: manifestKey,
    manifest_sha256: manifestFile.sha256,
  };
  await writePayload(`brand-context/${PROJECT_ID}/current.json`, json(current));

  const payloadFiles = [
    ...assets.map((asset) => asset.s3_key),
    ...guidelines.map((guide) => guide.s3_key),
    brandKitKey,
    manifestKey,
    `brand-context/${PROJECT_ID}/current.json`,
  ].sort();
  const checksumLines = [];
  for (const relativeKey of payloadFiles) {
    const bytes = await readFile(path.join(BUNDLE_ROOT, relativeKey));
    checksumLines.push(`${sha256(bytes)}  ${relativeKey}`);
  }
  await writeFile(path.join(BUNDLE_ROOT, 'checksums.sha256'), `${checksumLines.join('\n')}\n`);

  const inactiveAssets = assets.filter((asset) => !asset.active).map((asset) => asset.asset_id);
  const inactiveAssetSummary = inactiveAssets.length
    ? inactiveAssets.map((assetId) => `\`${assetId}\``).join(', ')
    : 'none';
  const handoff = `# StayLoop Brand Context Handoff

## Bundle identity

- project_id: \`${PROJECT_ID}\`
- brand_id: \`${BRAND_ID}\`
- context_version: \`${CONTEXT_VERSION}\`
- created_at: \`${CREATED_AT}\`
- S3 payload root: \`brand-context/\`

## Payload inventory

- assets: 52 total (${assets.filter((asset) => asset.active).length} active, ${inactiveAssets.length} inactive)
- required guidelines: 2
- brand kits: 1
- versioned manifests: 1
- mutable pointers: 1
- checksum entries: ${payloadFiles.length}

Inactive assets: ${inactiveAssetSummary}.

## Pre-upload Brand/Demo findings

- \`destination-seoul\`, \`destination-busan\`, \`destination-gyeongju\`, \`destination-yeosu\`: replaced with project-generated destination visuals, human-reviewed for StayLoop demo suitability, and active.
- The four replacements are marked \`ai_generated=true\` and must not be represented as documentary photographs. External campaign use still requires normal brand and factual review.
- Unsplash images: the Unsplash License permits commercial use without required attribution, but model/property/artwork/trademark releases were not independently verified. Keep them in the StayLoop demo until that review is complete.
- Hotel and room entity references were derived from the actual frontend image rotation in \`src/data/hotels.ts\`. Room IDs are scoped by \`hotel_id\` because \`standard-double\` and \`deluxe-king\` are reused by every hotel.
- All image dimensions, byte sizes, MIME signatures, SHA-256 values, manifest references, and SVG safety checks are generated from the delivered bytes.

## Infrastructure-owned values (intentionally unresolved in this Brand/Demo bundle)

- AWS account: INFRA_REQUIRED
- environment: INFRA_REQUIRED
- region: INFRA_REQUIRED
- DataStorage bucket identification method: INFRA_REQUIRED
- Brand/Demo contact: OWNER_REQUIRED
- Generation contact: OWNER_REQUIRED

These values must be completed by the responsible owners before upload. Their omission does not change any S3 object key under \`brand-context/\`.

## Required upload order

1. Verify the bundle from its root with \`shasum -a 256 -c checksums.sha256\`.
2. Upload assets, guidelines, and the brand kit under \`brand-context/\`.
3. Verify Content-Type, byte size, and SHA-256 against the manifest.
4. Upload \`${manifestKey}\`.
5. Verify every manifest reference exists and matches its checksum.
6. Upload \`brand-context/${PROJECT_ID}/current.json\` last.
7. Perform the Decision role read smoke test.

Do not upload \`HANDOFF.md\` or \`checksums.sha256\`. Do not run a single whole-directory sync that can expose \`current.json\` before immutable objects are ready.

## Rights review record

- Review date: 2026-07-13
- Review scope: source license pages, attribution terms, visual entity fit, and demo suitability
- Reviewer: Brand/Demo preparation by Codex; not legal counsel
- Legal/brand-owner clearance: still required where the manifest or this document says pending
`;
  await writeFile(path.join(BUNDLE_ROOT, 'HANDOFF.md'), handoff);

  console.log(
    JSON.stringify(
      {
        bundle: BUNDLE_ROOT,
        payload_files: payloadFiles.length,
        assets: assets.length,
        active_assets: assets.filter((asset) => asset.active).length,
        inactive_assets: inactiveAssets,
        manifest_sha256: manifestFile.sha256,
      },
      null,
      2,
    ),
  );
}

await build();
