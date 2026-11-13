// 샘플 데이터 정의 + 시드 SQL 생성 스크립트
// 실행: node scripts/seed-data.mjs  → supabase/seed/shop_seed.sql 생성
// 상품 사진: Unsplash 무료 라이선스 사진 (scripts/product-photos.json 에 상품별 사진 ID 2개)
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { categoryDetails, productDetails } from "./product-details.mjs";

const photos = JSON.parse(readFileSync(new URL("./product-photos.json", import.meta.url), "utf8"));
export const photoUrl = (id, w = 800) => `https://images.unsplash.com/${id}?w=${w}&h=${w}&fit=crop&q=80&auto=format`;
// 상세페이지 가로형 사진 (가로 1200 × 세로 800)
export const detailPhotoUrl = (id) => `https://images.unsplash.com/photo-${id}?w=1200&h=800&fit=crop&q=80&auto=format`;
const productImages = (slug) => {
  if (!photos[slug]) throw new Error(`사진 없음: ${slug}`);
  return photos[slug].map((id) => photoUrl(id));
};

export const categories = [
  { slug: "mood-lamp", name: "무드등", description: "공간의 온도를 바꾸는 은은한 빛" },
  { slug: "candle", name: "캔들", description: "향과 불빛으로 채우는 휴식" },
  { slug: "vase", name: "화병", description: "꽃 한 송이로 완성되는 계절" },
  { slug: "diffuser", name: "디퓨저", description: "머무는 곳마다 남는 좋은 향" },
  { slug: "objet", name: "오브제", description: "작지만 확실한 공간의 포인트" },
  { slug: "fabric", name: "패브릭", description: "손끝에 닿는 포근한 질감" },
];

export const themes = [
  { slug: "housewarming", name: "집들이", emoji: "🏡", tagline: "새 공간에 은은한 향과 빛을", description: "새 출발을 축하하며 오래 두고 쓰는 소품을 골랐어요." },
  { slug: "birthday", name: "생일", emoji: "🎂", tagline: "한 해의 시작을 따뜻하게", description: "받는 순간 기분이 좋아지는 선물이에요." },
  { slug: "wedding", name: "결혼·신혼", emoji: "💍", tagline: "두 사람의 첫 공간을 채워줄", description: "신혼집 인테리어에 잘 어울리는 감각적인 아이템." },
  { slug: "couple", name: "연인", emoji: "💝", tagline: "마음을 전하는 작은 불빛", description: "기념일에 분위기를 더해줄 로맨틱한 선물." },
  { slug: "thanks", name: "감사·선생님", emoji: "💐", tagline: "고마운 마음을 담아", description: "부담 없이 마음을 전하기 좋은 정갈한 선물." },
  { slug: "christmas", name: "크리스마스·연말", emoji: "🎄", tagline: "한 해의 끝을 포근하게", description: "연말 분위기를 한껏 살려주는 시즌 아이템." },
  { slug: "self", name: "나를 위한 선물", emoji: "🌿", tagline: "수고한 나에게 주는 휴식", description: "오늘의 나를 위한 작은 사치." },
];

