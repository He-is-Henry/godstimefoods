import type { Metadata } from "next";
import SignupClient from "./signup.client";
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Sign Up - Create Your Account",
  description: "Register a new account.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}> 
      <SignupClient />
    </Suspense>
  );
}
