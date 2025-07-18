const { Octokit } = require('@octokit/rest');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class ReviewerAssignment {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });
    
    this.config = {
      prNumber: parseInt(process.env.PR_NUMBER),
      prAuthor: process.env.PR_AUTHOR,
      repository: process.env.REPOSITORY,
      reviewerPoolFile: process.env.REVIEWER_POOL_FILE || '.github/reviewers.yml',
      numReviewers: parseInt(process.env.NUM_REVIEWERS) || 2,
      excludeAuthor: process.env.EXCLUDE_AUTHOR === 'true',
      teamReviewers: process.env.TEAM_REVIEWERS === 'true'
    };
    
    const [owner, repo] = this.config.repository.split('/');
    this.owner = owner;
    this.repo = repo;
  }

  async loadReviewerPool() {
    try {
      // First try to load from the current repository
      const reviewerFilePath = path.join('..', this.config.reviewerPoolFile);
      
      let reviewerConfig;
      
      if (fs.existsSync(reviewerFilePath)) {
        console.log(`Loading reviewer config from repository: ${reviewerFilePath}`);
        const fileContent = fs.readFileSync(reviewerFilePath, 'utf8');
        reviewerConfig = yaml.load(fileContent);
      } else {
        // Fallback to default configuration from CI pipeline repo
        console.log('Using default reviewer configuration');
        reviewerConfig = this.getDefaultReviewerConfig();
      }
      
      return reviewerConfig;
    } catch (error) {
      console.error('Error loading reviewer configuration:', error);
      return this.getDefaultReviewerConfig();
    }
  }

  getDefaultReviewerConfig() {
    return {
      reviewers: {
        default: [],
        teams: []
      },
      rules: {
        exclude_author: true,
        min_reviewers: 1,
        max_reviewers: 3
      }
    };
  }

  async getTeamMembers(teamSlug) {
    try {
      const response = await this.octokit.rest.teams.listMembersInOrg({
        org: this.owner,
        team_slug: teamSlug,
      });
      return response.data.map(member => member.login);
    } catch (error) {
      console.error(`Error fetching team members for ${teamSlug}:`, error);
      return [];
    }
  }

  async isUserCollaborator(username) {
    try {
      await this.octokit.rest.repos.checkCollaborator({
        owner: this.owner,
        repo: this.repo,
        username: username,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async selectReviewers(reviewerPool) {
    let allPotentialReviewers = [];
    
    // Add individual reviewers
    if (reviewerPool.reviewers && reviewerPool.reviewers.default) {
      allPotentialReviewers.push(...reviewerPool.reviewers.default);
    }
    
    // Add team members if team reviewers are enabled
    if (this.config.teamReviewers && reviewerPool.reviewers && reviewerPool.reviewers.teams) {
      for (const team of reviewerPool.reviewers.teams) {
        const teamMembers = await this.getTeamMembers(team);
        allPotentialReviewers.push(...teamMembers);
      }
    }
    
    // Remove duplicates
    allPotentialReviewers = [...new Set(allPotentialReviewers)];
    
    // Exclude PR author if configured
    if (this.config.excludeAuthor) {
      allPotentialReviewers = allPotentialReviewers.filter(
        reviewer => reviewer !== this.config.prAuthor
      );
    }
    
    // Filter out non-collaborators
    const validReviewers = [];
    for (const reviewer of allPotentialReviewers) {
      if (await this.isUserCollaborator(reviewer)) {
        validReviewers.push(reviewer);
      }
    }
    
    if (validReviewers.length === 0) {
      throw new Error('No valid reviewers found');
    }
    
    // Shuffle and select the required number of reviewers
    const shuffledReviewers = this.shuffleArray(validReviewers);
    const numToSelect = Math.min(this.config.numReviewers, shuffledReviewers.length);
    
    return shuffledReviewers.slice(0, numToSelect);
  }

  async assignReviewers(reviewers) {
    try {
      await this.octokit.rest.pulls.requestReviewers({
        owner: this.owner,
        repo: this.repo,
        pull_number: this.config.prNumber,
        reviewers: reviewers,
      });
      
      console.log(`Successfully assigned reviewers: ${reviewers.join(', ')}`);
      return true;
    } catch (error) {
      console.error('Error assigning reviewers:', error);
      return false;
    }
  }

  async run() {
    try {
      console.log('Starting reviewer assignment process...');
      console.log(`PR: ${this.config.repository}#${this.config.prNumber}`);
      console.log(`Author: ${this.config.prAuthor}`);
      
      const reviewerPool = await this.loadReviewerPool();
      console.log('Loaded reviewer configuration:', JSON.stringify(reviewerPool, null, 2));
      
      const selectedReviewers = await this.selectReviewers(reviewerPool);
      console.log(`Selected reviewers: ${selectedReviewers.join(', ')}`);
      
      const success = await this.assignReviewers(selectedReviewers);
      
      // Save result for potential use in later steps
      const result = {
        success,
        assignedReviewers: selectedReviewers,
        prNumber: this.config.prNumber,
        repository: this.config.repository,
        timestamp: new Date().toISOString()
      };
      
      fs.writeFileSync('assignment-result.json', JSON.stringify(result, null, 2));
      
      if (success) {
        console.log('✅ Reviewer assignment completed successfully');
      } else {
        console.log('❌ Reviewer assignment failed');
        process.exit(1);
      }
      
    } catch (error) {
      console.error('Fatal error during reviewer assignment:', error);
      
      const result = {
        success: false,
        error: error.message,
        prNumber: this.config.prNumber,
        repository: this.config.repository,
        timestamp: new Date().toISOString()
      };
      
      fs.writeFileSync('assignment-result.json', JSON.stringify(result, null, 2));
      process.exit(1);
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  const assignment = new ReviewerAssignment();
  assignment.run();
}

module.exports = ReviewerAssignment;
