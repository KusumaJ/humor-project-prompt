import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/auth/signin')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_superadmin, is_matrix_admin, email')
        .eq('id', user.id)
        .single()

    if (!profile?.is_superadmin && !profile?.is_matrix_admin) {
        redirect('/access-denied')
    }

    return { user, profile }
}

export default async function PromptChainToolLayout({
                                              children,
                                          }: {
    children: React.ReactNode
}) {
    const { profile } = await getUser()

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Prompt Chain Tool Header */}
            <header className="bg-white dark:bg-gray-800 shadow">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-8">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                <Link href="/prompt-chain-tool">🔗 Prompt Chain Tool</Link>
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <ThemeToggle />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {profile.email}
                            </span>
                            <form action="/auth/signout" method="post">
                                <button className="text-sm px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800 font-medium rounded-md transition-colors">
                                    Sign Out
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    )
}
