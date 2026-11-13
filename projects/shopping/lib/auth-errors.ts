// Supabase Auth 에러를 한글 안내 문구로 변환
export function authErrorMessage(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return "";
  const code = error.code ?? "";
  const msg = (error.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login credentials"))
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (code === "email_not_confirmed" || msg.includes("email not confirmed"))
    return "이메일 인증이 아직 완료되지 않았어요. 받은 메일함의 인증 링크를 눌러 주세요.";
  if (code === "user_already_exists" || msg.includes("already registered"))
    return "이미 가입된 이메일입니다. 로그인하거나 비밀번호 찾기를 이용해 주세요.";
  if (code === "weak_password" || msg.includes("password should"))
    return "비밀번호가 너무 약해요. 영문·숫자를 섞어 8자 이상으로 입력해 주세요.";
  if (code === "same_password" || msg.includes("different from the old"))
    return "기존 비밀번호와 다른 비밀번호를 입력해 주세요.";
  if (code === "over_email_send_rate_limit" || msg.includes("rate limit") || msg.includes("security purposes"))
    return "요청이 너무 많아요. 잠시 후 다시 시도해 주세요.";
  if (code === "validation_failed" || msg.includes("invalid format") || msg.includes("is invalid"))
    return "이메일 형식이 올바르지 않습니다.";
  return "문제가 발생했어요. 잠시 후 다시 시도해 주세요.";
}
