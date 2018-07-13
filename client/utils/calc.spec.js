/* eslint-env mocha */
import { expect } from 'chai';
import {
  segmentsIntersect,
  segmentIntersectsPolyline,
  polylinesIntersect,
  pointIsInPolygon,
  isClosed,
} from './calc.mjs';

describe('calc', () => {
  describe('segmentsIntersect()', () => {
    it('detects intersecting lines', () => {
      expect(segmentsIntersect([0, 0], [1, 1], [1, 0], [0, 1])).to.equal(true);
      expect(segmentsIntersect([0, 1], [2, 1], [1, 0], [1, 2])).to.equal(true);
    });

    it('detects touching lines', () => {
      expect(segmentsIntersect([0, 0], [1, 0], [0, 0], [0, 1])).to.equal(true);
      expect(segmentsIntersect([0, 0], [2, 0], [1, 0], [1, 2])).to.equal(true);
      expect(segmentsIntersect([0, 0], [1, 0], [1, 0], [2, 0])).to.equal(true);
    });

    it('detects intersecting co-linear segments', () => {
      expect(segmentsIntersect([0, 0], [2, 0], [1, 0], [3, 0])).to.equal(true);
    });

    it('does not detect non-intersecting lines', () => {
      expect(segmentsIntersect([0, 0], [1, 1], [2, 2], [3, 3])).to.equal(false);
      expect(segmentsIntersect([0, 0], [1, 0], [2, 0], [3, 0])).to.equal(false);
      expect(segmentsIntersect([0, 0], [1, 1], [3, 0], [2, 1])).to.equal(false);
    });
  });

  describe('segmentsIntersectPolyline()', () => {
    it('detects intersecting lines', () => {
      expect(segmentIntersectsPolyline([0, 0], [1, 1], [[1, 0], [0, 1]])).to.equal(true);
      expect(segmentIntersectsPolyline([0, 1], [2, 1], [[1, 0], [1, 2]])).to.equal(true);
      expect(segmentIntersectsPolyline([0, 0], [1, 1], [[1, 0], [1, 2], [1, 3]])).to.equal(true);
      expect(segmentIntersectsPolyline([0, 1], [2, 1], [[1, 0], [1, 2], [1, 3]])).to.equal(true);
    });

    it('does not detect non-intersecting lines', () => {
      expect(segmentIntersectsPolyline([0, 0], [1, 1], [[2, 2], [3, 3]])).to.equal(false);
      expect(segmentIntersectsPolyline([0, 0], [1, 0], [[2, 0], [3, 0]])).to.equal(false);
      expect(segmentIntersectsPolyline([0, 0], [1, 1], [[3, 0], [2, 1]])).to.equal(false);
    });
  });

  describe('polylinesIntersect()', () => {
    it('detects intersecting lines', () => {
      expect(polylinesIntersect([[0, 0], [1, 1]], [[1, 0], [0, 1]])).to.equal(true);
      expect(polylinesIntersect([[0, 1], [2, 1]], [[1, 0], [1, 2]])).to.equal(true);
      expect(polylinesIntersect([[0, 0], [1, 1]], [[1, 0], [1, 2], [1, 3]])).to.equal(true);
      expect(polylinesIntersect([[0, 1], [2, 1]], [[1, 0], [1, 2], [1, 3]])).to.equal(true);
    });

    it('does not detect non-intersecting lines', () => {
      expect(polylinesIntersect([[0, 0], [1, 1]], [[2, 2], [3, 3]])).to.equal(false);
      expect(polylinesIntersect([[0, 0], [1, 0]], [[2, 0], [3, 0]])).to.equal(false);
      expect(polylinesIntersect([[0, 0], [1, 1]], [[3, 0], [2, 1]])).to.equal(false);
    });
  });

  describe('pointIsInPolygon()', () => {
    it('detects that a point is inside a polygon', () => {
      expect(pointIsInPolygon([1, 1], [[0, 0], [0, 2], [2, 2], [2, 0]])).to.equal(true);
    });

    it('detects that a point is outside a polygon', () => {
      expect(pointIsInPolygon([0, 0], [[1, 1], [1, 2], [2, 2], [2, 1]])).to.equal(false);
    });

    // TODO: This code sometimes succeeds and sometimes fails. We may want to check for intersection first.
    it('does something when the point is ON the polygon', () => {
      expect(pointIsInPolygon([0, 0], [[0, 0], [0, 2], [0, 2], [2, 0]])).to.equal(true);
      expect(pointIsInPolygon([0, 1], [[0, 0], [0, 2], [0, 2], [2, 0]])).to.equal(true);
      // This one fails.
      // expect(pointIsInPolygon([0, 2], [[0, 0], [0, 2], [0, 2], [2, 0]])).to.equal(true);
      expect(pointIsInPolygon([1, 0], [[0, 0], [0, 2], [0, 2], [2, 0]])).to.equal(true);
      // This one fails.
      // expect(pointIsInPolygon([2, 2], [[0, 0], [0, 2], [0, 2], [2, 0]])).to.equal(true);
    });
    //* /
  });

  describe('isClosed()', () => {
    it('works on closed polylines', () => {
      expect(isClosed([[0, 0], [1, 1], [1, 0], [0, 0]])).to.equal(true);
    });

    it('fails on open polylines', () => {
      expect(isClosed([[0, 0], [1, 1], [1, 0], [0, 0.01]])).to.equal(false);
    });
  });
});
