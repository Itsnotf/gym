import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';
import { Toaster } from '@/components/ui/sonner';

export default function PublicLayout({ children }: PropsWithChildren) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-100 text-slate-900">
            <header className="border-b border-zinc-200 bg-white/80 backdrop-blur">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <Link href="/" className="text-lg font-semibold tracking-tight">
                        Radiant Gym
                    </Link>
                    <nav className="flex items-center gap-4 text-sm font-medium">
                        <Link href="/classes" className="hover:text-orange-600 transition-colors">Classes</Link>
                        <Link href="/facilities" className="hover:text-orange-600 transition-colors">Facilities</Link>
                        <Link href="/login" className="rounded-full border border-slate-900 px-4 py-1 text-xs uppercase tracking-wide hover:bg-slate-900 hover:text-white transition">Sign In</Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl px-6 py-10">
                {children}
            </main>
            <Toaster position="top-right" />
        </div>
    );
}
