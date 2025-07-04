import { AdminUsersManager } from "@/components/dashboard/admin-users-manager";
import { getUsers } from "@/lib/api";

export default async function AdminUsersPage() {
    // Fetch initial data on the server
    const allUsers = await getUsers();

    return (
        <AdminUsersManager initialUsers={allUsers} />
    );
}
