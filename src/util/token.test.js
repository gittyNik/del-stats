import token from './token';

describe('Get Fake Token', () => {
  test("0", () =>
    expect(token.getFakeToken()).toBeTruthy());
})
