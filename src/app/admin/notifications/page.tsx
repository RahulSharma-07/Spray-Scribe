import { getAdminNotifications, getAllUsers } from "./actions";
import { NotificationsAdminClient } from "./NotificationsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const [{ notifications, total }, users] = await Promise.all([
    getAdminNotifications(1),
    getAllUsers(),
  ]);

  return (
    <NotificationsAdminClient
      initialNotifications={notifications}
      initialTotal={total}
      users={users}
    />
  );
}
