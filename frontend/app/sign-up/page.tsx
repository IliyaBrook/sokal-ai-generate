
import SignUp from "./signUp";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your account to start generating AI-powered content. Join our community of content creators.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/sign-up',
  },
};

export default function SignUpPage() {
  return <div><SignUp/></div>;
}
