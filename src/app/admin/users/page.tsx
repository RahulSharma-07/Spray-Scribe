import { prisma } from "@/lib/prisma";
import UserTable from "./UserTable";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display text-white">Users</h1>
        <p className="text-gray-400 mt-2">Manage all registered users on the platform.</p>
      </div>

      <UserTable initialUsers={users} />
    </div>
  );
}
