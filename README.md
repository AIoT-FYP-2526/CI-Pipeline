# Random Reviewer Assignment CI Pipeline

This repository contains a reusable GitHub Actions workflow that automatically assigns random reviewers to pull requests across your organization.

## Features

- 🎯 Random reviewer selection from configured pools
- 👥 Support for individual reviewers and GitHub teams
- 🚫 Automatic exclusion of PR authors
- ⚙️ Configurable number of reviewers
- 🔧 Per-repository configuration support
- 📝 Automatic PR comments with assignment details

## Quick Start

### 1. Set up this CI Pipeline Repository

1. Create a new repository named `CI-Pipeline` in your organization
2. Copy all files from this repository
3. Install dependencies:
   ```bash
   npm install
   ```

### 2. Configure Individual Repositories

In each repository where you want automatic reviewer assignment:

#### Option A: Use Organization Token (Recommended)
Create `.github/workflows/auto-assign-reviewers.yml`:

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
      team_reviewers: false
    secrets:
      GITHUB_TOKEN: ${{ secrets.ORG_GITHUB_TOKEN }}
```

#### Option B: Use Repository Token
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
      team_reviewers: false
    secrets:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 3. Configure Reviewers

Create `.github/reviewers.yml` in each repository:

```yaml
reviewers:
  default:
    - alice
    - bob
    - charlie
    - diana
  teams:
    - backend-team
    - frontend-team

rules:
  exclude_author: true
  min_reviewers: 1
  max_reviewers: 3
```

## Configuration Options

### Workflow Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `reviewer_pool_file` | Path to reviewer configuration file | No | `.github/reviewers.yml` |
| `num_reviewers` | Number of reviewers to assign | No | `2` |
| `exclude_author` | Exclude PR author from selection | No | `true` |
| `team_reviewers` | Enable team-based assignment | No | `false` |

### Reviewer Configuration Format

```yaml
reviewers:
  # Individual GitHub usernames
  default:
    - username1
    - username2
    - username3
  
  # GitHub team slugs (requires team_reviewers: true)
  teams:
    - team-slug-1
    - team-slug-2

rules:
  exclude_author: true    # Don't assign PR author
  min_reviewers: 1       # Minimum reviewers
  max_reviewers: 3       # Maximum reviewers
```

## Required Permissions

### For Organization Token (Recommended)
Create a GitHub App or Personal Access Token with these permissions:
- `contents: read`
- `pull-requests: write`
- `members: read` (for team support)

### For Repository Token
The default `GITHUB_TOKEN` needs:
- `contents: read`
- `pull-requests: write`

## Advanced Usage

### Custom Reviewer Pool File
```yaml
uses: YOUR_ORG/CI-Pipeline/.github/workflows/random-reviewer-assignment.yml@main
with:
  reviewer_pool_file: '.github/custom-reviewers.yml'
  num_reviewers: 3
```

### Team-Based Assignment
```yaml
uses: YOUR_ORG/CI-Pipeline/.github/workflows/random-reviewer-assignment.yml@main
with:
  team_reviewers: true
  num_reviewers: 2
```

## Examples

### Basic Setup
For a simple repository with a small team:

```yaml
# .github/reviewers.yml
reviewers:
  default:
    - alice
    - bob
    - charlie

# .github/workflows/auto-assign-reviewers.yml
name: Auto Assign Reviewers
on:
  pull_request:
    types: [opened]
jobs:
  assign-reviewers:
    uses: YOUR_ORG/CI-Pipeline/.github/workflows/random-reviewer-assignment.yml@main
    with:
      num_reviewers: 1
    secrets:
      GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Large Team with GitHub Teams
```yaml
# .github/reviewers.yml
reviewers:
  default:
    - tech-lead-1
    - tech-lead-2
  teams:
    - backend-engineers
    - frontend-engineers
    - qa-team

# .github/workflows/auto-assign-reviewers.yml
name: Auto Assign Reviewers
on:
  pull_request:
    types: [opened]
jobs:
  assign-reviewers:
    uses: YOUR_ORG/CI-Pipeline/.github/workflows/random-reviewer-assignment.yml@main
    with:
      num_reviewers: 3
      team_reviewers: true
    secrets:
      GITHUB_TOKEN: ${{ secrets.ORG_GITHUB_TOKEN }}
```

## Troubleshooting

### Common Issues

1. **No reviewers assigned**
   - Check that usernames in `reviewers.yml` are valid
   - Ensure users have repository access
   - Verify the workflow has proper permissions

2. **Team members not found**
   - Enable `team_reviewers: true`
   - Ensure the token has `members: read` permission
   - Check team slug names are correct

3. **Workflow not triggering**
   - Verify the workflow file is in `.github/workflows/`
   - Check that the trigger event is `pull_request: types: [opened]`
   - Ensure the CI-Pipeline repository is accessible

### Debug Mode
Add this step to your workflow for debugging:
```yaml
- name: Debug Information
  run: |
    echo "PR Number: ${{ github.event.pull_request.number }}"
    echo "PR Author: ${{ github.event.pull_request.user.login }}"
    echo "Repository: ${{ github.repository }}"
```

## Contributing

1. Fork this repository
2. Create a feature branch
3. Make your changes
4. Test with a sample repository
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
