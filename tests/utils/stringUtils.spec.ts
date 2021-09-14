import { expect } from 'chai';
import { generateRandom } from '../../src/utils/stringUtils';

describe('stringUtil', () => {
  it('generates stringer fsdd', () => {
    const str = generateRandom(5);
    expect(str.length).to.equal(5);
  });
});
