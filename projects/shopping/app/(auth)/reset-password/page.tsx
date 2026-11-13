import Link from "next/link";
import type { Metadata } from "next";
import AuthCard from "@/components/AuthCard";
import { getUser } from "@/lib/supabase/server";
import ResetPasswordForm from "./ResetPasswordForm";

export const metadata: Metadata = { title: "비밀번호 재설정" };

export default async function ResetPasswordPage() {
  const user = await getUser();
  if (!user) {
    return (
      <AuthCard title="링크가 만료되었어요" subtitle="재설정 링크는 한 번만, 일정 시간 동안만 사용할 수 있어요">
        <div className="space-y-3 text-center text-sm">
          <p className="text-muted">비밀번호 찾기를 다시 요청해 새 링크를 받아 주세요.</p>
          <Link href="/forgot-password" className="btn-primary w-full">다시 요청하기</Link>
        </div>
      </AuthCard>
    );
  }
  return (
    <AuthCard title="새 비밀번호 설정" subtitle={`${user.email} 계정의 비밀번호를 변경합니다`}>
      <ResetPasswordForm />
    </AuthCard>
  );
}
