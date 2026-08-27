import { auth } from "@/auth"
import { redirect } from "next/navigation"
import DashboardClient from "@/components/dashboard/DashboardClient"
import prisma from "@/lib/db"

export default async function Home() {
  const session = await auth()
  
  if (!session?.user) {
    // Basic landing page asking to sign in
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="glass-panel p-10 rounded-[28px] max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-accent to-accent-strong rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-accent/20">
            <span className="text-white text-2xl font-bold">V</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Visual Repo Manager</h1>
          <p className="text-muted-foreground mb-8">
            Manage your deployed websites across Vercel, GitHub Pages, and more with crystal clarity.
          </p>
          <a href="/api/auth/signin" className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors w-full shadow-md">
            Sign in with GitHub
          </a>
        </div>
      </div>
    )
  }

  // Fetch repositories for the user
  // (In a real app, we'd associate repos with users. For this MVP, we fetch all or just use a shared DB)
  const repos = await prisma.repository.findMany({
    include: {
      preview: true,
      websites: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return (
    <main className="min-h-screen bg-background">
      <DashboardClient initialRepos={repos} user={session.user} />
    </main>
  )
}
