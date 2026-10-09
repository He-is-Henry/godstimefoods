import type { Metadata } from "next";
import SignupClient from "./signup.client";

export const metadata: Metadata = {
  title: "Sign Up - Create Your Account",
  description: "Register a new account.",
};

export default function SignupPage() {
  return <SignupClient />;
}
