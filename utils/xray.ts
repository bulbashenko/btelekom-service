// utils/updateXUI.ts
import { prisma } from "@/lib/prisma";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import dayjs from "dayjs"; // для удобной работы с датами

export async function updateXRayConfig() {
  // 1. Получаем активных юзеров из нашей БД (Postgres/MySQL/SQLite — неважно)
  const activeUsers = await prisma.user.findMany({
    where: {
      paidUntil: {
        gt: new Date(),
      },
    },
  });

  // 2. Открываем /etc/x-ui/x-ui.db
  const db = await open({
    filename: "/etc/x-ui/x-ui.db",
    driver: sqlite3.Database,
  });

  // 3. Тут нужно ЗНАТЬ, в какую таблицу вставлять/обновлять.
  // Допустим, в x-ui есть таблица `client`, где поля (id, uuid, email, expire, ...).
  // Допустим, expire — это время в unixtime, и email — просто подпись.

  for (const user of activeUsers) {
    const userUuid = user.uuid; // UUID
    const userEmail = user.email;
    // Допустим, x-ui хранит дату окончания как unixtime (в секундах)
    const expireUnix = dayjs(user.paidUntil).unix();

    // 4. Проверяем, нет ли уже записи с таким uuid
    const existing = await db.get(
      "SELECT * FROM client WHERE uuid = ?",
      userUuid
    );

    if (!existing) {
      // Если нет, вставляем
      await db.run(
        "INSERT INTO client (uuid, email, expire) VALUES (?, ?, ?)",
        [userUuid, userEmail, expireUnix]
      );
    } else {
      // Если есть, обновляем
      await db.run(
        "UPDATE client SET email = ?, expire = ? WHERE uuid = ?",
        [userEmail, expireUnix, userUuid]
      );
    }
  }

  // 5. Можно ещё пройтись по тем, у кого подписка истекла, и удалить их
  // Чтобы вычистить из x-ui.db
  const expiredUsers = await prisma.user.findMany({
    where: {
      OR: [
        { paidUntil: null },
        { paidUntil: { lte: new Date() } },
      ],
    },
  });
  for (const user of expiredUsers) {
    await db.run("DELETE FROM client WHERE uuid = ?", [user.uuid]);
  }

  // 6. Закрываем соединение
  await db.close();

  // 7. Если надо — ещё и перезапускаем XRay (или x-ui), но
  // x-ui, кажется, сам умеет обновлять конфиг, когда меняется БД.
  // exec("systemctl restart x-ui", ... ) — если требуется
}
