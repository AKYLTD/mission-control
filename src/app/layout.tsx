import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mission Control',
  description: 'Project monitoring and management dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen">
          {/* Header */}
          <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎛️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Mission Control</h1>
                  <p className="text-xs text-slate-400">Project Monitoring Dashboard</p>
                </div>
              </div>
              <nav className="flex items-center gap-4">
                <a href="/" className="text-sm text-slate-300 hover:text-white transition">Dashboard</a>
                <a href="/projects" className="text-sm text-slate-300 hover:text-white transition">Projects</a>
                <a href="/scans" className="text-sm text-slate-300 hover:text-white transition">Scans</a>
              </nav>
            </div>
          </header>

          {/* Main content */}
          <main className="max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
