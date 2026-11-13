import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";
import AuthCard from "@/components/AuthCard";

export const metadata: Metadata = { title: "로그인" };

export default function LoginPage() {
  return (
    <AuthCard title="로그인" subtitle="다시 오셨군요, 반가워요">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
