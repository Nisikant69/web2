// app/page.tsx
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const session = await getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-black mb-4">
          Welcome to Aminuteman's App
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Simplify your workflow and boost your productivity
        </p>
        <div className="flex gap-4 justify-center">
          <Link 
            href="/authenticate/login"
            className="px-8 py-4 bg-black text-white text-lg font-semibold rounded-full hover:bg-gray-800 transition-colors"
          >
            Login
          </Link>
          <Link 
            href="/authenticate/register"
            className="px-8 py-4 bg-white text-black text-lg font-semibold rounded-full border-2 border-black hover:bg-gray-100 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  )
}