// [slug, name, summary, price, sale_price, stock, featured, themes[]]
export const products = {
  "mood-lamp": [
    ["mushroom-mood-lamp", "버섯 무드등", "동글동글한 갓이 귀여운 미니 무드등. 터치 한 번으로 3단계 밝기 조절.", 18000, null, 40, false, ["birthday", "couple", "self"]],
    ["clip-aluminum-lamp", "알루미늄 클립 램프", "책상·선반 어디든 집어 쓰는 클립형 조명.", 19800, 15800, 25, false, ["self", "thanks"]],
    ["pleats-fabric-stand", "패브릭 플리츠 스탠드", "주름 잡힌 패브릭 갓이 빛을 부드럽게 퍼뜨려요.", 39000, null, 18, true, ["housewarming", "wedding"]],
    ["glass-dome-led", "유리 돔 LED 램프", "투명 유리 돔 안에 떠 있는 듯한 빛. USB-C 충전식.", 45000, 39000, 30, false, ["couple", "birthday"]],
    ["wireless-charging-lamp", "무선 충전 무드등", "스마트폰을 올려두면 충전되는 침대 맡 무드등.", 49000, null, 0, false, ["self", "birthday"]],
    ["moon-light", "달 조명", "3D 프린팅 달 표면을 그대로 담은 원형 조명. 원목 받침 포함.", 59000, null, 15, true, ["couple", "christmas"]],
    ["wood-base-table-lamp", "우드 베이스 테이블 램프", "월넛 원목 베이스와 린넨 쉐이드의 클래식 램프.", 89000, 79000, 12, false, ["housewarming", "wedding"]],
    ["rattan-pendant", "라탄 펜던트 조명", "수공예 라탄 쉐이드로 식탁 위에 따뜻한 그림자를.", 129000, null, 6, true, ["housewarming", "wedding"]],
  ],
  candle: [
    ["tealight-24p", "무향 티라이트 24P", "캔들 워머·홀더에 쓰기 좋은 4시간 연소 티라이트.", 9900, null, 50, false, ["self", "christmas"]],
    ["candle-snuffer-set", "캔들 스너퍼 세트", "스너퍼·심지 가위·트레이 3종 세트로 깔끔한 캔들 관리.", 19000, null, 20, false, ["thanks", "self"]],
    ["taper-candle-2p", "테이퍼 캔들 2P", "식탁 분위기를 바꾸는 가늘고 긴 컬러 캔들 두 자루.", 15000, 12000, 35, false, ["couple", "christmas"]],
    ["soy-candle-woody", "소이 캔들 · 우디 앰버", "100% 소이왁스와 나무 심지. 장작 타는 소리가 은은하게.", 32000, null, 40, true, ["housewarming", "birthday", "self"]],
    ["concrete-jar-candle", "콘크리트 용기 캔들", "다 쓴 뒤 화분이나 소품함으로 쓰는 콘크리트 캔들.", 28000, null, 22, false, ["thanks", "housewarming"]],
    ["pillar-candle-set", "필러 캔들 3종 세트", "높이가 다른 무향 필러 캔들 3개. 거실 장식용으로 제격.", 36000, null, 18, false, ["wedding", "christmas"]],
    ["christmas-limited-candle", "크리스마스 리미티드 캔들", "시나몬·전나무 향의 연말 한정 캔들. 골드 리드 포함.", 48000, 42000, 14, true, ["christmas", "couple"]],
    ["candle-warmer-set", "캔들 워머 + 캔들 세트", "불 없이 녹여 향을 내는 워머와 소이 캔들 2개 구성.", 79000, null, 10, false, ["housewarming", "wedding", "self"]],
  ],
  vase: [
    ["mini-ceramic-vase", "미니 세라믹 화병", "한 손에 쏙 들어오는 핸드메이드 미니 화병.", 14000, null, 45, false, ["thanks", "birthday"]],
    ["flower-frog-set", "플라워 프로그 세트", "침봉과 유리 볼 세트로 꽃꽂이를 쉽게.", 18000, null, 20, false, ["self", "thanks"]],
    ["glass-bubble-vase", "유리 버블 화병", "기포가 살아있는 수공예 유리 화병.", 29000, 25000, 30, true, ["housewarming", "birthday"]],
    ["wave-acrylic-vase", "웨이브 아크릴 화병", "물결 모양 반투명 아크릴 화병. 빛을 받으면 더 예뻐요.", 34000, null, 16, false, ["couple", "self"]],
    ["handle-jug-vase", "손잡이 저그 화병", "물병처럼 손잡이가 달린 매트 도자기 화병.", 42000, null, 12, false, ["wedding", "housewarming"]],
    ["dried-flower-vase-set", "드라이플라워 + 화병 세트", "시들지 않는 드라이플라워 다발과 어울리는 화병 세트.", 58000, 52000, 15, true, ["thanks", "birthday", "couple"]],
    ["vintage-ceramic-vase", "빈티지 도자기 화병", "유약이 흘러내린 듯한 빈티지 질감의 중형 화병.", 68000, null, 8, false, ["wedding", "housewarming"]],
    ["terracotta-floor-vase", "대형 테라코타 베이스", "거실 코너를 채우는 60cm 테라코타 플로어 베이스.", 139000, null, 4, false, ["housewarming", "wedding"]],
  ],
  diffuser: [
    ["car-diffuser", "차량용 디퓨저", "송풍구에 꽂는 원목 클립 디퓨저. 향 리필 2개 포함.", 16000, null, 40, false, ["thanks", "self"]],
    ["sachet-3p", "향기 사쉐 3P", "옷장·신발장에 두는 린넨 향주머니 3개.", 12000, null, 50, false, ["thanks", "self"]],
    ["diffuser-refill", "디퓨저 리필 200ml", "기존 디퓨저 병에 채워 쓰는 리필 오일.", 22000, 19000, 35, false, ["self"]],
    ["room-spray", "룸 & 패브릭 스프레이", "커튼·침구에 뿌려 바로 기분 전환.", 26000, null, 28, false, ["birthday", "self"]],
    ["reed-diffuser-200", "리드 디퓨저 200ml", "화이트머스크 · 블랙체리 · 무화과 중 선택. 약 3개월 지속.", 38000, null, 40, true, ["housewarming", "birthday", "thanks"]],
    ["ceramic-oil-burner", "세라믹 오일 버너", "티라이트로 아로마 오일을 데우는 도자기 버너.", 33000, null, 12, false, ["self", "couple"]],
    ["ultrasonic-diffuser", "초음파 아로마 디퓨저", "가습과 향을 동시에. 우드그레인 커버와 7색 무드등.", 69000, 59000, 15, false, ["wedding", "self"]],
    ["housewarming-gift-set", "집들이 디퓨저 기프트 세트", "디퓨저 200ml + 룸스프레이 + 사쉐, 선물 박스 포장.", 98000, 89000, 10, true, ["housewarming", "wedding"]],
  ],
  objet: [
    ["incense-holder", "세라믹 인센스 홀더", "조약돌 모양 인센스 홀더. 인센스 10개 동봉.", 15000, null, 30, false, ["self", "thanks"]],
    ["mini-frame", "미니 원목 액자", "엽서·사진을 끼우는 4x6 원목 액자.", 13000, null, 40, false, ["thanks", "birthday"]],
    ["wood-tray", "원목 트레이", "월넛 원목을 깎아 만든 오벌 트레이. 향초·키링 정리에.", 35000, null, 20, false, ["housewarming", "wedding"]],
    ["plaster-sculpture", "석고 조각 오브제", "얼굴 실루엣 석고 오브제. 책장 포인트로 좋아요.", 29000, 24000, 18, true, ["birthday", "self"]],
    ["candle-holder-objet", "캔들 홀더 오브제", "황동 링 캔들 홀더. 불을 켜지 않아도 오브제로 충분.", 45000, null, 14, false, ["couple", "christmas"]],
    ["hanging-mobile", "황동 모빌", "바람에 천천히 도는 황동 원형 모빌.", 54000, null, 9, false, ["wedding", "christmas"]],
    ["desk-clock", "트래버틴 데스크 시계", "트래버틴 석재 무소음 탁상 시계.", 78000, null, 7, true, ["housewarming", "thanks"]],
    ["marble-bookend", "대리석 북엔드 세트", "무게감 있는 대리석 북엔드 두 개 한 세트.", 112000, 98000, 5, false, ["wedding", "housewarming"]],
  ],
  fabric: [
    ["cotton-tea-mat-2p", "코튼 티매트 2P", "자수가 들어간 코튼 티매트 두 장.", 12000, null, 45, false, ["thanks", "couple"]],
    ["linen-apron", "린넨 앞치마", "워싱 린넨으로 만든 크로스백 앞치마.", 29000, null, 20, false, ["wedding", "housewarming"]],
    ["table-runner", "린넨 테이블 러너", "식탁에 깔면 바로 카페 분위기. 180cm.", 32000, 27000, 25, false, ["wedding", "christmas"]],
    ["linen-cushion-cover", "린넨 쿠션 커버", "45x45 워싱 린넨 쿠션 커버. 5가지 컬러.", 24000, null, 50, true, ["housewarming", "self"]],
    ["fabric-poster", "패브릭 포스터", "드로잉이 프린트된 대형 패브릭 포스터.", 39000, null, 15, false, ["birthday", "couple"]],
    ["rattan-basket", "라탄 수납 바구니", "담요·잡지 수납에 좋은 핸드메이드 라탄 바구니.", 46000, null, 12, false, ["housewarming", "self"]],
    ["knit-blanket", "니트 블랭킷", "도톰한 코튼 니트 블랭킷. 소파 위에 툭 걸쳐두기.", 69000, 59000, 18, true, ["christmas", "couple", "self"]],
    ["fluffy-rug", "극세사 러그", "발에 닿는 감촉이 부드러운 원형 러그 120cm.", 119000, null, 0, false, ["housewarming", "wedding"]],
  ],
};

