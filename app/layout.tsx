import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'WorkplanGantt — FAO Ukraine',
  description: 'Create and manage project workplans with interactive Gantt charts',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }} className="bg-slate-50 min-h-screen antialiased">
        <nav className="bg-[#0d1b2a] border-b border-white/10 px-6 flex items-center justify-between h-14 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="1" y="6" width="12" height="2" rx="1" fill="white"/>
                <rect x="1" y="2" width="7" height="2" rx="1" fill="white" opacity="0.7"/>
                <rect x="1" y="10" width="9" height="2" rx="1" fill="white" opacity="0.5"/>
              </svg>
            </div>
            <span className="text-white font-bold text-base tracking-tight">WorkplanGantt</span>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white/40 text-xs font-medium tracking-widest uppercase">FAO Ukraine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white/40 text-xs">Live</span>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
