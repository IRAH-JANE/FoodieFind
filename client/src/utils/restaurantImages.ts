export function getRestaurantImage(category: string, imageUrl?: string | null) {
  if (imageUrl) return imageUrl;

  const normalizedCategory = category.toLowerCase();

  if (
    normalizedCategory.includes("burger") ||
    normalizedCategory.includes("fast food") ||
    normalizedCategory.includes("fast_food")
  ) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd";
  }

  if (
    normalizedCategory.includes("cafe") ||
    normalizedCategory.includes("coffee") ||
    normalizedCategory.includes("milktea") ||
    normalizedCategory.includes("tea")
  ) {
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24";
  }

  if (
    normalizedCategory.includes("bakery") ||
    normalizedCategory.includes("bread") ||
    normalizedCategory.includes("dessert")
  ) {
    return "https://images.unsplash.com/photo-1509440159596-0249088772ff";
  }

  if (
    normalizedCategory.includes("korean") ||
    normalizedCategory.includes("japanese") ||
    normalizedCategory.includes("asian") ||
    normalizedCategory.includes("ramen")
  ) {
    return "https://images.unsplash.com/photo-1557872943-16a5ac26437e";
  }

  return "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";
}
