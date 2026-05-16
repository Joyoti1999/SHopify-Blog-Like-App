import { data, useLoaderData } from "react-router";
import { Page, Card, Text } from "@shopify/polaris";
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
    <Page title="Blog Analytics">
      <Card>
        <div style={{ padding: "20px" }}>
          <Text as="h2" variant="headingMd">
            Summary
          </Text>
          <p>Total Blog Posts: {totalBlogs}</p>
          <p>Total Likes: {totalLikes}</p>
        </div>
      </Card>
    </Page>
  );
}