import { Suspense } from "react";
import SignupPage from "@/components/auth/SignupPage";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SignupPage />
    </Suspense>
  );
}