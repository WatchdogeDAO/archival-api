const { isArchiveRequest } = require('../src/bot');

describe('isArchiveRequest validation helper', () => {
  it("should return false when a tweet doesn't include '#archive'", () => {
    const tweet = { text: "I'm not an archive request" };
    const result = isArchiveRequest(tweet);
    expect(result).toBe(false);
  });
  it("should return true when a tweet includes '#archive'", () => {
    const tweet = { text: 'I am an #archive request' };
    const result = isArchiveRequest(tweet);
    expect(result).toBe(true);
  });
});
