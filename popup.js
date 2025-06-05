// Load existing keys and update status indicators on page load
document.addEventListener('DOMContentLoaded', function() {
  loadExistingKeys();
});

// Load existing keys from storage and update UI
function loadExistingKeys() {
  chrome.storage.sync.get(['openAIApiKey', 'githubToken'], function(result) {
    const openaiStatus = document.getElementById('openai-status');
    const githubStatus = document.getElementById('github-status');
    
    if (result.openAIApiKey) {
      openaiStatus.className = 'status-indicator filled';
    } else {
      openaiStatus.className = 'status-indicator empty';
    }
    
    if (result.githubToken) {
      githubStatus.className = 'status-indicator filled';
    } else {
      githubStatus.className = 'status-indicator empty';
    }
  });
}

// Show success message
function showSuccessMessage(message) {
  const successDiv = document.getElementById('success-message');
  const successText = document.getElementById('success-text');
  successText.textContent = message;
  successDiv.classList.add('show');
  
  setTimeout(() => {
    successDiv.classList.remove('show');
  }, 3000);
}

// Modal functionality
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add('show');
  
  // Close on backdrop click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      hideModal(modalId);
    }
  });
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.remove('show');
}

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal.show').forEach(modal => {
      modal.classList.remove('show');
    });
  }
});

// Save OpenAI API Key
document.getElementById('saveKey').addEventListener('click', function() {
  const key = document.getElementById('apiKey').value.trim();
  if (!key) {
    showSuccessMessage('❌ Please enter an API key');
    return;
  }
  
  if (!key.startsWith('sk-')) {
    showSuccessMessage('⚠️ API key should start with "sk-"');
    return;
  }
  
  chrome.storage.sync.set({ openAIApiKey: key }, () => {
    showSuccessMessage('✅ OpenAI API Key saved successfully!');
    document.getElementById('apiKey').value = '';
    loadExistingKeys(); // Update status indicator
  });
});

// Save GitHub Token
document.getElementById('saveGithubToken').addEventListener('click', function() {
  const token = document.getElementById('githubToken').value.trim();
  if (!token) {
    showSuccessMessage('❌ Please enter a GitHub token');
    return;
  }
  
  if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
    showSuccessMessage('⚠️ Token should start with "ghp_" or "github_pat_"');
    return;
  }
  
  chrome.storage.sync.set({ githubToken: token }, () => {
    showSuccessMessage('✅ GitHub Token saved successfully!');
    document.getElementById('githubToken').value = '';
    loadExistingKeys(); // Update status indicator
  });
});

// Add input validation feedback
document.getElementById('apiKey').addEventListener('input', function(e) {
  const input = e.target;
  const value = input.value.trim();
  
  if (value && !value.startsWith('sk-')) {
    input.style.borderColor = '#dc3545';
  } else {
    input.style.borderColor = '#e9ecef';
  }
});

document.getElementById('githubToken').addEventListener('input', function(e) {
  const input = e.target;
  const value = input.value.trim();
  
  if (value && !value.startsWith('ghp_') && !value.startsWith('github_pat_')) {
    input.style.borderColor = '#dc3545';
  } else {
    input.style.borderColor = '#e9ecef';
  }
});

// Make functions globally available for onclick handlers
window.showModal = showModal;
window.hideModal = hideModal;
  