document.getElementById('saveKey').addEventListener('click', function() {
    const key = document.getElementById('apiKey').value.trim();
    if (!key) {
      // Do nothing if empty
      return;
    }
    // Save the key in extension storage
    chrome.storage.sync.set({ openAIApiKey: key }, () => {
      alert('API Key saved!');
    });
  });
  
document.getElementById('saveGithubToken').addEventListener('click', function() {
    const token = document.getElementById('githubToken').value.trim();
    if (!token) {
      // Do nothing if empty
      return;
    }
    chrome.storage.sync.set({ githubToken: token }, () => {
      alert('GitHub Token saved!');
    });
  });
  