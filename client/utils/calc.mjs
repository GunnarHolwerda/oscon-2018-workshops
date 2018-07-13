/**
 * Check the rotation direction of three points
 * @param  {array[number]}      p1 2d point
 * @param  {array[number]}      p2 2d point
 * @param  {array[number]}      p3 2d point
 * @return {number}                1 for clockwise, 2 for counter-clockwise, 0 for colinear
 */
const rotationDirection = ([x1, y1], [x2, y2], [x3, y3]) => {
  if (((y3 - y1) * (x2 - x1)) > ((y2 - y1) * (x3 - x1))) return 1;
  if (((y3 - y1) * (x2 - x1)) === ((y2 - y1) * (x3 - x1))) return 0;
  return -1;
};

/**
 * Check if a point exists on a line segment
 * @param  {array[number]}     p1 2d point
 * @param  {array[number]}     p2 2d point
 * @param  {array[number]}     s  2d point
 * @return {boolean}              true if `s` is in the segment, false if it's not
 */
const containsSegment = ([x1, y1], [x2, y2], [sx, sy]) => {
  if (x1 < x2 && x1 < sx && sx < x2) return true;
  if (x2 < x1 && x2 < sx && sx < x1) return true;
  if (y1 < y2 && y1 < sy && sy < y2) return true;
  if (y2 < y1 && y2 < sy && sy < y1) return true;
  if ((x1 === sx && y1 === sy) || (x2 === sx && y2 === sy)) return true;
  return false;
};

/**
 * Check if two line segments intersect
 * stolen from https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function#30160064
 * Explanation available in the above link
 *
 * @param  {array[number]}     p1 2d point
 * @param  {array[number]}     p2 2d point
 * @param  {array[number]}     p3 2d point
 * @param  {array[number]}     p4 2d point
 * @return {boolean}              true if they intersect, false if they don't
 */
export const segmentsIntersect = (p1, p2, p3, p4) => {
  const r1 = rotationDirection(p1, p2, p4);
  const r2 = rotationDirection(p1, p2, p3);
  const r3 = rotationDirection(p1, p3, p4);
  const r4 = rotationDirection(p2, p3, p4);

  // If the segments are on the same line, we have to check for overlap.
  if (r1 === 0 && r2 === 0 && r3 === 0 && r4 === 0) {
    return containsSegment(p1, p2, p3)
      || containsSegment(p1, p2, p4)
      || containsSegment(p3, p4, p1)
      || containsSegment(p3, p4, p2);
  }

  // If the faces rotate opposite directions, they intersect.
  return r1 !== r2 && r3 !== r4;
};

/**
 * Check if a line-segment intersects a polyline
 * @param  {array[number]}             s1       2d point
 * @param  {array[number]}             s2       2d point
 * @param  {array[array[number]]}      polyline array of 2d points
 * @return {boolean}                            true if the segment intersects, false if it doesn't
 */
export const segmentIntersectsPolyline = (s1, s2, polyline) => polyline.some((p1, index) => (
  index + 1 < polyline.length
  && segmentsIntersect(s1, s2, p1, polyline[index + 1])
));

/**
 * check if two polylines intersect each other
 * @param  {array[array[number]]}     poly1 array of 2d points
 * @param  {array[array[number]]}     poly2 array of 2d points
 * @return {boolean}                        true if they intersect, false if they don't
 */
export const polylinesIntersect = (poly1, poly2) => poly1.some((p1, index) => (
  index + 1 < poly1.length
  && segmentIntersectsPolyline(p1, poly1[index + 1], poly2)
));

/**
 * Check if a point is inside a polygon
 * stolen from https://github.com/substack/point-in-polygon/blob/master/index.js
 * ray-casting algorithm based on
 * http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
 *
 * @param  {array[number]}          x    2d point
 * @param  {array[array[number]]}   poly array of 2d points
 * @return {boolean}                     true if the test point is inside the polyline, false if it isn't
 */
export const pointIsInPolygon = ([x, y], poly) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i, i += 1) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];

    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi) / (yj - yi)) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

/**
 * Check if a polyline is closed, meaning that the last point
 * lands on the first point.
 *
 * @param  {array[array[number]]}  poly array of 2d points
 * @return {Boolean}                    true if the first point of the polyline is the same as the last
 */
export const isClosed = (poly) => {
  const [x1, y1] = poly[0];
  const [xn, yn] = poly[poly.length - 1];
  return (x1 === xn && y1 === yn);
};
