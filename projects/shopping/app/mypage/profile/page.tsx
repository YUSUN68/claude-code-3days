import type { Metadata } from "next";
import { getProfile } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import ResetPasswordForm from "@/app/(auth)/reset-password/ResetPasswordForm";

export const metadata: Metadata = { title: "내 정보" };

export default async function ProfilePage() {
  const { user, profile } = await getProfile();
  return (
    <div className="max-w-xl space-y-12">
      <section>
        <h2 className="mb-4 border-b border-ink pb-3 font-medium">기본 정보</h2>
        <ProfileForm
          email={user?.email ?? ""}
          initial={{
            name: profile?.name ?? "",
            phone: profile?.phone ?? "",
            zipcode: profile?.zipcode ?? "",
            address1: profile?.address1 ?? "",
            address2: profile?.address2 ?? "",
          }}
        />
      </section>
      <section>
        <h2 className="mb-4 border-b border-ink pb-3 font-medium">비밀번호 변경</h2>
        <ResetPasswordForm redirectTo="/mypage/profile" />
      </section>
    </div>
  );
}
