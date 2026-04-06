import { redirect } from 'next/navigation';

export default function RegisterPage({ searchParams }) {
  const from =
    typeof searchParams?.from === 'string' ? searchParams.from : '/';
  redirect(`/?auth=signup&returnTo=${encodeURIComponent(from)}`);
}
