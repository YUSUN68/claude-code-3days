-- 샘플 데이터 (scripts/seed-data.mjs 로 생성)
insert into public.shop_categories (slug, name, description, image_url, sort_order) values
  ('mood-lamp', '무드등', '공간의 온도를 바꾸는 은은한 빛', 'https://images.unsplash.com/photo-1793686557904-db1bdedb4d6e?w=800&h=800&fit=crop&q=80&auto=format', 1),
  ('candle', '캔들', '향과 불빛으로 채우는 휴식', 'https://images.unsplash.com/photo-1643122966676-29e8597257f7?w=800&h=800&fit=crop&q=80&auto=format', 2),
  ('vase', '화병', '꽃 한 송이로 완성되는 계절', 'https://images.unsplash.com/photo-1583303515365-cc4731ad721a?w=800&h=800&fit=crop&q=80&auto=format', 3),
  ('diffuser', '디퓨저', '머무는 곳마다 남는 좋은 향', 'https://images.unsplash.com/photo-1632243575963-3143700087ed?w=800&h=800&fit=crop&q=80&auto=format', 4),
  ('objet', '오브제', '작지만 확실한 공간의 포인트', 'https://images.unsplash.com/photo-1604854574894-1be73ca43cb8?w=800&h=800&fit=crop&q=80&auto=format', 5),
  ('fabric', '패브릭', '손끝에 닿는 포근한 질감', 'https://images.unsplash.com/photo-1611489704434-2612dc89c992?w=800&h=800&fit=crop&q=80&auto=format', 6)
on conflict (slug) do nothing;

insert into public.shop_gift_themes (slug, name, emoji, tagline, description, sort_order) values
  ('housewarming', '집들이', '🏡', '새 공간에 은은한 향과 빛을', '새 출발을 축하하며 오래 두고 쓰는 소품을 골랐어요.', 1),
  ('birthday', '생일', '🎂', '한 해의 시작을 따뜻하게', '받는 순간 기분이 좋아지는 선물이에요.', 2),
  ('wedding', '결혼·신혼', '💍', '두 사람의 첫 공간을 채워줄', '신혼집 인테리어에 잘 어울리는 감각적인 아이템.', 3),
  ('couple', '연인', '💝', '마음을 전하는 작은 불빛', '기념일에 분위기를 더해줄 로맨틱한 선물.', 4),
  ('thanks', '감사·선생님', '💐', '고마운 마음을 담아', '부담 없이 마음을 전하기 좋은 정갈한 선물.', 5),
  ('christmas', '크리스마스·연말', '🎄', '한 해의 끝을 포근하게', '연말 분위기를 한껏 살려주는 시즌 아이템.', 6),
  ('self', '나를 위한 선물', '🌿', '수고한 나에게 주는 휴식', '오늘의 나를 위한 작은 사치.', 7)
on conflict (slug) do nothing;

insert into public.shop_products (category_id, slug, name, summary, description, price, sale_price, stock, images, is_featured, created_at)
select c.id, v.slug, v.name, v.summary,
  v.summary || E'\n\n공간에 자연스럽게 어우러지도록 차분한 컬러와 소재로 만들었습니다. 선물용 포장이 필요하시면 배송 메모에 남겨주세요.',
  v.price, v.sale_price::int, v.stock, v.images,
  v.featured, now() - make_interval(days => v.days_ago)
