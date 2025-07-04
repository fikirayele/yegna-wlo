
import { AdminReportsManager } from "@/components/dashboard/admin-reports-manager";
import { getPosts } from "@/lib/api";

export default async function AdminReportsPage() {
    // Fetch all posts on the server
    const allPosts = await getPosts();
    // Filter for posts that have reports
    const reportedPosts = allPosts.filter(post => post.reports && post.reports.length > 0);
    
    return (
        <div>
            <h1 className="text-3xl font-bold font-headline mb-8">Manage Reported Content</h1>
            <AdminReportsManager initialReportedPosts={reportedPosts} />
        </div>
    );
}
