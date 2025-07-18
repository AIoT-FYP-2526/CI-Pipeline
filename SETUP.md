# Organization-wide Random Reviewer Assignment

## Quick Setup Guide

### 1. Organization Setup (One-time)
1. Create this `CI-Pipeline` repository in your organization
2. Add all team members to the organization
3. Create teams for different groups (backend, frontend, etc.)
4. Create an organization secret `ORG_GITHUB_TOKEN` with these permissions:
   - `contents: read`
   - `pull-requests: write` 
   - `members: read`

### 2. Repository Setup (Per Repository)
Copy this workflow file to each repository as `.github/workflows/auto-assign-reviewers.yml`:

```yaml
name: Auto Assign Reviewers

on:
  pull_request:
    types: [opened]

jobs:
  assign-reviewers:
    uses: YOUR_ORG/CI-Pipeline/.github/workflows/random-reviewer-assignment.yml@main
    with:
      num_reviewers: 2
      exclude_author: true
    secrets:
      GITHUB_TOKEN: ${{ secrets.ORG_GITHUB_TOKEN }}
```

### 3. Configure Reviewers
Create `.github/reviewers.yml` in each repository:

```yaml
reviewers:
  default:
    - alice
    - bob
    - charlie
  teams:
    - backend-team
    - frontend-team
```

## Done! 🎉
Pull requests will now automatically get random reviewer assignments.
