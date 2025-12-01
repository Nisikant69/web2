import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <Link href="/authenticate/login" className="text-black text-4xl font-semibold hover:underline">
        login
      </Link>
    </div>
  );
}
