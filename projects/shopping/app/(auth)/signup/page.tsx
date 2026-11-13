import type { Metadata } from "next";
import { Suspense } from "react";
import SignupForm from "./SignupForm";
import AuthCard from "@/components/AuthCard";

export const metadata: Metadata = { title: "회원가입" };

export default function SignupPage() {
  return (
    <AuthCard title="회원가입" subtitle="가입하고 주문 내역과 배송지를 편하게 관리하세요">
      <Suspense>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
