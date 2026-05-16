import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function ProjectsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  let projects = []

  try {
    projects = await (prisma as any).project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' },
    })
  } catch (e) {
    console.error(e)
  }

  return (
    <main className="min-h-screen bg-[#07070d] text-white px-5 md:px-10 py-12 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-[10px] text-white/25 uppercase tracking-widest mb-2">my projects</p>
          <h1 style={{ fontFamily: "'Syne', sans-serif" }}
            className="text-[32px] font-black text-[#f0f0fa]">
            all projects
            <span className="text-white/20 text-[20px] ml-3">{projects.length}</span>
          </h1>
        </div>
        <Link href="/create"
          className="text-[11px] font-semibold text-white bg-[#6c63ff] hover:bg-[#7b73ff] px-5 py-2.5 rounded-lg transition-colors"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          + new project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] border-dashed p-20 text-center">
          <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
            className="text-[12px] text-white/20 mb-4">
            nothing here yet
          </p>
          <Link href="/create"
            className="text-[11px] text-[#6c63ff] hover:text-[#9b8cff] transition-colors"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            start creating →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {projects.map((p: any) => (
            <Link key={p.id} href={`/create?id=${p.id}`}
              className="group rounded-xl border border-white/[0.07] overflow-hidden hover:border-[#6c63ff]/40 transition-all hover:-translate-y-1 duration-200">
              <div className="aspect-square bg-[#111118] relative">
                {p.thumbnail ? (
                  <img src={p.thumbnail} alt={p.name} className="w-full h-full object-contain"
                    style={{ imageRendering: 'pixelated' }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/10 text-3xl">
                      {p.type === 'converted' ? '🖼' : p.type === 'avatar' ? '◈' : '✏'}
                    </span>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      background: p.type === 'converted' ? 'rgba(255,107,53,0.2)' : p.type === 'avatar' ? 'rgba(0,212,170,0.2)' : 'rgba(108,99,255,0.2)',
                      color: p.type === 'converted' ? '#ff6b35' : p.type === 'avatar' ? '#00d4aa' : '#6c63ff',
                    }}
                  >
                    {p.type}
                  </span>
                </div>
              </div>
              <div className="px-3 py-2.5 border-t border-white/[0.05]">
                <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-[11px] text-white/50 truncate group-hover:text-white/80 transition-colors">
                  {p.name}
                </p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  className="text-[9px] text-white/20 mt-0.5">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}