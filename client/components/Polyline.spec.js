/* eslint-env mocha */
import { expect, shallow, React } from '../utils/testComponent';
import Polyline from './Polyline';

describe('Polyline', () => {
  it('renders without crashing', () => {
    const subject = shallow(<Polyline />);
    expect(subject.html()).to.equal(null);
  });

  it('renders attributes downward', () => {
    const subject = shallow(<Polyline points={[[0, 0], [5, 5]]} fill="#333" />);
    expect(subject.prop('fill')).to.equal('#333');
  });

  it('renders a line as expected', () => {
    const points = [[0, 0], [100, 100]];
    const subject = shallow(<Polyline points={points} />);
    expect(subject.prop('d')).to.equal('M0 0L100 100');
  });
});
