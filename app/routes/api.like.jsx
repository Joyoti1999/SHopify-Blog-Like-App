import { data } from "react-router";
import { authenticate } from "../shopify.server";

export async function action({ request }) {
  try {
    // App Proxy requests-এর জন্য
    const { admin } = await authenticate.public.appProxy(request);

    const body = await request.json();
    const { articleId } = body;

    if (!articleId) {
      return data(
        {
          success: false,
          error: "articleId is required",
        },
        { status: 400 }
      );
    }

    const query = `
      query GetArticle($id: ID!) {
        article(id: $id) {
          metafield(namespace: "custom", key: "likes_count") {
            value
          }
        }
      }
    `;

    const queryResponse = await admin.graphql(query, {
      variables: { id: articleId },
    });

    const queryJson = await queryResponse.json();

    const currentLikes = parseInt(
      queryJson?.data?.article?.metafield?.value || "0",
      10
    );

    const newLikes = currentLikes + 1;

    const mutation = `
      mutation SetLikes($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors {
            field
            message
          }
        }
      }
    `;

    const mutationResponse = await admin.graphql(mutation, {
      variables: {
        metafields: [
          {
            ownerId: articleId,
            namespace: "custom",
            key: "likes_count",
            type: "number_integer",
            value: String(newLikes),
          },
        ],
      },
    });

    const mutationJson = await mutationResponse.json();

    const errors =
      mutationJson?.data?.metafieldsSet?.userErrors || [];

    if (errors.length > 0) {
      return data(
        {
          success: false,
          errors,
        },
        { status: 400 }
      );
    }

    return data({
      success: true,
      likes: newLikes,
    });
  } catch (error) {
    return data(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}