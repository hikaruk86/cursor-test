'use client';

import { useState } from 'react';
import { Task } from '@prisma/client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Calendar, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/types/supabase';

interface TodoProps {
  initialTasks: Task[];
  userId: string;
}

export function Todo({ initialTasks, userId }: TodoProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('ログアウトしました');
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('ログアウトに失敗しました');
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title || isLoading) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newTask, userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'タスクの追加に失敗しました');
      }

      const task = await response.json();
      setTasks([task, ...tasks]);
      setNewTask({ title: '', description: '' });
    } catch (error) {
      console.error('Error adding task:', error);
      alert(error instanceof Error ? error.message : 'タスクの追加に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || isUpdating === taskId) return;

    try {
      setIsUpdating(taskId);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !task.isCompleted }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'タスクの更新に失敗しました');
      }

      setTasks(tasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error instanceof Error ? error.message : 'タスクの更新に失敗しました');
      // 更新に失敗した場合、UIを元の状態に戻す
      setTasks([...tasks]);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (isUpdating === taskId) return;

    try {
      setIsUpdating(taskId);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'タスクの削除に失敗しました');
      }

      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert(error instanceof Error ? error.message : 'タスクの削除に失敗しました');
    } finally {
      setIsUpdating(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-end mb-8">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </Button>
      </div>

      <Card className="mb-8 border-2 border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5 border-b border-primary/10">
          <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Plus className="h-6 w-6" />
            新しいタスクを追加
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Input
              placeholder="タスクのタイトル"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="text-lg"
            />
            <Textarea
              placeholder="タスクの説明"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="min-h-[100px]"
            />
            <Button 
              onClick={handleAddTask} 
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
            >
              {isLoading ? '追加中...' : 'タスクを追加'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            className={`transform transition-all duration-200 hover:shadow-md
              ${task.isCompleted ? 'bg-muted/50' : 'hover:scale-[1.01]'}
              ${isUpdating === task.id ? 'opacity-50' : ''}`}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Checkbox
                  checked={task.isCompleted}
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  disabled={isUpdating === task.id}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-lg mb-1 ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-primary'}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className={`text-sm mb-2 ${task.isCompleted ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(task.createdAt)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTask(task.id)}
                  disabled={isUpdating === task.id}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            タスクがありません。新しいタスクを追加してください。
          </div>
        )}
      </div>
    </div>
  );
} 