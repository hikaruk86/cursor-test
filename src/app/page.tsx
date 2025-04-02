import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { prisma } from '@/lib/prisma';
import { Todo } from '@/components/Todo';
import { AuthForm } from '@/components/auth/AuthForm';
import { CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getServerData() {
  try {
    const supabase = createServerComponentClient({
      cookies,
    });

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { session: null, tasks: [] };
    }

    const tasks = await prisma.task.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return { session, tasks };
  } catch (error) {
    console.error('Error fetching server data:', error);
    return { session: null, tasks: [] };
  }
}

export default async function Home() {
  const { session, tasks } = await getServerData();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto py-12">
        <div className="flex items-center justify-center gap-3 mb-12">
          <CheckCircle2 className="h-10 w-10 text-primary" />
          <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            タスク管理アプリ
          </h1>
        </div>
        {session ? (
          <Suspense fallback={
            <div className="text-center py-8 text-muted-foreground animate-pulse">
              読み込み中...
            </div>
          }>
            <Todo initialTasks={tasks} userId={session.user.id} />
          </Suspense>
        ) : (
          <AuthForm />
        )}
      </div>
    </div>
  );
}