from (values
  ('mood-lamp','mushroom-mood-lamp','버섯 무드등','동글동글한 갓이 귀여운 미니 무드등. 터치 한 번으로 3단계 밝기 조절.',18000,null,40,false,0,array['https://images.unsplash.com/photo-1759199112433-524fbd7a4fa4?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1786325835316-6af65bd31231?w=800&h=800&fit=crop&q=80&auto=format']),
  ('mood-lamp','clip-aluminum-lamp','알루미늄 클립 램프','책상·선반 어디든 집어 쓰는 클립형 조명.',19800,15800,25,false,3,array['https://images.unsplash.com/photo-1585597647877-6eaa01bf9a05?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1582356630861-61bb9b41f541?w=800&h=800&fit=crop&q=80&auto=format']),
  ('mood-lamp','pleats-fabric-stand','패브릭 플리츠 스탠드','주름 잡힌 패브릭 갓이 빛을 부드럽게 퍼뜨려요.',39000,null,18,true,6,array['https://images.unsplash.com/photo-1780140765084-88e4e0d75528?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1792344453007-0a11163b07fc?w=800&h=800&fit=crop&q=80&auto=format']),
  ('mood-lamp','glass-dome-led','유리 돔 LED 램프','투명 유리 돔 안에 떠 있는 듯한 빛. USB-C 충전식.',45000,39000,30,false,9,array['https://images.unsplash.com/photo-1793686557904-db1bdedb4d6e?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1769255119650-f658d3dbc397?w=800&h=800&fit=crop&q=80&auto=format']),
  ('mood-lamp','wireless-charging-lamp','무선 충전 무드등','스마트폰을 올려두면 충전되는 침대 맡 무드등.',49000,null,0,false,12,array['https://images.unsplash.com/photo-1754606581512-222f5ea9d8c9?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1585128719715-46776b56a0d1?w=800&h=800&fit=crop&q=80&auto=format']),
  ('mood-lamp','moon-light','달 조명','3D 프린팅 달 표면을 그대로 담은 원형 조명. 원목 받침 포함.',59000,null,15,true,15,array['https://images.unsplash.com/photo-1632712535563-c30adb9a9e2e?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1549858670-d4fb4a5e0e18?w=800&h=800&fit=crop&q=80&auto=format']),
  ('mood-lamp','wood-base-table-lamp','우드 베이스 테이블 램프','월넛 원목 베이스와 린넨 쉐이드의 클래식 램프.',89000,79000,12,false,18,array['https://images.unsplash.com/photo-1667312939978-64cf31718a6e?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1770226698529-a9c8726949c6?w=800&h=800&fit=crop&q=80&auto=format']),
  ('mood-lamp','rattan-pendant','라탄 펜던트 조명','수공예 라탄 쉐이드로 식탁 위에 따뜻한 그림자를.',129000,null,6,true,21,array['https://images.unsplash.com/photo-1643509877015-c90830bb8519?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1773208411355-30c48123d5fc?w=800&h=800&fit=crop&q=80&auto=format']),
  ('candle','tealight-24p','무향 티라이트 24P','캔들 워머·홀더에 쓰기 좋은 4시간 연소 티라이트.',9900,null,50,false,7,array['https://images.unsplash.com/photo-1516874195056-d83a2cac03a4?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1551077095-ba46221b51ee?w=800&h=800&fit=crop&q=80&auto=format']),
  ('candle','candle-snuffer-set','캔들 스너퍼 세트','스너퍼·심지 가위·트레이 3종 세트로 깔끔한 캔들 관리.',19000,null,20,false,10,array['https://images.unsplash.com/photo-1779905694837-e8f0f75bb0e9?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1485364103940-e8aff191ed1e?w=800&h=800&fit=crop&q=80&auto=format']),
  ('candle','taper-candle-2p','테이퍼 캔들 2P','식탁 분위기를 바꾸는 가늘고 긴 컬러 캔들 두 자루.',15000,12000,35,false,13,array['https://images.unsplash.com/photo-1561212856-44e9bae482aa?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1601922046210-41e129a3e64a?w=800&h=800&fit=crop&q=80&auto=format']),
  ('candle','soy-candle-woody','소이 캔들 · 우디 앰버','100% 소이왁스와 나무 심지. 장작 타는 소리가 은은하게.',32000,null,40,true,16,array['https://images.unsplash.com/photo-1643122966676-29e8597257f7?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1612198526331-66fcc90d67da?w=800&h=800&fit=crop&q=80&auto=format']),
  ('candle','concrete-jar-candle','콘크리트 용기 캔들','다 쓴 뒤 화분이나 소품함으로 쓰는 콘크리트 캔들.',28000,null,22,false,19,array['https://images.unsplash.com/photo-1582881414518-444f39784abd?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1510028735437-476418ee352d?w=800&h=800&fit=crop&q=80&auto=format']),
  ('candle','pillar-candle-set','필러 캔들 3종 세트','높이가 다른 무향 필러 캔들 3개. 거실 장식용으로 제격.',36000,null,18,false,22,array['https://images.unsplash.com/photo-1613068431228-8cb6a1e92573?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1545659446-f03b9dc0827a?w=800&h=800&fit=crop&q=80&auto=format']),
  ('candle','christmas-limited-candle','크리스마스 리미티드 캔들','시나몬·전나무 향의 연말 한정 캔들. 골드 리드 포함.',48000,42000,14,true,25,array['https://images.unsplash.com/photo-1577025728734-7ec67bdb97d0?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1763290808558-921cf9257bf2?w=800&h=800&fit=crop&q=80&auto=format']),
  ('candle','candle-warmer-set','캔들 워머 + 캔들 세트','불 없이 녹여 향을 내는 워머와 소이 캔들 2개 구성.',79000,null,10,false,28,array['https://images.unsplash.com/photo-1759262151253-375c311347c7?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1612293905607-b003de9e54fb?w=800&h=800&fit=crop&q=80&auto=format']),
  ('vase','mini-ceramic-vase','미니 세라믹 화병','한 손에 쏙 들어오는 핸드메이드 미니 화병.',14000,null,45,false,14,array['https://images.unsplash.com/photo-1643569556871-91ec60671ed7?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1526198049595-f32cde2a219d?w=800&h=800&fit=crop&q=80&auto=format']),
  ('vase','flower-frog-set','플라워 프로그 세트','침봉과 유리 볼 세트로 꽃꽂이를 쉽게.',18000,null,20,false,17,array['https://images.unsplash.com/photo-1775765478818-e1ba68e1e136?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1794059758065-02124047a4ca?w=800&h=800&fit=crop&q=80&auto=format']),
  ('vase','glass-bubble-vase','유리 버블 화병','기포가 살아있는 수공예 유리 화병.',29000,25000,30,true,20,array['https://images.unsplash.com/photo-1603178455924-ef33372953bb?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1526998482116-b73831d363fc?w=800&h=800&fit=crop&q=80&auto=format']),
  ('vase','wave-acrylic-vase','웨이브 아크릴 화병','물결 모양 반투명 아크릴 화병. 빛을 받으면 더 예뻐요.',34000,null,16,false,23,array['https://images.unsplash.com/photo-1583303515365-cc4731ad721a?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1610395184276-dde567a2e468?w=800&h=800&fit=crop&q=80&auto=format']),
  ('vase','handle-jug-vase','손잡이 저그 화병','물병처럼 손잡이가 달린 매트 도자기 화병.',42000,null,12,false,26,array['https://images.unsplash.com/photo-1558879860-45f24b366ea1?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1617709391063-18aafa02589f?w=800&h=800&fit=crop&q=80&auto=format']),
  ('vase','dried-flower-vase-set','드라이플라워 + 화병 세트','시들지 않는 드라이플라워 다발과 어울리는 화병 세트.',58000,52000,15,true,29,array['https://images.unsplash.com/photo-1597385326531-bfbf6c51c800?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1613424777445-f93a2a48e285?w=800&h=800&fit=crop&q=80&auto=format']),
  ('vase','vintage-ceramic-vase','빈티지 도자기 화병','유약이 흘러내린 듯한 빈티지 질감의 중형 화병.',68000,null,8,false,32,array['https://images.unsplash.com/photo-1789188190688-54f847492ae2?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1723779232101-19167d4b6e00?w=800&h=800&fit=crop&q=80&auto=format']),
  ('vase','terracotta-floor-vase','대형 테라코타 베이스','거실 코너를 채우는 60cm 테라코타 플로어 베이스.',139000,null,4,false,35,array['https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1631125915597-adf46a94e436?w=800&h=800&fit=crop&q=80&auto=format']),
  ('diffuser','car-diffuser','차량용 디퓨저','송풍구에 꽂는 원목 클립 디퓨저. 향 리필 2개 포함.',16000,null,40,false,21,array['https://images.unsplash.com/photo-1565534355217-85fcfb04ce71?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1764788127543-f7b59ef09783?w=800&h=800&fit=crop&q=80&auto=format']),
  ('diffuser','sachet-3p','향기 사쉐 3P','옷장·신발장에 두는 린넨 향주머니 3개.',12000,null,50,false,24,array['https://images.unsplash.com/photo-1793100123541-68251cb4d08c?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1721415292968-00d546be01e9?w=800&h=800&fit=crop&q=80&auto=format']),
  ('diffuser','diffuser-refill','디퓨저 리필 200ml','기존 디퓨저 병에 채워 쓰는 리필 오일.',22000,19000,35,false,27,array['https://images.unsplash.com/photo-1671493235081-5842463637cd?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1671493234254-15fc6c91aa87?w=800&h=800&fit=crop&q=80&auto=format']),
  ('diffuser','room-spray','룸 & 패브릭 스프레이','커튼·침구에 뿌려 바로 기분 전환.',26000,null,28,false,30,array['https://images.unsplash.com/photo-1632243575963-3143700087ed?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1683559086021-7f5e3b5e11cb?w=800&h=800&fit=crop&q=80&auto=format']),
  ('diffuser','reed-diffuser-200','리드 디퓨저 200ml','화이트머스크 · 블랙체리 · 무화과 중 선택. 약 3개월 지속.',38000,null,40,true,33,array['https://images.unsplash.com/photo-1750433101196-604c1741a012?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1766984702326-1340e8dd38f0?w=800&h=800&fit=crop&q=80&auto=format']),
  ('diffuser','ceramic-oil-burner','세라믹 오일 버너','티라이트로 아로마 오일을 데우는 도자기 버너.',33000,null,12,false,36,array['https://images.unsplash.com/photo-1781947486682-174cc2f06a40?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1729482055512-f4b783f959bd?w=800&h=800&fit=crop&q=80&auto=format']),
  ('diffuser','ultrasonic-diffuser','초음파 아로마 디퓨저','가습과 향을 동시에. 우드그레인 커버와 7색 무드등.',69000,59000,15,false,39,array['https://images.unsplash.com/photo-1768471569643-717e823b5f9a?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1605671507162-43e526ef6f97?w=800&h=800&fit=crop&q=80&auto=format']),
  ('diffuser','housewarming-gift-set','집들이 디퓨저 기프트 세트','디퓨저 200ml + 룸스프레이 + 사쉐, 선물 박스 포장.',98000,89000,10,true,42,array['https://images.unsplash.com/photo-1759563871375-d5b140f6646e?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1638460392258-27e2283cfafb?w=800&h=800&fit=crop&q=80&auto=format']),
  ('objet','incense-holder','세라믹 인센스 홀더','조약돌 모양 인센스 홀더. 인센스 10개 동봉.',15000,null,30,false,28,array['https://images.unsplash.com/photo-1541795083-1b160cf4f3d7?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1551690935-a9e6f0a7e788?w=800&h=800&fit=crop&q=80&auto=format']),
  ('objet','mini-frame','미니 원목 액자','엽서·사진을 끼우는 4x6 원목 액자.',13000,null,40,false,31,array['https://images.unsplash.com/photo-1646006409124-81deb1275459?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1583766432455-7096057dbee3?w=800&h=800&fit=crop&q=80&auto=format']),
  ('objet','wood-tray','원목 트레이','월넛 원목을 깎아 만든 오벌 트레이. 향초·키링 정리에.',35000,null,20,false,34,array['https://images.unsplash.com/photo-1786386729510-81e237c86975?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1524084848619-1161d3c8501a?w=800&h=800&fit=crop&q=80&auto=format']),
  ('objet','plaster-sculpture','석고 조각 오브제','얼굴 실루엣 석고 오브제. 책장 포인트로 좋아요.',29000,24000,18,true,37,array['https://images.unsplash.com/photo-1604854574894-1be73ca43cb8?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1773598770388-f4e9d34bef97?w=800&h=800&fit=crop&q=80&auto=format']),
  ('objet','candle-holder-objet','캔들 홀더 오브제','황동 링 캔들 홀더. 불을 켜지 않아도 오브제로 충분.',45000,null,14,false,40,array['https://images.unsplash.com/photo-1609775324322-6dafcbd21515?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1593102032785-a956eca57454?w=800&h=800&fit=crop&q=80&auto=format']),
  ('objet','hanging-mobile','황동 모빌','바람에 천천히 도는 황동 원형 모빌.',54000,null,9,false,43,array['https://images.unsplash.com/photo-1580192663144-ea9d8436f981?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1523764044152-cc80e15d6ce5?w=800&h=800&fit=crop&q=80&auto=format']),
  ('objet','desk-clock','트래버틴 데스크 시계','트래버틴 석재 무소음 탁상 시계.',78000,null,7,true,1,array['https://images.unsplash.com/photo-1605791767308-46f38113f418?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1740928618840-32cfe6cadc7e?w=800&h=800&fit=crop&q=80&auto=format']),
  ('objet','marble-bookend','대리석 북엔드 세트','무게감 있는 대리석 북엔드 두 개 한 세트.',112000,98000,5,false,4,array['https://images.unsplash.com/photo-1773425350191-ff05d7e59e77?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1759150467057-f09fc8ee0f10?w=800&h=800&fit=crop&q=80&auto=format']),
  ('fabric','cotton-tea-mat-2p','코튼 티매트 2P','자수가 들어간 코튼 티매트 두 장.',12000,null,45,false,35,array['https://images.unsplash.com/photo-1761501597515-252646db6b41?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1774202471416-73445ce7cd32?w=800&h=800&fit=crop&q=80&auto=format']),
  ('fabric','linen-apron','린넨 앞치마','워싱 린넨으로 만든 크로스백 앞치마.',29000,null,20,false,38,array['https://images.unsplash.com/photo-1729774073561-63e64618d935?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1729774091978-9811d5541a34?w=800&h=800&fit=crop&q=80&auto=format']),
  ('fabric','table-runner','린넨 테이블 러너','식탁에 깔면 바로 카페 분위기. 180cm.',32000,27000,25,false,41,array['https://images.unsplash.com/photo-1762638197960-d1ee50ddcff3?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1791054398531-f198b42c1ef4?w=800&h=800&fit=crop&q=80&auto=format']),
  ('fabric','linen-cushion-cover','린넨 쿠션 커버','45x45 워싱 린넨 쿠션 커버. 5가지 컬러.',24000,null,50,true,44,array['https://images.unsplash.com/photo-1611489704434-2612dc89c992?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1611489704164-6f73c62bd810?w=800&h=800&fit=crop&q=80&auto=format']),
  ('fabric','fabric-poster','패브릭 포스터','드로잉이 프린트된 대형 패브릭 포스터.',39000,null,15,false,2,array['https://images.unsplash.com/photo-1763616828230-884d136c2c96?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1761666254267-afe141cdc951?w=800&h=800&fit=crop&q=80&auto=format']),
  ('fabric','rattan-basket','라탄 수납 바구니','담요·잡지 수납에 좋은 핸드메이드 라탄 바구니.',46000,null,12,false,5,array['https://images.unsplash.com/photo-1601330862030-1e08c703ac04?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1793613345120-d820af92668e?w=800&h=800&fit=crop&q=80&auto=format']),
  ('fabric','knit-blanket','니트 블랭킷','도톰한 코튼 니트 블랭킷. 소파 위에 툭 걸쳐두기.',69000,59000,18,true,8,array['https://images.unsplash.com/photo-1693387359607-f48d0a824b1e?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1674475760738-8c7af859f821?w=800&h=800&fit=crop&q=80&auto=format']),
  ('fabric','fluffy-rug','극세사 러그','발에 닿는 감촉이 부드러운 원형 러그 120cm.',119000,null,0,false,11,array['https://images.unsplash.com/photo-1575414003591-ece8d0416c7a?w=800&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1732516405240-da1ba9c7282b?w=800&h=800&fit=crop&q=80&auto=format'])
) as v(category_slug, slug, name, summary, price, sale_price, stock, featured, days_ago, images)
join public.shop_categories c on c.slug = v.category_slug
on conflict (slug) do nothing;