const q = (s) => (s == null ? "null" : `'${String(s).replace(/'/g, "''")}'`);

// 상품별 상세페이지 정보 만들기 (scripts/product-details.mjs 의 내용을 상품 행 형태로)
export function detailRows() {
  const rows = [];
  for (const c of categories) {
    const cat = categoryDetails[c.slug];
    products[c.slug].forEach(([slug, , summary], i) => {
      const d = productDetails[slug];
      if (!d) throw new Error(`상세 정보 없음: ${slug}`);
      const [size_info, material, components, highlights] = d;
      // 카테고리 상세 사진 4장 중 2장을 상품마다 돌아가며 고르고, 상품 대표 사진과 겹치는 건 건너뜀
      const own = new Set(photos[slug]);
      const pool = cat.photos.filter((id) => !own.has(`photo-${id}`));
      const detail_images = [0, 1].map((k) => detailPhotoUrl(pool[(i * 2 + k) % pool.length]));
      rows.push({
        slug,
        description: `${summary}\n\n${cat.story}`,
        size_info,
        material,
        components,
        care_info: cat.care,
        highlights,
        detail_images,
      });
    });
  }
  return rows;
}

function buildSql() {
  const lines = [
    "-- 샘플 데이터 (scripts/seed-data.mjs 로 생성)",
    "insert into public.shop_categories (slug, name, description, image_url, sort_order) values",
    categories
      .map((c, i) => `  (${q(c.slug)}, ${q(c.name)}, ${q(c.description)}, ${q(productImages(products[c.slug][3][0])[0])}, ${i + 1})`)
      .join(",\n") + "\non conflict (slug) do nothing;",
    "",
    "insert into public.shop_gift_themes (slug, name, emoji, tagline, description, sort_order) values",
    themes
      .map((t, i) => `  (${q(t.slug)}, ${q(t.name)}, ${q(t.emoji)}, ${q(t.tagline)}, ${q(t.description)}, ${i + 1})`)
      .join(",\n") + "\non conflict (slug) do nothing;",
    "",
  ];
  let offset = 0;
  const productRows = [];
  const themeRows = [];
  for (const c of categories) {
    products[c.slug].forEach(([slug, name, summary, price, sale, stock, featured, ths], i) => {
      // 신상품 정렬이 섞이도록 등록일을 분산
      const daysAgo = (offset * 7 + i * 3) % 45;
      productRows.push(
        `  (${q(c.slug)},${q(slug)},${q(name)},${q(summary)},${price},${sale ?? "null"},${stock},${featured},${daysAgo},array[${productImages(slug).map(q).join(",")}])`
      );
      themeRows.push(`  (${q(slug)},'{${ths.join(",")}}')`);
    });
    offset++;
  }
  lines.push(
    "insert into public.shop_products (category_id, slug, name, summary, description, price, sale_price, stock, images, is_featured, created_at)",
    "select c.id, v.slug, v.name, v.summary,",
    "  v.summary || E'\\n\\n공간에 자연스럽게 어우러지도록 차분한 컬러와 소재로 만들었습니다. 선물용 포장이 필요하시면 배송 메모에 남겨주세요.',",
    "  v.price, v.sale_price::int, v.stock, v.images,",
    "  v.featured, now() - make_interval(days => v.days_ago)",
    "from (values",
    productRows.join(",\n"),
    ") as v(category_slug, slug, name, summary, price, sale_price, stock, featured, days_ago, images)",
    "join public.shop_categories c on c.slug = v.category_slug",
    "on conflict (slug) do nothing;",
    "",
    "insert into public.shop_product_themes (product_id, theme_id)",
    "select p.id, t.id from (values",
    themeRows.join(",\n"),
    ") as v(product_slug, theme_slugs)",
    "cross join lateral unnest(v.theme_slugs::text[]) as theme_slug",
    "join public.shop_products p on p.slug = v.product_slug",
    "join public.shop_gift_themes t on t.slug = theme_slug",
    "on conflict do nothing;",
    "",
    "-- 상세페이지 정보 (상세 설명·사진·사이즈·소재·구성·관리 방법)",
    "-- insert 와 달리 update 라서, 시드를 다시 실행하면 기존 상품의 상세 정보도 최신 내용으로 바뀝니다",
    "update public.shop_products p set",
    "  description = v.description, size_info = v.size_info, material = v.material, components = v.components,",
    "  care_info = v.care_info, highlights = v.highlights, detail_images = v.detail_images",
    "from (values",
    detailRows()
      .map(
        (d) =>
          `  (${q(d.slug)},${q(d.description)},${q(d.size_info)},${q(d.material)},${q(d.components)},${q(d.care_info)},array[${d.highlights.map(q).join(",")}],array[${d.detail_images.map(q).join(",")}])`
      )
      .join(",\n"),
    ") as v(slug, description, size_info, material, components, care_info, highlights, detail_images)",
    "where p.slug = v.slug;",
    "",
    "-- 이미 가입되어 있던 사용자에게도 쇼핑몰 프로필 생성",
    "insert into public.shop_profiles (id, name)",
    "select id, raw_user_meta_data ->> 'name' from auth.users",
    "on conflict (id) do nothing;",
    ""
  );
  return lines.join("\n");
}

// 다른 스크립트에서 import 할 때는 파일을 쓰지 않음 (직접 실행할 때만 생성)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  mkdirSync("supabase/seed", { recursive: true });
  writeFileSync("supabase/seed/shop_seed.sql", buildSql());
  console.log("seed sql written");
}
