import { redirect } from 'next/navigation';

export default function LoginPage({ searchParams }) {
  const from =
    typeof searchParams?.from === 'string' ? searchParams.from : '/';
  redirect(`/?auth=signin&returnTo=${encodeURIComponent(from)}`);
}
