export default function distance(vec1, vec2) {
  return Math.sqrt(
    (vec1.x - vec2.x) ** 2 +
    (vec1.y - vec2.y) ** 2 +
    (vec1.z - vec2.z) ** 2
  );
}
