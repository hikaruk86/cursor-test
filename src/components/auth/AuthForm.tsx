'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AuthError } from '@supabase/supabase-js';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Key } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/types/supabase';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const supabase = createClientComponentClient<Database>();

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = isSignUp
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${location.origin}/auth/callback`,
            },
          })
        : await supabase.auth.signInWithPassword({
            email,
            password,
          });

      if (error) {
        throw error;
      }

      if (isSignUp) {
        toast.success('確認メールを送信しました。メールをご確認ください。');
      } else {
        toast.success('ログインしました。');
        window.location.href = '/';
      }
    } catch (error) {
      if (error instanceof AuthError) {
        switch (error.message) {
          case 'Invalid login credentials':
            toast.error('メールアドレスまたはパスワードが間違っています。');
            break;
          case 'Email not confirmed':
            toast.error('メールアドレスの確認が完了していません。');
            break;
          default:
            toast.error('エラーが発生しました。もう一度お試しください。');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-[350px]">
        <Card className="shadow-lg border-primary/20">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {isSignUp ? 'アカウント作成' : 'ログイン'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-primary/80">
                  <Mail className="h-4 w-4" />
                  メールアドレス
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full focus-visible:ring-primary/30 border-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-primary/80">
                  <Key className="h-4 w-4" />
                  パスワード
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="6文字以上で入力"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full focus-visible:ring-primary/30 border-primary/20"
                  minLength={6}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 transition-colors"
                disabled={isLoading}
                size="lg"
              >
                {isLoading
                  ? '処理中...'
                  : isSignUp
                  ? 'アカウントを作成'
                  : 'ログイン'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary/70 hover:text-primary transition-colors"
                disabled={isLoading}
              >
                {isSignUp
                  ? 'すでにアカウントをお持ちの方はこちら'
                  : 'アカウントをお持ちでない方はこちら'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 