// Haversine great-circle distance between two lat/lng points, in kilometers.
const EARTH_RADIUS_KM = 6371;

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function haversineDistance(pickupLat, pickupLon, dropoffLat, dropoffLon) {
  const dLat = toRadians(dropoffLat - pickupLat);
  const dLon = toRadians(dropoffLon - pickupLon);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(pickupLat)) *
      Math.cos(toRadians(dropoffLat)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}
