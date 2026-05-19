export function calculateDistanceKm(
  userLat: number,
  userLng: number,
  restaurantLat: number,
  restaurantLng: number
) {
  const earthRadiusKm = 6371;

  const toRadians = (degree: number) => degree * (Math.PI / 180);

  const latDifference = toRadians(restaurantLat - userLat);
  const lngDifference = toRadians(restaurantLng - userLng);

  const a =
    Math.sin(latDifference / 2) * Math.sin(latDifference / 2) +
    Math.cos(toRadians(userLat)) *
      Math.cos(toRadians(restaurantLat)) *
      Math.sin(lngDifference / 2) *
      Math.sin(lngDifference / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Number((earthRadiusKm * c).toFixed(2));
}
