export default function decodeGeoHash(geohash) {
  if (!geohash || geohash.length === 0) throw new Error('Missing geohash value');

  const BITS = [16, 8, 4, 2, 1];
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let isEven = 1;
  const latitude = [];
  const lon = [];
  latitude[0] = -90.0;
  latitude[1] = 90.0;
  lon[0] = -180.0;
  lon[1] = 180.0;
  let base32Decoded;

  geohash.split('').forEach((item) => {
    base32Decoded = BASE32.indexOf(item);
    BITS.forEach((mask) => {
      if (isEven) {
        refineInterval(lon, base32Decoded, mask);
      } else {
        refineInterval(latitude, base32Decoded, mask);
      }
      isEven = !isEven;
    });
  });
  const latitudeCenter = (latitude[0] + latitude[1]) / 2;
  const lonCenter = (lon[0] + lon[1]) / 2;

  return { latitude: latitudeCenter, longitude: lonCenter};
}

function refineInterval(interval, base32Decoded, mask) {
  /* eslint no-bitwise: 0 */
  if (base32Decoded & mask) {
    interval[0] = (interval[0] + interval[1]) / 2;
  } else {
    interval[1] = (interval[0] + interval[1]) / 2;
  }
}
