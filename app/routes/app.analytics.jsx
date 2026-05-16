import { data, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  await authenticate.admin(request);

  return data({
    totalBlogs: 0,
    totalLikes: 0,
  });
}

export default function AnalyticsPage() {
  const { totalBlogs, totalLikes } = useLoaderData();

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "24px" }}>
        Blog Analytics
      </h1>

      <div
        style={{
          background: "#ffffff",
          border: "1px solid #e1e3e5",
          borderRadius: "12px",
          padding: "24px",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Summary</h2>
        <p>Total Blog Posts: {totalBlogs}</p>
        <p>Total Likes: {totalLikes}</p>
      </div>
    </div>
  );
}