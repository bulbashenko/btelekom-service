// app/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">btelekom</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <Image
              src="/put.jpg"
              alt="BTelekom Service"
              className="rounded-lg"
              width={300} // Provide width
              height={300} // Provide height
            />
          </div>

          <div className="space-y-4">
            <Button
              variant="default"
              className="w-full"
              onClick={() => router.push('/login')}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Войти
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/register')}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Зарегистрироваться
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
