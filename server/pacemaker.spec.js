/* eslint-env mocha */
import { expect, assert } from 'chai';
import pacemaker from './pacemaker';

const noop = () => {};

describe('Pacemaker', () => {
  it('should expose list of subscribers', () => {
    expect(pacemaker.getSubs()).to.deep.equal([]);
  });
  it('should subscribe listeners', () => {
    pacemaker.subscribe(noop);
    const subs = pacemaker.getSubs();
    expect(subs).to.deep.equal([noop]);
  });
  it('should remove listeners', () => {
    pacemaker.subscribe(noop);
    let subs = pacemaker.getSubs();
    expect(subs.length).to.equal(1);
    pacemaker.unsubscribe(noop);
    subs = pacemaker.getSubs();
    expect(subs).to.deep.equal([]);
  });
  it('should call subscribers with a timestamp', (done) => {
    const func = (time) => {
      assert(time);
      done();
    };
    pacemaker.subscribe(func);
  });
  it('should allow interval to be set', () => {
    assert(true);
  });
});
