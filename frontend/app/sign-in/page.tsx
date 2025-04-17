
import SignIn from "./signIn";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account to access your AI-generated content and create new posts.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/sign-in',
  },
};

export default function SignInPage() {
  return <div><SignIn/></div>;
}