insert into public.shop_product_themes (product_id, theme_id)
select p.id, t.id from (values
  ('mushroom-mood-lamp','{birthday,couple,self}'),
  ('clip-aluminum-lamp','{self,thanks}'),
  ('pleats-fabric-stand','{housewarming,wedding}'),
  ('glass-dome-led','{couple,birthday}'),
  ('wireless-charging-lamp','{self,birthday}'),
  ('moon-light','{couple,christmas}'),
  ('wood-base-table-lamp','{housewarming,wedding}'),
  ('rattan-pendant','{housewarming,wedding}'),
  ('tealight-24p','{self,christmas}'),
  ('candle-snuffer-set','{thanks,self}'),
  ('taper-candle-2p','{couple,christmas}'),
  ('soy-candle-woody','{housewarming,birthday,self}'),
  ('concrete-jar-candle','{thanks,housewarming}'),
  ('pillar-candle-set','{wedding,christmas}'),
  ('christmas-limited-candle','{christmas,couple}'),
  ('candle-warmer-set','{housewarming,wedding,self}'),
  ('mini-ceramic-vase','{thanks,birthday}'),
  ('flower-frog-set','{self,thanks}'),
  ('glass-bubble-vase','{housewarming,birthday}'),
  ('wave-acrylic-vase','{couple,self}'),
  ('handle-jug-vase','{wedding,housewarming}'),
  ('dried-flower-vase-set','{thanks,birthday,couple}'),
  ('vintage-ceramic-vase','{wedding,housewarming}'),
  ('terracotta-floor-vase','{housewarming,wedding}'),
  ('car-diffuser','{thanks,self}'),
  ('sachet-3p','{thanks,self}'),
  ('diffuser-refill','{self}'),
  ('room-spray','{birthday,self}'),
  ('reed-diffuser-200','{housewarming,birthday,thanks}'),
  ('ceramic-oil-burner','{self,couple}'),
  ('ultrasonic-diffuser','{wedding,self}'),
  ('housewarming-gift-set','{housewarming,wedding}'),
  ('incense-holder','{self,thanks}'),
  ('mini-frame','{thanks,birthday}'),
  ('wood-tray','{housewarming,wedding}'),
  ('plaster-sculpture','{birthday,self}'),
  ('candle-holder-objet','{couple,christmas}'),
  ('hanging-mobile','{wedding,christmas}'),
  ('desk-clock','{housewarming,thanks}'),
  ('marble-bookend','{wedding,housewarming}'),
  ('cotton-tea-mat-2p','{thanks,couple}'),
  ('linen-apron','{wedding,housewarming}'),
  ('table-runner','{wedding,christmas}'),
  ('linen-cushion-cover','{housewarming,self}'),
  ('fabric-poster','{birthday,couple}'),
  ('rattan-basket','{housewarming,self}'),
  ('knit-blanket','{christmas,couple,self}'),
  ('fluffy-rug','{housewarming,wedding}')
) as v(product_slug, theme_slugs)
cross join lateral unnest(v.theme_slugs::text[]) as theme_slug
join public.shop_products p on p.slug = v.product_slug
join public.shop_gift_themes t on t.slug = theme_slug
on conflict do nothing;

-- 상세페이지 정보 (상세 설명·사진·사이즈·소재·구성·관리 방법)
-- insert 와 달리 update 라서, 시드를 다시 실행하면 기존 상품의 상세 정보도 최신 내용으로 바뀝니다
update public.shop_products p set
  description = v.description, size_info = v.size_info, material = v.material, components = v.components,
  care_info = v.care_info, highlights = v.highlights, detail_images = v.detail_images
