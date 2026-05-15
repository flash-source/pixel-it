import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import EditorShell from '@/components/editor/EditorShell'

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function CreatePage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await searchParams
  let initialData = null

  if (id) {
    const project = await (prisma as any).project.findFirst({
      where: { id, userId: session.user.id },
    })
    if (project) {
      initialData = {
        id: project.id,
        name: project.name,
        canvasData: project.canvasData as { width: number; height: number; grid: (string | null)[] },
      }
    }
  }

  return <EditorShell initialData={initialData} />
}