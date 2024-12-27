"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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

  // Кнопка, которая делает POST /api/update-xui
  const handleUpdateXUI = async () => {
    try {
      const res = await fetch("/api/update-xui", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Не удалось обновить x-ui");
      }
      const data = await res.json();
      alert(`Успешно: ${data.message}`);
    } catch (error) {
      console.error(error);
      alert("Ошибка при обновлении x-ui");
    }
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <div>Не удалось загрузить пользователя</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-xl mb-4">Личный кабинет</h1>
      <p>Email: {user.email}</p>
      <p>UUID: {user.uuid}</p>
      <p>Paid Until: {user.paidUntil}</p>

      {/* Кнопка для обновления /etc/x-ui/x-ui.db */}
      <button
        onClick={handleUpdateXUI}
        className="bg-green-500 text-white px-4 py-2 mt-4 rounded"
      >
        Обновить x-ui
      </button>
    </div>
  );
}

