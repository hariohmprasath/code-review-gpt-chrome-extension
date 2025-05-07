chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === 'OPENAI_REVIEW') {
      const { combinedChanges } = request.payload;
  
      // retrieve key from storage
      chrome.storage.sync.get(['openAIApiKey'], async (items) => {
        if (!items.openAIApiKey) {
          return sendResponse({ error: 'No OpenAI API key set.' });
        }
        const apiKey = items.openAIApiKey;
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-3.5-turbo',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert software engineer asked to perform a code review.'
                },
                {
                  role: 'user',
                  content: `Review these changes: ${combinedChanges}`
                }
              ]
            })
          });
          const data = await response.json();
          const reviewText = data.choices?.[0]?.message?.content || '';
          sendResponse({ reviewText });
        } catch (err) {
          console.error(err);
          sendResponse({ error: err.message });
        }
      });
  
      return true;
    }
  });
  