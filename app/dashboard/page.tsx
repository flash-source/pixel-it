import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  let projects = []

  try {
    projects = await (prisma as any).project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 6,
    })
  } catch (e) {
    console.error(e)
  }

  const name = session.user.name?.split(' ')[0] ?? 'there'

  return (
    <main className="min-h-screen bg-[#07070d] text-white px-5 md:px-10 py-12 max-w-6xl mx-auto">
      <div className="mb-10">
        <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
          className="text-[10px] text-white/25 uppercase tracking-widest mb-2">
          dashboard
        </p>
        <h1 style={{ fontFamily: "'Syne', sans-serif" }}
          className="text-[32px] md:text-[40px] font-black text-[#f0f0fa]">
          hey, {name}.
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {quickActions.map((a) => (
          <Link key={a.href} href={a.href}
            className="flex items-center gap-4 p-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: a.accentDim }}>
              {a.icon}
            </div>
            <div>
              <p style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-[14px] font-bold text-white/80 group-hover:text-white transition-colors">
                {a.label}
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                className="text-[10px] text-white/25">
                {a.sub}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-[11px] text-white/30 uppercase tracking-widest">
            recent projects
          </p>
          <Link href="/projects"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-[11px] text-[#6c63ff] hover:text-[#9b8cff] transition-colors">
            view all →
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] border-dashed p-12 text-center">
            <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
              className="text-[12px] text-white/20 mb-4">
              no projects yet
            </p>
            <Link href="/create"
              className="text-[11px] text-[#6c63ff] hover:text-[#9b8cff] transition-colors"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              create your first one →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {projects.map((p: any) => (
              <Link key={p.id} href={`/create?id=${p.id}`}
                className="group rounded-xl border border-white/[0.07] overflow-hidden hover:border-white/[0.15] transition-all">
                <div className="aspect-square bg-[#111118] relative overflow-hidden">
                  {p.thumbnail ? (
                    <img src={p.thumbnail} alt={p.name} className="w-full h-full object-contain" style={{ imageRendering: 'pixelated' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/10 text-2xl">✏</span>
                    </div>
                  )}
                </div>
                <div className="px-2 py-2 border-t border-white/[0.05]">
                  <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    className="text-[10px] text-white/40 truncate">{p.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

const quickActions = [
  { href: '/create', label: 'Manual Editor', sub: 'draw from scratch', icon: '✏️', accentDim: 'rgba(108,99,255,0.15)' },
  { href: '/generate/from-image', label: 'Image → Pixel', sub: 'convert a photo', icon: '🖼', accentDim: 'rgba(255,107,53,0.15)' },
  { href: '/avatar', label: 'Pixel Avatar', sub: 'build your character', icon: '◈', accentDim: 'rgba(0,212,170,0.15)' },
]