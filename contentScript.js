(async function () {
    // Early exit if not on a Pull Request URL (should not happen given the manifest, but just in case)
    if (!window.location.href.includes('/pull/')) return;
  
    // 1. Parse URL for owner, repo, pull request number
    //    e.g., https://github.com/owner/repo/pull/123
    const urlParts = window.location.pathname.split('/');
    // urlParts: ["", "owner", "repo", "pull", "123"]
    const owner = urlParts[1];
    const repo = urlParts[2];
    const pullNumber = urlParts[4];
  
    // 2. Create a button to trigger the AI review
    const reviewButton = document.createElement('button');
    reviewButton.innerText = '🧑‍💻';
    reviewButton.style.margin = '8px';
    reviewButton.style.padding = '10px 24px';
    reviewButton.style.background = 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)';
    reviewButton.style.color = '#fff';
    reviewButton.style.fontWeight = 'bold';
    reviewButton.style.fontSize = '1rem';
    reviewButton.style.border = 'none';
    reviewButton.style.borderRadius = '24px';
    reviewButton.style.boxShadow = '0 2px 8px rgba(80, 80, 120, 0.15)';
    reviewButton.style.cursor = 'pointer';
    reviewButton.style.transition = 'transform 0.1s, box-shadow 0.1s, background 0.2s';
    reviewButton.addEventListener('mouseenter', () => {
      reviewButton.style.transform = 'scale(1.05)';
      reviewButton.style.boxShadow = '0 4px 16px rgba(80, 80, 120, 0.25)';
      reviewButton.style.background = 'linear-gradient(90deg, #fc5c7d 0%, #6a82fb 100%)';
    });
    reviewButton.addEventListener('mouseleave', () => {
      reviewButton.style.transform = 'scale(1)';
      reviewButton.style.boxShadow = '0 2px 8px rgba(80, 80, 120, 0.15)';
      reviewButton.style.background = 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)';
    });
  
    // Insert the button somewhere on the page. For demonstration,
    // we'll put it in the PR title bar if we can find it.
    const titleBar = document.querySelector('.gh-header-title');
    if (titleBar) {
      titleBar.appendChild(reviewButton);
    }
  
    // Function to extract only changed/added lines from a patch
    function extractChangedLines(patch) {
      if (!patch) return '';
      
      const lines = patch.split('\n');
      const result = [];
      let inHunk = false;
      let addedLinesOnly = [];
      let hunkHeader = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detect hunk headers (e.g., @@ -1,7 +1,9 @@)
        if (line.startsWith('@@')) {
          // If we were in a previous hunk and collected added lines, add them to the result
          if (inHunk && addedLinesOnly.length > 0) {
            result.push(hunkHeader);
            result.push(...addedLinesOnly);
            result.push('');  // Empty line for separation
          }
          
          // Start a new hunk
          inHunk = true;
          hunkHeader = line;
          addedLinesOnly = [];
          continue;
        }
        
        if (inHunk) {
          // Only collect added lines and minimal context
          if (line.startsWith('+') && !line.startsWith('+++')) {
            // Add line without the '+' prefix
            addedLinesOnly.push(line);
          } else if (!line.startsWith('-') && !line.startsWith('---')) {
            // For context lines, add them only if they're immediately before or after an added line
            const prevLine = i > 0 ? lines[i-1] : '';
            const nextLine = i < lines.length - 1 ? lines[i+1] : '';
            
            if ((prevLine.startsWith('+') || nextLine.startsWith('+')) && 
                addedLinesOnly.length > 0 && 
                !addedLinesOnly.includes(line)) {
              // Add as context with a comment prefix
              addedLinesOnly.push(`/* CONTEXT */ ${line}`);
            }
          }
        }
      }
      
      // Add the last hunk if it exists
      if (inHunk && addedLinesOnly.length > 0) {
        result.push(hunkHeader);
        result.push(...addedLinesOnly);
      }
      
      return result.join('\n');
    }
  
    // 3. On click, fetch PR info, call OpenAI, and optionally add a comment
    reviewButton.addEventListener('click', async () => {
      // Optional: show a loading message
      reviewButton.innerText = 'Reviewing...';
  
      try {
        // a) Fetch the PR files, or any other relevant data
        const githubToken = await getGitHubToken();
        const filesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${githubToken}`
          }
        });
        
        if (!filesResponse.ok) {
          throw new Error(`GitHub API error: ${filesResponse.status}`);
        }
        
        const filesData = await filesResponse.json();
  
        // b) Extract only the changed code from each file's patch
        let combinedChanges = '';
        for (const file of filesData) {
          const changedLines = extractChangedLines(file.patch);
          if (changedLines.trim()) {
            combinedChanges += `File: ${file.filename}\nChanged Code:\n${changedLines}\n\n`;
          }
        }
  
        // c) Call OpenAI to review the changes
        const openAIApiKey = await getOpenAIApiKey(); 
  
        const prResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}`, {
          headers: { 'Authorization': `Bearer ${githubToken}` }
        });
        const prData = await prResponse.json();
        const branchName = prData.head.ref;
        
        const jsonBody = JSON.stringify({
          model: "o4-mini-2025-04-16",
          messages: [
            {
              role: "system",
              content: `
                    You are an expert, staff-level software engineer performing a **comprehensive, language-agnostic code review** on a GitHub Pull Request. Focus **only** on the *new* or *modified* lines of code. Do **not** review any existing code that was not changed (any code marked with "/* CONTEXT */" or unchanged lines).

                    **Your objectives:**
                    1. **Scope**: Analyze only the diff provided; ignore unchanged context.
                    2. **Dimensions**:
                      - **Code Quality & Maintainability**: naming clarity, modular design, SOLID principles, duplication detection, readability.
                      - **Memory & Resource Management**: proper disposal of resources, avoiding large allocations or leaks, correct use of language-specific memory constructs.
                      - **Concurrency & Thread Safety**: thread safety patterns, race conditions, deadlock risks, proper use of language-native synchronization or concurrency primitives.
                      - **Performance & Scalability**: algorithmic complexity, I/O in hot paths, caching strategies, unnecessary object creation or expensive calls.
                      - **Security & Vulnerabilities**: input validation, protection against injection (SQL, command, template), proper authentication/authorization checks, no hard-coded secrets.
                      - **Best Practices & Logging**: error handling, logging levels, configuration externalization, test coverage for new functionality.

                    3. **Tone & Audience**:
                      - Write as if addressing an experienced engineer.
                      - Maintain a professional, respectful tone.
                      - Assume familiarity with advanced concepts; focus on **why** something matters and **how** to fix it.

                    4. **Formatting Requirements**:
                      - **Output**: A single Markdown table, no extra paragraphs.
                      - **Each row** must represent one finding—bug, risk, improvement, or best practice.
                      - **Order**: Sort rows by severity: 🛑 Critical, 🔥 High, ⚠️ Medium, 🟡 Low, ℹ️ Info.

                    5. **Markdown Table Columns** (in this order):
                      | **Priority** | **Category**     | **Description**                                                                                                    | **Suggestion**                                                                                                      | **Code Reference**                                                                                                 |
                      |--------------|------------------|--------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
                      | (🛑/🔥/⚠️/🟡/ℹ️) | Code Quality / Memory / Concurrency / Performance / Security / Best Practice | Concise, technical explanation of the issue or notable observation—**why** it matters.                               | Concrete recommendation or fix—**how** to correct or optimize the code. If assumption needed, state it clearly.      | GitHub link to file and line (e.g., [File.ext#L45](https://github.com/${owner}/${repo}/blob/${branchName}/path/to/File.ext#L45)) |

                    6. **Severity Definitions**:
                      - 🛑 **Critical**: Incorrect behavior, data corruption, crashes, severe security holes. Must fix before merge.
                      - 🔥 **High**: Major security vulnerabilities, memory leaks, deadlocks, severe performance bottlenecks.
                      - ⚠️ **Medium**: Suboptimal practices affecting performance or maintainability, minor resource leaks, weak validation.
                      - 🟡 **Low**: Cosmetic/style issues, minor best-practice improvements.
                      - ℹ️ **Info**: Positive notes (good practices), optional improvements, or clarifications.

                    7. **Additional Instructions**:
                      - Omit categories with no findings; do **not** write "Looks good."
                      - For ℹ️ Info rows, briefly state **why** a pattern is exemplary.
                      - If uncertain, explicitly state your assumption (e.g., “Assuming this function may be called concurrently…”).
                      - **Match line numbers exactly** to the lines in the provided diff. The Code Reference link must point to the actual line added or changed. For example, if the diff shows “+ console.log('X');” on line 12, your link must be "[File.js#L12](https://github.com/${owner}/${repo}/blob/${branchName}/path/to/File.js#L12)".
                      - Always include precise GitHub links to line numbers or ranges in the format:
                        \`[File.ext#Lxx-Lyy](https://github.com/${owner}/${repo}/blob/${branchName}/path/to/File.ext#Lxx-Lyy)\`
                          or a single line: \`#Lxx\`.

                    8. **Repository Context**:
                      - GitHub repository: https://github.com/${owner}/${repo}
                      - Branch: ${branchName}

                    Use this system prompt verbatim.`
                },
                {
                  role: "user",
                  content: `
                    Please review the following code changes with a critical eye, focusing on best practices, memory management, concurrency and thread safety, performance impact, and security vulnerabilities.

                    IMPORTANT: Only review the code that has been changed or added. Lines marked with "/* CONTEXT */" are for context and should NOT be reviewed.

                    Identify any potential issues, inefficiencies, or risks, and prioritize them based on severity (🛑 Critical, 🔥 High, ⚠️ Medium, 🟡 Low, ℹ️ Info).

                    Do not provide a summary of the PR itself. Only provide detailed feedback in a Markdown table.
                    
                    Changes:
                    ${combinedChanges}
                  `
            }
          ]
        });
          
        const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIApiKey}`
            },
            body: jsonBody
        });
  
        if (!openAIResponse.ok) {
            const err = await openAIResponse.json();
            console.error('OpenAI error', err);
            throw new Error(`OpenAI API error: ${openAIResponse.status} – ${err.error.message}`);
        }
  
        const openAIData = await openAIResponse.json();
        const reviewText = openAIData.choices?.[0]?.message?.content || '(No response)';
  
        // Show animated confetti and an inspirational quote when review is complete
        showConfettiWithQuote();
      
        // Automatically post the review to the PR
        await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${pullNumber}/comments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ body: reviewText })
        });

        // or just show in the text box
        // const commentBox = document.querySelector('textarea#new_comment_field'); // GitHub's comment box
        // if (commentBox) {
        //   commentBox.value = `**Automated Review**\n\n${reviewText}`;
        // }
      } catch (err) {
        console.error(err);
        alert(`Error reviewing PR: ${err.message}`);
      } finally {
        reviewButton.innerText = '🧑‍💻';
      }
    });
  
  })();
  
  // Retrieve the API key from chrome.storage.sync or local storage
  function getOpenAIApiKey() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['openAIApiKey'], function (items) {
        if (items.openAIApiKey) {
          resolve(items.openAIApiKey);
        } else {
          reject(new Error('No OpenAI API key set.'));
        }
      });
    });
  }
  
  // Retrieve the GitHub token from chrome.storage.sync or local storage
  function getGitHubToken() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(['githubToken'], function (items) {
        if (items.githubToken) {
          resolve(items.githubToken);
        } else {
          reject(new Error('No GitHub token set.'));
        }
      });
    });
  }
  
  function showConfettiWithQuote() {
    const quotes = [
      '"Programs must be written for people to read, and only incidentally for machines to execute." — Harold Abelson',
      '"Talk is cheap. Show me the code." — Linus Torvalds',
      '"Simplicity is the soul of efficiency." — Austin Freeman',
      '"First, solve the problem. Then, write the code." — John Johnson',
      '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
      '"Code is like humor. When you have to explain it, it\'s bad." — Cory House',
      '"Fix the cause, not the symptom." — Steve Maguire'
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    // Create confetti container
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100vw';
    confettiContainer.style.height = '100vh';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '9999';
    document.body.appendChild(confettiContainer);

    // Animate falling emoji confetti (more vibrant, funny, and happy)
    const confettiEmojis = [
      '🎉', '✨', '🎊', '💻', '🚀', '🦄', '😄', '🥳', '🌈', '🍕', '🍦', '🧁', '🎈', '🪅', '😎', '🤩', '🦋', '🐱', '🐶', '🍉', '🍩', '🍭', '🧸', '🎮', '🪩', '🧃', '🍀', '🌟', '🪐', '🎵', '🎤', '🕺', '💃'
    ];
    const confettiCount = 44;
    for (let i = 0; i < confettiCount; i++) {
      const emoji = document.createElement('span');
      emoji.innerText = confettiEmojis[Math.floor(Math.random() * confettiEmojis.length)];
      emoji.style.position = 'absolute';
      emoji.style.left = Math.random() * 100 + 'vw';
      emoji.style.top = '-3rem';
      emoji.style.fontSize = (2 + Math.random() * 2.5) + 'rem';
      emoji.style.opacity = 0.88;
      emoji.style.transform = `rotate(${Math.random() * 360}deg)`;
      emoji.style.transition = `transform ${2 + Math.random()}s cubic-bezier(.23,1.01,.32,1), opacity 0.5s`;
      confettiContainer.appendChild(emoji);
      setTimeout(() => {
        emoji.style.transform = `translateY(${80 + Math.random() * 15}vh) rotate(${Math.random() * 720 - 360}deg)`;
        emoji.style.opacity = 0.2 + Math.random() * 0.5;
      }, 10 + Math.random() * 200);
    }

    // Add a burst of emojis around the quote
    const burstEmojis = ['🥳', '🎉', '🌈', '✨', '🎊', '😄', '🦄', '🍦', '🍭', '🧁'];
    for (let i = 0; i < 12; i++) {
      const burst = document.createElement('span');
      burst.innerText = burstEmojis[Math.floor(Math.random() * burstEmojis.length)];
      burst.style.position = 'fixed';
      burst.style.left = '50%';
      burst.style.top = '50%';
      burst.style.fontSize = '2.2rem';
      burst.style.zIndex = '10001';
      burst.style.pointerEvents = 'none';
      burst.style.transition = `transform 1.2s cubic-bezier(.23,1.01,.32,1), opacity 0.7s`;
      burst.style.opacity = '1';
      confettiContainer.appendChild(burst);
      setTimeout(() => {
        const angle = (i / 12) * 2 * Math.PI;
        const radius = 90 + Math.random() * 30;
        burst.style.transform = `translate(-50%, -50%) translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px) scale(1.5)`;
        burst.style.opacity = '0';
      }, 50);
    }

    // Show the inspirational quote in the center (colorful and happy)
    const quoteDiv = document.createElement('div');
    quoteDiv.innerHTML = `<span style="font-size:2.2rem;">😃</span><br>${randomQuote}`;
    quoteDiv.style.position = 'fixed';
    quoteDiv.style.top = '50%';
    quoteDiv.style.left = '50%';
    quoteDiv.style.transform = 'translate(-50%, -50%)';
    quoteDiv.style.background = 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)';
    quoteDiv.style.padding = '36px 48px';
    quoteDiv.style.borderRadius = '24px';
    quoteDiv.style.boxShadow = '0 6px 36px rgba(80,80,120,0.22)';
    quoteDiv.style.fontSize = '1.35rem';
    quoteDiv.style.fontWeight = '600';
    quoteDiv.style.color = '#fff';
    quoteDiv.style.textAlign = 'center';
    quoteDiv.style.maxWidth = '85vw';
    quoteDiv.style.fontFamily = 'system-ui, sans-serif';
    quoteDiv.style.border = '6px solid';
    quoteDiv.style.borderImage = 'linear-gradient(90deg, #f9d423 0%, #ff4e50 100%) 1';
    quoteDiv.style.letterSpacing = '0.01em';
    quoteDiv.style.textShadow = '0 2px 8px rgba(0,0,0,0.10)';
    confettiContainer.appendChild(quoteDiv);

    setTimeout(() => {
      confettiContainer.remove();
    }, 3400);
  }
  
  