import { getUsers, getPosts } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, ShieldX, LineChart } from "lucide-react";
import { UserTrendsChart } from "./analytics/user-trends-chart";
import { PostTrendsChart } from "./analytics/post-trends-chart";
import { ReportOverviewChart } from "./analytics/report-overview-chart";
import { Separator } from "../ui/separator";

export async function AdminDashboard() {
    const users = await getUsers();
    const posts = await getPosts();

    const totalUsers = users.length;
    const totalPosts = posts.length;
    const totalStrikes = users.reduce((acc, user) => acc + (user.strikes || 0), 0);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPosts}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Strikes Issued</CardTitle>
                        <ShieldX className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStrikes}</div>
                    </CardContent>
                </Card>
            </div>

            <Separator />
            
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <LineChart className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold font-headline">Analytics Overview</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    <UserTrendsChart users={users} />
                    <PostTrendsChart posts={posts} />
                    <ReportOverviewChart posts={posts} />
                </div>
            </div>
        </div>
    );
}
