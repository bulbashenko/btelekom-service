"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Ошибка регистрации");
        return;
      }

      alert("Успешная регистрация! Теперь войди.");
      router.push("/login");
    } catch (err: any) {
      console.error(err);
      alert("Что-то пошло не так");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white shadow-md rounded px-8 py-6"
      >
        <h1 className="text-xl mb-4">Регистрация</h1>
        <div className="mb-4">
          <label className="block mb-2">Email</label>
          <input
            type="email"
            className="border border-gray-300 w-full rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Введи email"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block mb-2">Пароль</label>
          <input
            type="password"
            className="border border-gray-300 w-full rounded px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введи пароль"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded w-full"
        >
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}
