-- RLS 정책(products readable)이 비로그인 방문자에게도 shop_is_admin()을 평가하므로 실행 권한 필요. 비로그인 시 항상 false.
grant execute on function public.shop_is_admin() to anon;
