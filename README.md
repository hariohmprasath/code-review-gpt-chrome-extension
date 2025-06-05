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
- **Modern UI**: Beautiful, security-focused interface with step-by-step guidance
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

**IMPORTANT**: Before using the extension, you must set up your API keys through the modern, secure interface:

### 🔐 Accessing the Setup Interface

1. Click on the extension icon in your Chrome toolbar
2. You'll see a beautiful, modern interface with:
   - **Security Notice**: Emphasizing that your keys are stored locally and never shared
   - **Status Indicators**: Red/green dots showing whether each key is configured
   - **Help Buttons**: "How to get?" links for detailed instructions

### 🔑 Setting Up Your OpenAI API Key

1. In the extension popup, find the "OpenAI API Key" section
2. Click **"How to get?"** for step-by-step instructions, or follow these steps:
   - Visit [platform.openai.com](https://platform.openai.com)
   - Sign in or create an account
   - Navigate to **API Keys** section
   - Click **Create new secret key**
   - Copy the key (starts with `sk-proj-`)
   - Paste it in the extension and click **💾 Save OpenAI Key**
3. The status indicator will turn green when saved successfully

### 🐙 Setting Up Your GitHub Token

1. In the extension popup, find the "GitHub Personal Access Token" section
2. Click **"How to get?"** for detailed instructions, or follow these steps:
   - Go to [github.com/settings/tokens](https://github.com/settings/tokens)
   - Click **Generate new token (classic)**
   - Give it a descriptive name (e.g., "PR Review Extension")
   - Select required scopes:
     - `repo` - Full repository access
     - `read:org` - Read organization data
   - Click **Generate token**
   - Copy the token (starts with `ghp_`)
   - Paste it in the extension and click **💾 Save GitHub Token**
3. The status indicator will turn green when saved successfully

### ✅ Security Features

- **Local Storage**: All keys are stored securely in Chrome's local storage
- **Input Validation**: The extension validates key formats in real-time
- **Visual Feedback**: Status indicators show configuration status at a glance
- **No Data Sharing**: Your credentials never leave your browser

## 🛠️ How to Use

1. Navigate to any GitHub pull request page
2. Look for the "🧑‍💻✨ Review Code ✨" button near the PR title
3. Click the button to start the AI review process
4. Wait for the review to complete (you'll see a progress indicator)
5. The review will be automatically posted as a comment on the PR
6. Enjoy the celebration with confetti and an inspirational quote!

## ⚠️ Important Notes

- **Security First**: Your API keys are stored in Chrome's secure storage and are never shared
- **GitHub Pages Only**: The extension only works on GitHub pull request pages
- **OpenAI Model**: Uses `o3-mini` from OpenAI for intelligent code analysis
- **Token Limits**: Large PRs with many changes may exceed token limits; consider reviewing smaller PRs or specific files
- **Change Focus**: Reviews focus only on the changes in the PR, not existing code
- **Key Validation**: The extension validates API key formats to prevent common errors

## 🎨 UI Features

- **Modern Design**: Beautiful gradient interface with professional styling
- **Interactive Modals**: Dismissible help windows with comprehensive setup instructions
- **Toast Notifications**: Elegant success/error messages instead of basic alerts
- **Real-time Validation**: Immediate feedback on API key format as you type
- **Keyboard Shortcuts**: Press `Escape` to close help modals
- **Responsive Design**: Clean layout that works perfectly in the extension popup

## 🔒 Privacy & Security

- **Local Storage Only**: All API requests are made directly from your browser using your personal tokens
- **No External Servers**: No data is stored on external servers beyond GitHub and OpenAI's official APIs
- **Code Privacy**: Your code is never stored or used for purposes other than generating the review
- **Secure Transmission**: All communications use HTTPS and official API endpoints
- **No Telemetry**: The extension doesn't collect or transmit any usage data

## 🧩 Technical Details

- **GitHub API Integration**: Extracts PR changes using the official GitHub REST API
- **OpenAI Integration**: Sends code changes to OpenAI with specific instructions for code review
- **Chrome Extension APIs**: Uses Chrome's secure storage and extension APIs
- **Modern JavaScript**: Built with modern ES6+ features and best practices
- **Responsive CSS**: Modern CSS with gradients, animations, and responsive design

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Areas for improvement:
- Additional AI models support
- Enhanced UI features
- Better error handling
- Internationalization support

## 📜 License

[MIT License](LICENSE)
