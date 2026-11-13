import "server-only";
import { createClient } from "@supabase/supabase-js";

// service_role 키 클라이언트: RLS를 우회하므로 서버에서 결제 승인 처리에만 사용
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다. .env.local 에 추가해 주세요."
    );
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