from (values
  ('mushroom-mood-lamp','동글동글한 갓이 귀여운 미니 무드등. 터치 한 번으로 3단계 밝기 조절.

하루를 마무리하는 시간, 천장 조명 대신 작은 무드등 하나만 켜 보세요. 눈부시지 않은 따뜻한 빛이 공간의 분위기를 차분하게 바꿔 줍니다. 침실 협탁, 거실 선반, 책상 어디에 두어도 잘 어울리도록 군더더기 없는 형태로 만들었어요.','지름 15cm × 높이 20cm','ABS, 실리콘 갓','무드등 1, USB-C 충전 케이블 1','전원을 끈 뒤 마른 천으로 닦아 주세요.
물기가 있는 곳이나 욕실에서는 사용하지 마세요.
전구·LED 교체가 필요한 경우 고객센터로 문의해 주세요.',array['터치 한 번으로 3단계 밝기 조절','완충 시 약 8시간 무선 사용','아이 방에도 안심인 말랑한 실리콘 갓'],array['https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1685735852762-e1325a20da68?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('clip-aluminum-lamp','책상·선반 어디든 집어 쓰는 클립형 조명.

하루를 마무리하는 시간, 천장 조명 대신 작은 무드등 하나만 켜 보세요. 눈부시지 않은 따뜻한 빛이 공간의 분위기를 차분하게 바꿔 줍니다. 침실 협탁, 거실 선반, 책상 어디에 두어도 잘 어울리도록 군더더기 없는 형태로 만들었어요.','갓 지름 11cm × 암 길이 35cm','알루미늄, 스틸 클립','램프 1, 어댑터 1, LED 전구 1','전원을 끈 뒤 마른 천으로 닦아 주세요.
물기가 있는 곳이나 욕실에서는 사용하지 마세요.
전구·LED 교체가 필요한 경우 고객센터로 문의해 주세요.',array['두께 5cm까지 물리는 튼튼한 클립','갓과 암을 자유롭게 꺾어 원하는 곳만 비춤','3000K 눈이 편한 전구색'],array['https://images.unsplash.com/photo-1793830474130-efe7e1b5a243?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1788506663493-ba0df489399f?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('pleats-fabric-stand','주름 잡힌 패브릭 갓이 빛을 부드럽게 퍼뜨려요.

하루를 마무리하는 시간, 천장 조명 대신 작은 무드등 하나만 켜 보세요. 눈부시지 않은 따뜻한 빛이 공간의 분위기를 차분하게 바꿔 줍니다. 침실 협탁, 거실 선반, 책상 어디에 두어도 잘 어울리도록 군더더기 없는 형태로 만들었어요.','갓 지름 30cm × 전체 높이 45cm','폴리 린넨 갓, 원목(애쉬) 베이스','스탠드 1, E26 LED 전구 1','전원을 끈 뒤 마른 천으로 닦아 주세요.
물기가 있는 곳이나 욕실에서는 사용하지 마세요.
전구·LED 교체가 필요한 경우 고객센터로 문의해 주세요.',array['주름 갓이 빛을 부드럽게 퍼뜨림','원목 베이스의 따뜻한 결','줄 스위치로 간편하게 ON/OFF'],array['https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1685735852762-e1325a20da68?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('glass-dome-led','투명 유리 돔 안에 떠 있는 듯한 빛. USB-C 충전식.

하루를 마무리하는 시간, 천장 조명 대신 작은 무드등 하나만 켜 보세요. 눈부시지 않은 따뜻한 빛이 공간의 분위기를 차분하게 바꿔 줍니다. 침실 협탁, 거실 선반, 책상 어디에 두어도 잘 어울리도록 군더더기 없는 형태로 만들었어요.','지름 13cm × 높이 26cm','유리 돔, 알루미늄 바디','램프 1, USB-C 케이블 1','전원을 끈 뒤 마른 천으로 닦아 주세요.
물기가 있는 곳이나 욕실에서는 사용하지 마세요.
전구·LED 교체가 필요한 경우 고객센터로 문의해 주세요.',array['선 없이 어디든 옮겨 두는 무선 충전식','밝기 무단 조절(디머)','실내외 겸용 생활방수(IP44)'],array['https://images.unsplash.com/photo-1793830474130-efe7e1b5a243?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1788506663493-ba0df489399f?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('wireless-charging-lamp','스마트폰을 올려두면 충전되는 침대 맡 무드등.

하루를 마무리하는 시간, 천장 조명 대신 작은 무드등 하나만 켜 보세요. 눈부시지 않은 따뜻한 빛이 공간의 분위기를 차분하게 바꿔 줍니다. 침실 협탁, 거실 선반, 책상 어디에 두어도 잘 어울리도록 군더더기 없는 형태로 만들었어요.','지름 14cm × 높이 18cm','ABS, 패브릭 커버','무드등 1, 어댑터 1','전원을 끈 뒤 마른 천으로 닦아 주세요.
물기가 있는 곳이나 욕실에서는 사용하지 마세요.
전구·LED 교체가 필요한 경우 고객센터로 문의해 주세요.',array['Qi 규격 스마트폰 무선 충전(최대 15W)','알람 시계처럼 서서히 밝아지는 기상 모드','충전과 조명을 하나로 협탁이 깔끔'],array['https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1685735852762-e1325a20da68?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('moon-light','3D 프린팅 달 표면을 그대로 담은 원형 조명. 원목 받침 포함.

하루를 마무리하는 시간, 천장 조명 대신 작은 무드등 하나만 켜 보세요. 눈부시지 않은 따뜻한 빛이 공간의 분위기를 차분하게 바꿔 줍니다. 침실 협탁, 거실 선반, 책상 어디에 두어도 잘 어울리도록 군더더기 없는 형태로 만들었어요.','지름 15cm(받침 포함 높이 17cm)','PLA(3D 프린팅), 원목 받침','달 조명 1, 원목 받침 1, USB 케이블 1','전원을 끈 뒤 마른 천으로 닦아 주세요.
물기가 있는 곳이나 욕실에서는 사용하지 마세요.
전구·LED 교체가 필요한 경우 고객센터로 문의해 주세요.',array['NASA 달 표면 데이터를 바탕으로 한 질감','웜화이트·화이트 2가지 색 전환','받침에서 꺼내 손에 들고 쓸 수 있는 무선형'],array['https://images.unsplash.com/photo-1793830474130-efe7e1b5a243?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1788506663493-ba0df489399f?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('wood-base-table-lamp','월넛 원목 베이스와 린넨 쉐이드의 클래식 램프.

하루를 마무리하는 시간, 천장 조명 대신 작은 무드등 하나만 켜 보세요. 눈부시지 않은 따뜻한 빛이 공간의 분위기를 차분하게 바꿔 줍니다. 침실 협탁, 거실 선반, 책상 어디에 두어도 잘 어울리도록 군더더기 없는 형태로 만들었어요.','갓 지름 28cm × 전체 높이 52cm','월넛 원목, 린넨 쉐이드','램프 1, E26 LED 전구 1','전원을 끈 뒤 마른 천으로 닦아 주세요.
물기가 있는 곳이나 욕실에서는 사용하지 마세요.
전구·LED 교체가 필요한 경우 고객센터로 문의해 주세요.',array['통원목을 깎아 만든 묵직한 베이스','린넨 쉐이드로 은은하게 퍼지는 빛','발 스위치로 손쉬운 조작'],array['https://images.unsplash.com/photo-1552858725-a19e7fcd3ac4?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1685735852762-e1325a20da68?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('rattan-pendant','수공예 라탄 쉐이드로 식탁 위에 따뜻한 그림자를.

하루를 마무리하는 시간, 천장 조명 대신 작은 무드등 하나만 켜 보세요. 눈부시지 않은 따뜻한 빛이 공간의 분위기를 차분하게 바꿔 줍니다. 침실 협탁, 거실 선반, 책상 어디에 두어도 잘 어울리도록 군더더기 없는 형태로 만들었어요.','지름 40cm × 높이 30cm(전선 길이 100cm 조절)','천연 라탄, 패브릭 전선','펜던트 1, 실링 커버 1, E26 전구 1','전원을 끈 뒤 마른 천으로 닦아 주세요.
물기가 있는 곳이나 욕실에서는 사용하지 마세요.
전구·LED 교체가 필요한 경우 고객센터로 문의해 주세요.',array['장인이 손으로 엮은 라탄 쉐이드','천장과 벽에 아름다운 그림자 패턴','전선 길이를 조절해 식탁 높이에 맞춤'],array['https://images.unsplash.com/photo-1793830474130-efe7e1b5a243?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1788506663493-ba0df489399f?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('tealight-24p','캔들 워머·홀더에 쓰기 좋은 4시간 연소 티라이트.

불을 붙이는 순간 공간의 공기가 달라집니다. 천천히 녹아내리는 왁스와 흔들리는 불꽃은 그 자체로 쉼이 되어 줘요. 처음 켤 때는 표면 전체가 녹을 때까지(약 2시간) 태워야 터널링 없이 끝까지 깨끗하게 쓸 수 있어요.','개당 지름 3.8cm × 높이 1.5cm','파라핀 왁스, 알루미늄 컵','무향 티라이트 24개','불을 켠 채 자리를 비우지 마세요.
한 번에 4시간 이상 태우지 마세요.
심지는 5mm 정도로 다듬은 뒤 켜면 그을음이 줄어요.
어린이·반려동물의 손이 닿지 않는 곳에 두세요.',array['개당 약 4시간 연소','캔들 워머·오일 버너·홀더에 두루 사용','그을음이 적은 정제 왁스'],array['https://images.unsplash.com/photo-1590190537798-4db559287bba?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1789858523132-f447aacf9e40?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('candle-snuffer-set','스너퍼·심지 가위·트레이 3종 세트로 깔끔한 캔들 관리.

불을 붙이는 순간 공간의 공기가 달라집니다. 천천히 녹아내리는 왁스와 흔들리는 불꽃은 그 자체로 쉼이 되어 줘요. 처음 켤 때는 표면 전체가 녹을 때까지(약 2시간) 태워야 터널링 없이 끝까지 깨끗하게 쓸 수 있어요.','스너퍼 길이 22cm / 트레이 20 × 10cm','황동 도금 스테인리스','스너퍼 1, 심지 가위 1, 트레이 1','불을 켠 채 자리를 비우지 마세요.
한 번에 4시간 이상 태우지 마세요.
심지는 5mm 정도로 다듬은 뒤 켜면 그을음이 줄어요.
어린이·반려동물의 손이 닿지 않는 곳에 두세요.',array['연기·그을음 없이 불을 끄는 스너퍼','심지를 일정하게 다듬는 전용 가위','선물 상자 포장 기본 제공'],array['https://images.unsplash.com/photo-1697029749544-ffa7f15f9dd0?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1622429420355-5677170f4fad?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('taper-candle-2p','식탁 분위기를 바꾸는 가늘고 긴 컬러 캔들 두 자루.

불을 붙이는 순간 공간의 공기가 달라집니다. 천천히 녹아내리는 왁스와 흔들리는 불꽃은 그 자체로 쉼이 되어 줘요. 처음 켤 때는 표면 전체가 녹을 때까지(약 2시간) 태워야 터널링 없이 끝까지 깨끗하게 쓸 수 있어요.','지름 2.2cm × 길이 25cm','100% 소이 왁스, 코튼 심지','테이퍼 캔들 2개(색상 랜덤)','불을 켠 채 자리를 비우지 마세요.
한 번에 4시간 이상 태우지 마세요.
심지는 5mm 정도로 다듬은 뒤 켜면 그을음이 줄어요.
어린이·반려동물의 손이 닿지 않는 곳에 두세요.',array['개당 약 8시간 연소','촛농이 잘 흐르지 않는 드립리스 가공','일반 캔들 홀더에 꼭 맞는 규격'],array['https://images.unsplash.com/photo-1590190537798-4db559287bba?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1789858523132-f447aacf9e40?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('soy-candle-woody','100% 소이왁스와 나무 심지. 장작 타는 소리가 은은하게.

불을 붙이는 순간 공간의 공기가 달라집니다. 천천히 녹아내리는 왁스와 흔들리는 불꽃은 그 자체로 쉼이 되어 줘요. 처음 켤 때는 표면 전체가 녹을 때까지(약 2시간) 태워야 터널링 없이 끝까지 깨끗하게 쓸 수 있어요.','지름 8cm × 높이 9cm (200g)','100% 소이 왁스, 우드 심지, 유리 용기','캔들 1, 우드 리드 1','불을 켠 채 자리를 비우지 마세요.
한 번에 4시간 이상 태우지 마세요.
심지는 5mm 정도로 다듬은 뒤 켜면 그을음이 줄어요.
어린이·반려동물의 손이 닿지 않는 곳에 두세요.',array['불을 붙이면 장작 타는 소리가 나는 우드 심지','샌달우드·앰버·바닐라의 따뜻한 향','약 40시간 연소'],array['https://images.unsplash.com/photo-1697029749544-ffa7f15f9dd0?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1622429420355-5677170f4fad?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('concrete-jar-candle','다 쓴 뒤 화분이나 소품함으로 쓰는 콘크리트 캔들.

불을 붙이는 순간 공간의 공기가 달라집니다. 천천히 녹아내리는 왁스와 흔들리는 불꽃은 그 자체로 쉼이 되어 줘요. 처음 켤 때는 표면 전체가 녹을 때까지(약 2시간) 태워야 터널링 없이 끝까지 깨끗하게 쓸 수 있어요.','지름 8.5cm × 높이 8cm (180g)','소이 왁스, 수제 콘크리트 용기','캔들 1','불을 켠 채 자리를 비우지 마세요.
한 번에 4시간 이상 태우지 마세요.
심지는 5mm 정도로 다듬은 뒤 켜면 그을음이 줄어요.
어린이·반려동물의 손이 닿지 않는 곳에 두세요.',array['다 쓴 뒤 화분·펜꽂이로 재사용','무향/화이트티/무화과 중 선택','약 35시간 연소'],array['https://images.unsplash.com/photo-1590190537798-4db559287bba?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1789858523132-f447aacf9e40?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('pillar-candle-set','높이가 다른 무향 필러 캔들 3개. 거실 장식용으로 제격.

불을 붙이는 순간 공간의 공기가 달라집니다. 천천히 녹아내리는 왁스와 흔들리는 불꽃은 그 자체로 쉼이 되어 줘요. 처음 켤 때는 표면 전체가 녹을 때까지(약 2시간) 태워야 터널링 없이 끝까지 깨끗하게 쓸 수 있어요.','지름 7cm × 높이 7·10·15cm','파라핀·소이 블렌드 왁스','필러 캔들 3개','불을 켠 채 자리를 비우지 마세요.
한 번에 4시간 이상 태우지 마세요.
심지는 5mm 정도로 다듬은 뒤 켜면 그을음이 줄어요.
어린이·반려동물의 손이 닿지 않는 곳에 두세요.',array['높이가 다른 3개로 자연스러운 연출','무향이라 식탁에 두어도 부담 없음','각 약 30·45·70시간 연소'],array['https://images.unsplash.com/photo-1697029749544-ffa7f15f9dd0?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1622429420355-5677170f4fad?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('christmas-limited-candle','시나몬·전나무 향의 연말 한정 캔들. 골드 리드 포함.

불을 붙이는 순간 공간의 공기가 달라집니다. 천천히 녹아내리는 왁스와 흔들리는 불꽃은 그 자체로 쉼이 되어 줘요. 처음 켤 때는 표면 전체가 녹을 때까지(약 2시간) 태워야 터널링 없이 끝까지 깨끗하게 쓸 수 있어요.','지름 9cm × 높이 10cm (250g)','소이 왁스, 유리 용기, 골드 리드','캔들 1, 골드 리드 1, 기프트 박스','불을 켠 채 자리를 비우지 마세요.
한 번에 4시간 이상 태우지 마세요.
심지는 5mm 정도로 다듬은 뒤 켜면 그을음이 줄어요.
어린이·반려동물의 손이 닿지 않는 곳에 두세요.',array['시나몬·전나무·오렌지 필의 연말 향','골드 리드와 기프트 박스로 바로 선물 가능','약 50시간 연소, 연말 한정 수량'],array['https://images.unsplash.com/photo-1590190537798-4db559287bba?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1789858523132-f447aacf9e40?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('candle-warmer-set','불 없이 녹여 향을 내는 워머와 소이 캔들 2개 구성.

불을 붙이는 순간 공간의 공기가 달라집니다. 천천히 녹아내리는 왁스와 흔들리는 불꽃은 그 자체로 쉼이 되어 줘요. 처음 켤 때는 표면 전체가 녹을 때까지(약 2시간) 태워야 터널링 없이 끝까지 깨끗하게 쓸 수 있어요.','워머 지름 14cm × 높이 36cm','스틸·유리(워머), 소이 왁스(캔들)','캔들 워머 1, 소이 캔들 2(우디·플로럴), 전구 1','불을 켠 채 자리를 비우지 마세요.
한 번에 4시간 이상 태우지 마세요.
심지는 5mm 정도로 다듬은 뒤 켜면 그을음이 줄어요.
어린이·반려동물의 손이 닿지 않는 곳에 두세요.',array['불 없이 위에서 녹여 그을음 걱정 없음','타이머(2·4·8시간)와 밝기 조절','캔들을 끝까지 남김없이 사용'],array['https://images.unsplash.com/photo-1697029749544-ffa7f15f9dd0?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1622429420355-5677170f4fad?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('mini-ceramic-vase','한 손에 쏙 들어오는 핸드메이드 미니 화병.

꽃 한 송이, 마른 가지 하나만 꽂아도 계절이 집 안으로 들어옵니다. 꽃이 없을 때는 그대로 오브제가 되도록 형태와 질감에 신경 썼어요. 손으로 만드는 과정에서 생긴 작은 기포나 색 차이는 불량이 아닌 제품의 개성이에요.','지름 7cm × 높이 10cm','세라믹(백자토)','화병 1','물은 2~3일에 한 번 갈아 주세요.
세척은 부드러운 솔과 중성세제로 해 주세요.
뜨거운 물을 바로 붓거나 식기세척기 사용은 피해 주세요.',array['한 송이를 꽂기 좋은 작은 크기','물레로 하나씩 빚은 핸드메이드','책상·창가에 두기 좋은 미니 사이즈'],array['https://images.unsplash.com/photo-1631125915973-e0d155a14e4e?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1659552735305-5380e69d4d90?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('flower-frog-set','침봉과 유리 볼 세트로 꽃꽂이를 쉽게.

꽃 한 송이, 마른 가지 하나만 꽂아도 계절이 집 안으로 들어옵니다. 꽃이 없을 때는 그대로 오브제가 되도록 형태와 질감에 신경 썼어요. 손으로 만드는 과정에서 생긴 작은 기포나 색 차이는 불량이 아닌 제품의 개성이에요.','침봉 지름 5cm / 유리 볼 지름 15cm × 높이 7cm','황동 침봉, 유리','침봉 1, 유리 볼 1','물은 2~3일에 한 번 갈아 주세요.
세척은 부드러운 솔과 중성세제로 해 주세요.
뜨거운 물을 바로 붓거나 식기세척기 사용은 피해 주세요.',array['꽃 몇 송이로도 모양이 잡히는 침봉','이케바나·플로팅 연출 모두 가능','녹이 잘 슬지 않는 황동 소재'],array['https://images.unsplash.com/photo-1657214231214-772da71ccbde?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('glass-bubble-vase','기포가 살아있는 수공예 유리 화병.

꽃 한 송이, 마른 가지 하나만 꽂아도 계절이 집 안으로 들어옵니다. 꽃이 없을 때는 그대로 오브제가 되도록 형태와 질감에 신경 썼어요. 손으로 만드는 과정에서 생긴 작은 기포나 색 차이는 불량이 아닌 제품의 개성이에요.','지름 12cm × 높이 18cm','수공예 유리','화병 1','물은 2~3일에 한 번 갈아 주세요.
세척은 부드러운 솔과 중성세제로 해 주세요.
뜨거운 물을 바로 붓거나 식기세척기 사용은 피해 주세요.',array['입으로 불어 만든 유리의 자연스러운 기포','빛을 받으면 테이블에 맺히는 물그림자','앰버·클리어 2가지 색'],array['https://images.unsplash.com/photo-1631125915973-e0d155a14e4e?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1659552735305-5380e69d4d90?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('wave-acrylic-vase','물결 모양 반투명 아크릴 화병. 빛을 받으면 더 예뻐요.

꽃 한 송이, 마른 가지 하나만 꽂아도 계절이 집 안으로 들어옵니다. 꽃이 없을 때는 그대로 오브제가 되도록 형태와 질감에 신경 썼어요. 손으로 만드는 과정에서 생긴 작은 기포나 색 차이는 불량이 아닌 제품의 개성이에요.','가로 14cm × 세로 8cm × 높이 20cm','아크릴(PMMA)','화병 1','물은 2~3일에 한 번 갈아 주세요.
세척은 부드러운 솔과 중성세제로 해 주세요.
뜨거운 물을 바로 붓거나 식기세척기 사용은 피해 주세요.',array['물결 모양으로 보는 각도마다 다른 실루엣','유리보다 가볍고 잘 깨지지 않음','꽃 없이도 오브제로 충분한 존재감'],array['https://images.unsplash.com/photo-1657214231214-772da71ccbde?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('handle-jug-vase','물병처럼 손잡이가 달린 매트 도자기 화병.

꽃 한 송이, 마른 가지 하나만 꽂아도 계절이 집 안으로 들어옵니다. 꽃이 없을 때는 그대로 오브제가 되도록 형태와 질감에 신경 썼어요. 손으로 만드는 과정에서 생긴 작은 기포나 색 차이는 불량이 아닌 제품의 개성이에요.','지름 11cm × 높이 22cm','매트 유약 도자기','화병 1','물은 2~3일에 한 번 갈아 주세요.
세척은 부드러운 솔과 중성세제로 해 주세요.
뜨거운 물을 바로 붓거나 식기세척기 사용은 피해 주세요.',array['물병처럼 손잡이가 달린 저그 형태','차분한 매트 질감의 무광 유약','가지가 긴 꽃도 안정적으로 지지'],array['https://images.unsplash.com/photo-1631125915973-e0d155a14e4e?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1659552735305-5380e69d4d90?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('dried-flower-vase-set','시들지 않는 드라이플라워 다발과 어울리는 화병 세트.

꽃 한 송이, 마른 가지 하나만 꽂아도 계절이 집 안으로 들어옵니다. 꽃이 없을 때는 그대로 오브제가 되도록 형태와 질감에 신경 썼어요. 손으로 만드는 과정에서 생긴 작은 기포나 색 차이는 불량이 아닌 제품의 개성이에요.','화병 지름 9cm × 높이 15cm / 꽃다발 길이 약 35cm','세라믹(화병), 드라이플라워','화병 1, 드라이플라워 다발 1, 메시지 카드 1','물은 2~3일에 한 번 갈아 주세요.
세척은 부드러운 솔과 중성세제로 해 주세요.
뜨거운 물을 바로 붓거나 식기세척기 사용은 피해 주세요.',array['물 없이 오래 두고 보는 드라이플라워','플로리스트가 색을 맞춰 구성한 다발','메시지 카드 포함, 바로 선물 가능'],array['https://images.unsplash.com/photo-1657214231214-772da71ccbde?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1631125915902-d8abe9225ff2?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('vintage-ceramic-vase','유약이 흘러내린 듯한 빈티지 질감의 중형 화병.

꽃 한 송이, 마른 가지 하나만 꽂아도 계절이 집 안으로 들어옵니다. 꽃이 없을 때는 그대로 오브제가 되도록 형태와 질감에 신경 썼어요. 손으로 만드는 과정에서 생긴 작은 기포나 색 차이는 불량이 아닌 제품의 개성이에요.','지름 16cm × 높이 25cm','유약 도자기','화병 1','물은 2~3일에 한 번 갈아 주세요.
세척은 부드러운 솔과 중성세제로 해 주세요.
뜨거운 물을 바로 붓거나 식기세척기 사용은 피해 주세요.',array['유약이 흘러내린 듯한 빈티지 질감','제품마다 다른 유약 무늬','중형 사이즈로 거실 센터피스에 적합'],array['https://images.unsplash.com/photo-1631125915973-e0d155a14e4e?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1659552735305-5380e69d4d90?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('terracotta-floor-vase','거실 코너를 채우는 60cm 테라코타 플로어 베이스.

꽃 한 송이, 마른 가지 하나만 꽂아도 계절이 집 안으로 들어옵니다. 꽃이 없을 때는 그대로 오브제가 되도록 형태와 질감에 신경 썼어요. 손으로 만드는 과정에서 생긴 작은 기포나 색 차이는 불량이 아닌 제품의 개성이에요.','지름 30cm × 높이 60cm','테라코타(초벌 점토)','플로어 베이스 1','물은 2~3일에 한 번 갈아 주세요.
세척은 부드러운 솔과 중성세제로 해 주세요.
뜨거운 물을 바로 붓거나 식기세척기 사용은 피해 주세요.',array['거실 코너를 채우는 60cm 대형 사이즈','흙의 질감을 그대로 살린 초벌 마감','팜파스·유칼립투스 같은 긴 가지와 잘 어울림'],array['https://images.unsplash.com/photo-1657214231214-772da71ccbde?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1631125915973-e0d155a14e4e?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('car-diffuser','송풍구에 꽂는 원목 클립 디퓨저. 향 리필 2개 포함.

집에 들어서는 순간 반겨 주는 은은한 향. 너무 진하지 않게, 오래 머물러도 머리가 아프지 않도록 향의 농도를 조절했어요. 현관, 거실, 침실처럼 공간마다 다른 향을 두면 집이 더 풍성해집니다.','클립 4 × 3cm / 리필 5ml','원목(너도밤나무), 스틸 클립','디퓨저 클립 1, 향 리필 2','직사광선과 화기를 피해 보관하세요.
오일이 가구에 묻으면 얼룩이 생길 수 있으니 받침을 사용하세요.
눈·피부에 닿으면 깨끗한 물로 씻어 내세요.
어린이·반려동물이 마시지 않도록 주의하세요.',array['송풍구에 꽂기만 하면 되는 클립형','원목에 향을 떨어뜨려 은은하게 발향','리필 1개로 약 3주 사용'],array['https://images.unsplash.com/photo-1784028260705-34d9b65a95b2?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1760278041827-2b792dbd57ca?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('sachet-3p','옷장·신발장에 두는 린넨 향주머니 3개.

집에 들어서는 순간 반겨 주는 은은한 향. 너무 진하지 않게, 오래 머물러도 머리가 아프지 않도록 향의 농도를 조절했어요. 현관, 거실, 침실처럼 공간마다 다른 향을 두면 집이 더 풍성해집니다.','개당 10 × 12cm','린넨 주머니, 향 입힌 우드 칩','사쉐 3개(라벤더·코튼·시더우드)','직사광선과 화기를 피해 보관하세요.
오일이 가구에 묻으면 얼룩이 생길 수 있으니 받침을 사용하세요.
눈·피부에 닿으면 깨끗한 물로 씻어 내세요.
어린이·반려동물이 마시지 않도록 주의하세요.',array['옷장·신발장·차 안 어디든 걸어 두는 주머니','향이 옅어지면 오일을 떨어뜨려 재사용','끈이 달려 있어 걸기 쉬움'],array['https://images.unsplash.com/photo-1608571423539-e951b9b3871e?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1655717669637-e8d3a4f7ed97?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('diffuser-refill','기존 디퓨저 병에 채워 쓰는 리필 오일.

집에 들어서는 순간 반겨 주는 은은한 향. 너무 진하지 않게, 오래 머물러도 머리가 아프지 않도록 향의 농도를 조절했어요. 현관, 거실, 침실처럼 공간마다 다른 향을 두면 집이 더 풍성해집니다.','200ml','향료, 식물성 베이스 오일','리필 오일 1, 리드 스틱 5','직사광선과 화기를 피해 보관하세요.
오일이 가구에 묻으면 얼룩이 생길 수 있으니 받침을 사용하세요.
눈·피부에 닿으면 깨끗한 물로 씻어 내세요.
어린이·반려동물이 마시지 않도록 주의하세요.',array['기존 디퓨저 병에 그대로 부어 사용','새 리드 스틱 5개 함께 제공','6가지 향 중 선택'],array['https://images.unsplash.com/photo-1784028260705-34d9b65a95b2?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1760278041827-2b792dbd57ca?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('room-spray','커튼·침구에 뿌려 바로 기분 전환.

집에 들어서는 순간 반겨 주는 은은한 향. 너무 진하지 않게, 오래 머물러도 머리가 아프지 않도록 향의 농도를 조절했어요. 현관, 거실, 침실처럼 공간마다 다른 향을 두면 집이 더 풍성해집니다.','100ml','향료, 정제수, 에탄올','룸 스프레이 1','직사광선과 화기를 피해 보관하세요.
오일이 가구에 묻으면 얼룩이 생길 수 있으니 받침을 사용하세요.
눈·피부에 닿으면 깨끗한 물로 씻어 내세요.
어린이·반려동물이 마시지 않도록 주의하세요.',array['커튼·침구·소파에 뿌려 바로 기분 전환','미세한 분사로 얼룩 걱정 적음','베개에 뿌리는 숙면 루틴용으로도 좋음'],array['https://images.unsplash.com/photo-1608571423539-e951b9b3871e?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1655717669637-e8d3a4f7ed97?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('reed-diffuser-200','화이트머스크 · 블랙체리 · 무화과 중 선택. 약 3개월 지속.

집에 들어서는 순간 반겨 주는 은은한 향. 너무 진하지 않게, 오래 머물러도 머리가 아프지 않도록 향의 농도를 조절했어요. 현관, 거실, 침실처럼 공간마다 다른 향을 두면 집이 더 풍성해집니다.','병 지름 7cm × 높이 12cm / 200ml','유리 병, 향료, 식물성 베이스 오일','디퓨저 오일 1, 리드 스틱 8','직사광선과 화기를 피해 보관하세요.
오일이 가구에 묻으면 얼룩이 생길 수 있으니 받침을 사용하세요.
눈·피부에 닿으면 깨끗한 물로 씻어 내세요.
어린이·반려동물이 마시지 않도록 주의하세요.',array['화이트머스크·블랙체리·무화과 중 선택','약 3개월 지속','리드 개수로 향의 세기 조절'],array['https://images.unsplash.com/photo-1784028260705-34d9b65a95b2?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1760278041827-2b792dbd57ca?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('ceramic-oil-burner','티라이트로 아로마 오일을 데우는 도자기 버너.

집에 들어서는 순간 반겨 주는 은은한 향. 너무 진하지 않게, 오래 머물러도 머리가 아프지 않도록 향의 농도를 조절했어요. 현관, 거실, 침실처럼 공간마다 다른 향을 두면 집이 더 풍성해집니다.','지름 9cm × 높이 12cm','세라믹','오일 버너 1, 티라이트 2','직사광선과 화기를 피해 보관하세요.
오일이 가구에 묻으면 얼룩이 생길 수 있으니 받침을 사용하세요.
눈·피부에 닿으면 깨끗한 물로 씻어 내세요.
어린이·반려동물이 마시지 않도록 주의하세요.',array['티라이트로 아로마 오일을 데워 발향','물을 함께 담아 은은하게 퍼지는 향','불빛이 새어 나오는 구멍 디자인'],array['https://images.unsplash.com/photo-1608571423539-e951b9b3871e?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1655717669637-e8d3a4f7ed97?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('ultrasonic-diffuser','가습과 향을 동시에. 우드그레인 커버와 7색 무드등.

집에 들어서는 순간 반겨 주는 은은한 향. 너무 진하지 않게, 오래 머물러도 머리가 아프지 않도록 향의 농도를 조절했어요. 현관, 거실, 침실처럼 공간마다 다른 향을 두면 집이 더 풍성해집니다.','지름 10cm × 높이 15cm / 물통 300ml','PP, 우드그레인 커버','디퓨저 본체 1, 어댑터 1, 계량컵 1','직사광선과 화기를 피해 보관하세요.
오일이 가구에 묻으면 얼룩이 생길 수 있으니 받침을 사용하세요.
눈·피부에 닿으면 깨끗한 물로 씻어 내세요.
어린이·반려동물이 마시지 않도록 주의하세요.',array['가습과 향을 동시에, 초음파 미스트','7색 무드등 + 타이머(1·3·6시간)','물이 떨어지면 자동으로 꺼지는 안전 기능'],array['https://images.unsplash.com/photo-1784028260705-34d9b65a95b2?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1760278041827-2b792dbd57ca?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('housewarming-gift-set','디퓨저 200ml + 룸스프레이 + 사쉐, 선물 박스 포장.

집에 들어서는 순간 반겨 주는 은은한 향. 너무 진하지 않게, 오래 머물러도 머리가 아프지 않도록 향의 농도를 조절했어요. 현관, 거실, 침실처럼 공간마다 다른 향을 두면 집이 더 풍성해집니다.','상자 30 × 22 × 10cm','구성품별 상이','리드 디퓨저 200ml 1, 룸 스프레이 100ml 1, 사쉐 1, 메시지 카드 1','직사광선과 화기를 피해 보관하세요.
오일이 가구에 묻으면 얼룩이 생길 수 있으니 받침을 사용하세요.
눈·피부에 닿으면 깨끗한 물로 씻어 내세요.
어린이·반려동물이 마시지 않도록 주의하세요.',array['집들이에 가장 많이 찾는 구성을 한 상자에','리본과 쇼핑백까지 포함된 선물 포장','향은 주문 시 배송 메모로 선택 가능'],array['https://images.unsplash.com/photo-1608571423539-e951b9b3871e?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1655717669637-e8d3a4f7ed97?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('incense-holder','조약돌 모양 인센스 홀더. 인센스 10개 동봉.

쓰임이 없어도 곁에 두고 싶은 물건이 있어요. 책장 한 칸, 현관 선반, 책상 모서리처럼 비어 있던 자리에 놓으면 공간에 표정이 생깁니다. 자연 소재 특유의 결과 무늬는 제품마다 조금씩 달라요.','지름 8cm × 높이 2cm','세라믹','인센스 홀더 1, 인센스 스틱 10','마른 천으로 먼지를 털어 주세요.
원목·석재 제품은 물에 오래 닿지 않게 해 주세요.
떨어뜨리면 깨지거나 흠집이 날 수 있으니 안정적인 곳에 두세요.',array['조약돌 모양의 둥근 형태','재가 받침 안에 모이는 오목한 디자인','샌달우드 인센스 10개 동봉'],array['https://images.unsplash.com/photo-1617806265182-7b3f847f0b75?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1588111948296-83a8e036e004?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('mini-frame','엽서·사진을 끼우는 4x6 원목 액자.

쓰임이 없어도 곁에 두고 싶은 물건이 있어요. 책장 한 칸, 현관 선반, 책상 모서리처럼 비어 있던 자리에 놓으면 공간에 표정이 생깁니다. 자연 소재 특유의 결과 무늬는 제품마다 조금씩 달라요.','외경 13 × 18cm (4×6 사진용)','오크 원목, 유리','액자 1','마른 천으로 먼지를 털어 주세요.
원목·석재 제품은 물에 오래 닿지 않게 해 주세요.
떨어뜨리면 깨지거나 흠집이 날 수 있으니 안정적인 곳에 두세요.',array['가로·세로 모두 세울 수 있는 받침','벽에 걸 수 있는 고리 포함','사진·엽서·메시지 카드를 넣어 선물하기 좋음'],array['https://images.unsplash.com/photo-1604935067269-27c7e8b36618?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1667400104789-f50a4cb393cf?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('wood-tray','월넛 원목을 깎아 만든 오벌 트레이. 향초·키링 정리에.

쓰임이 없어도 곁에 두고 싶은 물건이 있어요. 책장 한 칸, 현관 선반, 책상 모서리처럼 비어 있던 자리에 놓으면 공간에 표정이 생깁니다. 자연 소재 특유의 결과 무늬는 제품마다 조금씩 달라요.','가로 30cm × 세로 18cm × 높이 2.5cm','월넛 원목, 오일 마감','트레이 1','마른 천으로 먼지를 털어 주세요.
원목·석재 제품은 물에 오래 닿지 않게 해 주세요.
떨어뜨리면 깨지거나 흠집이 날 수 있으니 안정적인 곳에 두세요.',array['통원목을 깎아 만든 오벌 트레이','향초·향수·액세서리를 한곳에 정리','식품 안전 오일로 마감해 다과용으로도 사용'],array['https://images.unsplash.com/photo-1617806265182-7b3f847f0b75?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1588111948296-83a8e036e004?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('plaster-sculpture','얼굴 실루엣 석고 오브제. 책장 포인트로 좋아요.

쓰임이 없어도 곁에 두고 싶은 물건이 있어요. 책장 한 칸, 현관 선반, 책상 모서리처럼 비어 있던 자리에 놓으면 공간에 표정이 생깁니다. 자연 소재 특유의 결과 무늬는 제품마다 조금씩 달라요.','가로 12cm × 세로 8cm × 높이 18cm','석고(수제 캐스팅)','오브제 1','마른 천으로 먼지를 털어 주세요.
원목·석재 제품은 물에 오래 닿지 않게 해 주세요.
떨어뜨리면 깨지거나 흠집이 날 수 있으니 안정적인 곳에 두세요.',array['얼굴 실루엣을 담은 조형 오브제','책장·선반에 포인트가 되는 화이트 톤','하나씩 손으로 다듬어 미세하게 다른 표정'],array['https://images.unsplash.com/photo-1604935067269-27c7e8b36618?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1667400104789-f50a4cb393cf?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('candle-holder-objet','황동 링 캔들 홀더. 불을 켜지 않아도 오브제로 충분.

쓰임이 없어도 곁에 두고 싶은 물건이 있어요. 책장 한 칸, 현관 선반, 책상 모서리처럼 비어 있던 자리에 놓으면 공간에 표정이 생깁니다. 자연 소재 특유의 결과 무늬는 제품마다 조금씩 달라요.','지름 12cm × 높이 15cm','황동','캔들 홀더 1','마른 천으로 먼지를 털어 주세요.
원목·석재 제품은 물에 오래 닿지 않게 해 주세요.
떨어뜨리면 깨지거나 흠집이 날 수 있으니 안정적인 곳에 두세요.',array['황동 링 두 개가 겹쳐진 조형적인 형태','테이퍼·티라이트 캔들 모두 사용 가능','시간이 지날수록 깊어지는 황동 색감'],array['https://images.unsplash.com/photo-1617806265182-7b3f847f0b75?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1588111948296-83a8e036e004?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('hanging-mobile','바람에 천천히 도는 황동 원형 모빌.

쓰임이 없어도 곁에 두고 싶은 물건이 있어요. 책장 한 칸, 현관 선반, 책상 모서리처럼 비어 있던 자리에 놓으면 공간에 표정이 생깁니다. 자연 소재 특유의 결과 무늬는 제품마다 조금씩 달라요.','가로 약 45cm × 세로 약 60cm','황동 와이어, 철판','모빌 1, 천장 고리 1','마른 천으로 먼지를 털어 주세요.
원목·석재 제품은 물에 오래 닿지 않게 해 주세요.
떨어뜨리면 깨지거나 흠집이 날 수 있으니 안정적인 곳에 두세요.',array['작은 바람에도 천천히 도는 균형 설계','벽과 천장에 움직이는 그림자','조립 없이 바로 걸 수 있는 완성형'],array['https://images.unsplash.com/photo-1604935067269-27c7e8b36618?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1667400104789-f50a4cb393cf?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('desk-clock','트래버틴 석재 무소음 탁상 시계.

쓰임이 없어도 곁에 두고 싶은 물건이 있어요. 책장 한 칸, 현관 선반, 책상 모서리처럼 비어 있던 자리에 놓으면 공간에 표정이 생깁니다. 자연 소재 특유의 결과 무늬는 제품마다 조금씩 달라요.','가로 12cm × 세로 5cm × 높이 12cm','트래버틴 석재, 무소음 무브먼트','시계 1, AA 건전지 1','마른 천으로 먼지를 털어 주세요.
원목·석재 제품은 물에 오래 닿지 않게 해 주세요.
떨어뜨리면 깨지거나 흠집이 날 수 있으니 안정적인 곳에 두세요.',array['초침 소리가 없는 무소음 무브먼트','자연석 특유의 구멍과 결','묵직해서 쉽게 넘어지지 않음'],array['https://images.unsplash.com/photo-1617806265182-7b3f847f0b75?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1588111948296-83a8e036e004?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('marble-bookend','무게감 있는 대리석 북엔드 두 개 한 세트.

쓰임이 없어도 곁에 두고 싶은 물건이 있어요. 책장 한 칸, 현관 선반, 책상 모서리처럼 비어 있던 자리에 놓으면 공간에 표정이 생깁니다. 자연 소재 특유의 결과 무늬는 제품마다 조금씩 달라요.','개당 가로 10cm × 세로 8cm × 높이 15cm (약 1.5kg)','천연 대리석','북엔드 2개','마른 천으로 먼지를 털어 주세요.
원목·석재 제품은 물에 오래 닿지 않게 해 주세요.
떨어뜨리면 깨지거나 흠집이 날 수 있으니 안정적인 곳에 두세요.',array['책 20권도 거뜬히 받치는 무게감','바닥 펠트 패드로 가구 보호','흰 대리석의 자연스러운 무늬'],array['https://images.unsplash.com/photo-1604935067269-27c7e8b36618?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1667400104789-f50a4cb393cf?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('cotton-tea-mat-2p','자수가 들어간 코튼 티매트 두 장.

손끝에 닿는 감촉이 좋은 패브릭은 공간을 가장 쉽게 따뜻하게 만드는 방법이에요. 자연스러운 주름과 부드러운 질감이 살아 있도록 워싱 가공을 거쳤습니다. 계절에 따라 바꿔 주면 같은 방도 새로워 보여요.','개당 지름 18cm','면 100%','티매트 2장','찬물에 단독 손세탁 또는 울 코스 세탁을 권장해요.
표백제·건조기 사용은 피해 주세요.
그늘에서 펼쳐 말리면 변형이 적어요.
첫 세탁 시 약간의 이염이 있을 수 있어요.',array['자수가 들어간 원형 티매트','뜨거운 찻잔도 올려 둘 수 있는 두께','세탁기 사용 가능(세탁망 권장)'],array['https://images.unsplash.com/photo-1764437835706-ba9d63250bd2?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('linen-apron','워싱 린넨으로 만든 크로스백 앞치마.

손끝에 닿는 감촉이 좋은 패브릭은 공간을 가장 쉽게 따뜻하게 만드는 방법이에요. 자연스러운 주름과 부드러운 질감이 살아 있도록 워싱 가공을 거쳤습니다. 계절에 따라 바꿔 주면 같은 방도 새로워 보여요.','프리사이즈 (가로 80cm × 길이 90cm)','워싱 린넨 100%','앞치마 1','찬물에 단독 손세탁 또는 울 코스 세탁을 권장해요.
표백제·건조기 사용은 피해 주세요.
그늘에서 펼쳐 말리면 변형이 적어요.
첫 세탁 시 약간의 이염이 있을 수 있어요.',array['어깨에 무리가 없는 크로스백 스타일','큼직한 앞주머니 2개','빨수록 부드러워지는 워싱 린넨'],array['https://images.unsplash.com/photo-1538577880403-f9998e75dd06?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1674475760738-8c7af859f821?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('table-runner','식탁에 깔면 바로 카페 분위기. 180cm.

손끝에 닿는 감촉이 좋은 패브릭은 공간을 가장 쉽게 따뜻하게 만드는 방법이에요. 자연스러운 주름과 부드러운 질감이 살아 있도록 워싱 가공을 거쳤습니다. 계절에 따라 바꿔 주면 같은 방도 새로워 보여요.','가로 35cm × 길이 180cm','린넨 70%, 면 30%','테이블 러너 1','찬물에 단독 손세탁 또는 울 코스 세탁을 권장해요.
표백제·건조기 사용은 피해 주세요.
그늘에서 펼쳐 말리면 변형이 적어요.
첫 세탁 시 약간의 이염이 있을 수 있어요.',array['4~6인 식탁에 맞는 180cm 길이','양 끝 술 장식으로 완성한 마감','깔기만 해도 카페 같은 식탁 연출'],array['https://images.unsplash.com/photo-1764437835706-ba9d63250bd2?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('linen-cushion-cover','45x45 워싱 린넨 쿠션 커버. 5가지 컬러.

손끝에 닿는 감촉이 좋은 패브릭은 공간을 가장 쉽게 따뜻하게 만드는 방법이에요. 자연스러운 주름과 부드러운 질감이 살아 있도록 워싱 가공을 거쳤습니다. 계절에 따라 바꿔 주면 같은 방도 새로워 보여요.','45 × 45cm (솜 별도)','워싱 린넨 100%','쿠션 커버 1','찬물에 단독 손세탁 또는 울 코스 세탁을 권장해요.
표백제·건조기 사용은 피해 주세요.
그늘에서 펼쳐 말리면 변형이 적어요.
첫 세탁 시 약간의 이염이 있을 수 있어요.',array['숨은 지퍼로 깔끔한 마감','아이보리·베이지·세이지 등 5가지 색','자연스러운 주름이 멋스러운 워싱 가공'],array['https://images.unsplash.com/photo-1538577880403-f9998e75dd06?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1674475760738-8c7af859f821?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('fabric-poster','드로잉이 프린트된 대형 패브릭 포스터.

손끝에 닿는 감촉이 좋은 패브릭은 공간을 가장 쉽게 따뜻하게 만드는 방법이에요. 자연스러운 주름과 부드러운 질감이 살아 있도록 워싱 가공을 거쳤습니다. 계절에 따라 바꿔 주면 같은 방도 새로워 보여요.','가로 75cm × 세로 100cm','면 캔버스','패브릭 포스터 1, 우드 행거 1','찬물에 단독 손세탁 또는 울 코스 세탁을 권장해요.
표백제·건조기 사용은 피해 주세요.
그늘에서 펼쳐 말리면 변형이 적어요.
첫 세탁 시 약간의 이염이 있을 수 있어요.',array['못 하나로 거는 대형 패브릭 포스터','액자보다 가볍고 이사할 때도 간편','구김이 적은 도톰한 캔버스 원단'],array['https://images.unsplash.com/photo-1764437835706-ba9d63250bd2?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('rattan-basket','담요·잡지 수납에 좋은 핸드메이드 라탄 바구니.

손끝에 닿는 감촉이 좋은 패브릭은 공간을 가장 쉽게 따뜻하게 만드는 방법이에요. 자연스러운 주름과 부드러운 질감이 살아 있도록 워싱 가공을 거쳤습니다. 계절에 따라 바꿔 주면 같은 방도 새로워 보여요.','지름 35cm × 높이 30cm','천연 라탄','바구니 1','찬물에 단독 손세탁 또는 울 코스 세탁을 권장해요.
표백제·건조기 사용은 피해 주세요.
그늘에서 펼쳐 말리면 변형이 적어요.
첫 세탁 시 약간의 이염이 있을 수 있어요.',array['담요·쿠션·잡지를 넣는 넉넉한 크기','양쪽 손잡이로 옮기기 쉬움','화분 커버로도 활용 가능'],array['https://images.unsplash.com/photo-1538577880403-f9998e75dd06?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1674475760738-8c7af859f821?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('knit-blanket','도톰한 코튼 니트 블랭킷. 소파 위에 툭 걸쳐두기.

손끝에 닿는 감촉이 좋은 패브릭은 공간을 가장 쉽게 따뜻하게 만드는 방법이에요. 자연스러운 주름과 부드러운 질감이 살아 있도록 워싱 가공을 거쳤습니다. 계절에 따라 바꿔 주면 같은 방도 새로워 보여요.','가로 130cm × 세로 170cm','면 100%','블랭킷 1','찬물에 단독 손세탁 또는 울 코스 세탁을 권장해요.
표백제·건조기 사용은 피해 주세요.
그늘에서 펼쳐 말리면 변형이 적어요.
첫 세탁 시 약간의 이염이 있을 수 있어요.',array['도톰하지만 가벼운 굵은 짜임','소파·침대 끝에 툭 걸치기 좋은 크기','사계절 쓰기 좋은 코튼 소재'],array['https://images.unsplash.com/photo-1764437835706-ba9d63250bd2?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1629949009765-40fc74c9ec21?w=1200&h=800&fit=crop&q=80&auto=format']),
  ('fluffy-rug','발에 닿는 감촉이 부드러운 원형 러그 120cm.

손끝에 닿는 감촉이 좋은 패브릭은 공간을 가장 쉽게 따뜻하게 만드는 방법이에요. 자연스러운 주름과 부드러운 질감이 살아 있도록 워싱 가공을 거쳤습니다. 계절에 따라 바꿔 주면 같은 방도 새로워 보여요.','지름 120cm','극세사(폴리에스터), 미끄럼 방지 바닥','러그 1','찬물에 단독 손세탁 또는 울 코스 세탁을 권장해요.
표백제·건조기 사용은 피해 주세요.
그늘에서 펼쳐 말리면 변형이 적어요.
첫 세탁 시 약간의 이염이 있을 수 있어요.',array['발이 푹 잠기는 3cm 롱파일','미끄럼 방지 처리된 바닥면','원형이라 의자 아래·침대 옆 어디든 어울림'],array['https://images.unsplash.com/photo-1538577880403-f9998e75dd06?w=1200&h=800&fit=crop&q=80&auto=format','https://images.unsplash.com/photo-1674475760738-8c7af859f821?w=1200&h=800&fit=crop&q=80&auto=format'])
) as v(slug, description, size_info, material, components, care_info, highlights, detail_images)
where p.slug = v.slug;

-- 이미 가입되어 있던 사용자에게도 쇼핑몰 프로필 생성
insert into public.shop_profiles (id, name)
select id, raw_user_meta_data ->> 'name' from auth.users
on conflict (id) do nothing;
