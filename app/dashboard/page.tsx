"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface User {
  email: string;
  uuid: string;
  paidUntil: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    fetch("/api/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
      })
      .catch((err) => {
        console.error("Ошибка при получении пользователя:", err);
        router.push("/login");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  const handleUpdateXUI = async () => {
    try {
      const res = await fetch("/api/update-xui", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Не удалось обновить x-ui");
      }
      const data = await res.json();
      toast({
        title: "Успешно",
        description: data.message,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить x-ui",
      });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Загрузка...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Не удалось загрузить пользователя
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">Личный кабинет</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Email:</span>
              <span className="font-medium break-all">{user.email}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">UUID:</span>
              <span className="font-medium break-all">{user.uuid}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Paid Until:</span>
              <span className="font-medium">{user.paidUntil}</span>
            </div>
          </div>
          <Button onClick={handleUpdateXUI} className="w-full">
            Обновить x-ui
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
