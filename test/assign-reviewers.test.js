const ReviewerAssignment = require('../scripts/assign-reviewers');

describe('ReviewerAssignment', () => {
  let assignment;
  
  beforeEach(() => {
    // Mock environment variables
    process.env.GITHUB_TOKEN = 'mock-token';
    process.env.PR_NUMBER = '123';
    process.env.PR_AUTHOR = 'test-author';
    process.env.REPOSITORY = 'test-org/test-repo';
    
    assignment = new ReviewerAssignment();
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.GITHUB_TOKEN;
    delete process.env.PR_NUMBER;
    delete process.env.PR_AUTHOR;
    delete process.env.REPOSITORY;
  });

  describe('shuffleArray', () => {
    test('should return array with same length', () => {
      const input = ['a', 'b', 'c', 'd', 'e'];
      const result = assignment.shuffleArray(input);
      
      expect(result).toHaveLength(input.length);
      expect(result).toEqual(expect.arrayContaining(input));
    });

    test('should not modify original array', () => {
      const input = ['a', 'b', 'c'];
      const original = [...input];
      
      assignment.shuffleArray(input);
      
      expect(input).toEqual(original);
    });
  });

  describe('getDefaultReviewerConfig', () => {
    test('should return valid default configuration', () => {
      const config = assignment.getDefaultReviewerConfig();
      
      expect(config).toHaveProperty('reviewers');
      expect(config).toHaveProperty('rules');
      expect(config.reviewers).toHaveProperty('default');
      expect(config.reviewers).toHaveProperty('teams');
      expect(Array.isArray(config.reviewers.default)).toBe(true);
      expect(Array.isArray(config.reviewers.teams)).toBe(true);
    });
  });

  describe('config parsing', () => {
    test('should parse environment variables correctly', () => {
      expect(assignment.config.prNumber).toBe(123);
      expect(assignment.config.prAuthor).toBe('test-author');
      expect(assignment.config.repository).toBe('test-org/test-repo');
      expect(assignment.owner).toBe('test-org');
      expect(assignment.repo).toBe('test-repo');
    });

    test('should use default values for optional config', () => {
      expect(assignment.config.numReviewers).toBe(2);
      expect(assignment.config.excludeAuthor).toBe(false); // Environment variable not set, defaults to false
      expect(assignment.config.teamReviewers).toBe(false);
    });
  });
});
