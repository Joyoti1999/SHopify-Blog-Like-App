import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Card, Text, BlockStack, DataTable } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      blogs(first: 20) {
        nodes {
          title
          articles(first: 100) {
            nodes {
              id
              title
              metafield(namespace: "custom", key: "likes_count") {
                value
              }
            }
          }
        }
      }
    }
  `);

  const result = await response.json();

  const articles = [];

  result.data.blogs.nodes.forEach((blog) => {
    blog.articles.nodes.forEach((article) => {
      articles.push({
        title: article.title,
        likes: parseInt(article.metafield?.value || "0", 10),
      });
    });
  });

  // Sort by likes descending
  articles.sort((a, b) => b.likes - a.likes);

  const totalBlogs = articles.length;
  const totalLikes = articles.reduce((sum, article) => sum + article.likes, 0);

  return json({
    totalBlogs,
    totalLikes,
    articles,
  });
}

export default function AnalyticsPage() {
  const { totalBlogs, totalLikes, articles } = useLoaderData();

  const rows = articles.map((article, index) => [
    index + 1,
    article.title,
    article.likes,
  ]);

  return (
    <Page title="Blog Analytics">
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Summary
            </Text>
            <Text as="p">Total Blog Posts: {totalBlogs}</Text>
            <Text as="p">Total Likes: {totalLikes}</Text>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Blog Like Counts
            </Text>

            <DataTable
              columnContentTypes={["numeric", "text", "numeric"]}
              headings={["#", "Blog Title", "Likes"]}
              rows={rows}
            />
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}