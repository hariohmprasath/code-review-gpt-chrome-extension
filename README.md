# GitHub AI Code Review Chrome Extension

A Chrome extension that adds an AI-powered code review button to GitHub pull requests, providing instant, detailed feedback on your code changes.

## 🌟 Features

- **One-Click Code Review**: Adds a beautiful "Review Code" button to GitHub PR pages
- **Intelligent Analysis**: Uses OpenAI to analyze PR changes with focus on:
  - Code quality and best practices
  - Potential memory leaks
  - Concurrency issues
  - Performance impacts
  - Security vulnerabilities
- **Formatted Results**: Delivers reviews in a clean Markdown table format
- **Direct GitHub Integration**: Posts review comments directly to the PR
- **Celebration**: Shows confetti and an inspirational quote when review completes

## 📋 Requirements

- A GitHub account
- A valid GitHub personal access token
- An OpenAI API key

## 🚀 Installation

1. Clone this repository or download the source code
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the directory containing the extension files
5. The extension should now appear in your Chrome toolbar

## ⚙️ Setup

**IMPORTANT**: Before using the extension, you must set up your API keys:

1. Click on the extension icon in your Chrome toolbar
2. Enter your GitHub personal access token
   - This token needs permissions to read PR files and post comments
   - Create one at [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
3. Enter your OpenAI API key
   - Get one from [OpenAI API Keys](https://platform.openai.com/account/api-keys)
4. Click "Save" to store your keys securely

## 🛠️ How to Use

1. Navigate to any GitHub pull request page
2. Look for the "🧑‍💻✨ Review Code ✨" button near the PR title
3. Click the button to start the AI review process
4. Wait for the review to complete
5. The review will be automatically posted as a comment on the PR

## ⚠️ Important Notes

- Your API keys are stored in Chrome's secure storage and are never shared
- The extension only works on GitHub pull request pages
- The model used is `o3-mini` from OpenAI
- Large PRs with many changes may exceed token limits; consider reviewing smaller PRs or specific files
- Reviews focus only on the changes in the PR, not existing code

## 🔒 Privacy & Security

- All API requests are made directly from your browser using your personal tokens
- No data is stored on external servers
- Your code is never stored or used for purposes other than generating the review

## 🧩 Technical Details

- The extension extracts PR changes using the GitHub API
- Code changes are sent to OpenAI with specific instructions to focus on best practices
- The extension uses Chrome's extension APIs for secure token storage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

[MIT License](LICENSE)
