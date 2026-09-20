/**
 * Calculates the great-circle distance between two lat/lng points using the
 * Haversine formula. This is the standard way to turn raw pickup/dropoff
 * coordinates into a single "trip distance" feature for the fare model.
 *
 * @param {number} lat1 - pickup latitude, in degrees
 * @param {number} lon1 - pickup longitude, in degrees
 * @param {number} lat2 - dropoff latitude, in degrees
 * @param {number} lon2 - dropoff longitude, in degrees
 * @returns {number} distance in kilometers
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.asin(Math.sqrt(a));

  return R * c;
}
