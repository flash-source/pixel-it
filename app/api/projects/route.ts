import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { name, type, thumbnail, canvasData } = await req.json()

    const project = await (prisma as any).project.create({
      data: {
        userId: session.user.id,
        name: name || 'untitled',
        type: type || 'manual',
        thumbnail,
        canvasData,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to save project' }, { status: 500 })
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const projects = await (prisma as any).project.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, type: true, thumbnail: true, createdAt: true, updatedAt: true },
  })

  return NextResponse.json(projects)
}