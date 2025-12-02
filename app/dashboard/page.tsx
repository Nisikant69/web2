import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import LogoutButton from '@/app/components/LogoutButton'

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/authenticate/login')
  }

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      username: true,
      fullName: true,
      createdAt: true,
    }
  })

  if (!user) {
    redirect('/authenticate/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">
              Welcome, {user.fullName}! 👋
            </h1>
            <p className="text-gray-600">
              You're successfully logged in to Aminuteman App
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-black mb-6">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-600 uppercase">
                Full Name
              </label>
              <p className="text-lg text-black mt-1">{user.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 uppercase">
                Username
              </label>
              <p className="text-lg text-black mt-1">@{user.username}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 uppercase">
                Email
              </label>
              <p className="text-lg text-black mt-1">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 uppercase">
                Member Since
              </label>
              <p className="text-lg text-black mt-1">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}