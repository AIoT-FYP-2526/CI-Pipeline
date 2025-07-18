# File Structure

```
CI-Pipeline/
├── .github/
│   └── workflows/
│       └── random-reviewer-assignment.yml    # Main reusable workflow
├── examples/
│   ├── auto-assign-reviewers.yml            # Example workflow for repositories
│   └── reviewers.yml                        # Example reviewer configuration
├── scripts/
│   └── assign-reviewers.js                  # Main assignment logic
├── test/
│   └── assign-reviewers.test.js             # Unit tests
├── .gitignore                               # Git ignore rules
├── LICENSE                                  # MIT License
├── README.md                                # Complete documentation
├── SETUP.md                                 # Quick setup guide
└── package.json                             # Node.js dependencies
```

## Key Files Explained

### `.github/workflows/random-reviewer-assignment.yml`
- The main reusable GitHub Actions workflow
- Can be called from any repository in the organization
- Handles the entire reviewer assignment process

### `scripts/assign-reviewers.js`
- Core Node.js script that performs reviewer selection
- Integrates with GitHub API using Octokit
- Supports both individual reviewers and teams
- Includes error handling and logging

### `examples/auto-assign-reviewers.yml`
- Template workflow file for individual repositories
- Copy this to `.github/workflows/` in each repository
- Customize the parameters as needed

### `examples/reviewers.yml`
- Template reviewer configuration
- Copy this to `.github/reviewers.yml` in each repository
- Define your team's reviewer pools

## Integration Steps

1. **Set up CI-Pipeline repository** (one-time)
2. **Copy workflow file** to each repository
3. **Configure reviewers** for each repository
4. **Set up organization token** for team support (optional)

The system is now ready to automatically assign reviewers to all new pull requests!
