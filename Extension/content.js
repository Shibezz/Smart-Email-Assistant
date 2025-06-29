console.log("Email Writer Extension - Content Script loaded");
let inputText = "";

function createToneSelect() {
    const select = document.createElement('select');
    select.className = 'ai-tone-selector';
    select.style.padding = '2px 4px';
    select.style.border = '1px solid #ccc';
    select.style.borderRadius = '4px';
    select.style.fontSize = '12px';
    return select;
}

function createAIButton() {
    const button = document.createElement('button');
    button.textContent = 'Generate';
    button.style.padding = '2px 8px';
    button.style.border = '1px solid #aaa';
    button.style.borderRadius = '4px';
    button.style.backgroundColor = '#f1f3f4';
    button.style.fontSize = '12px';
    button.style.cursor = 'pointer';
    return button;
}

function findComposeToolbar() {
    const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) return toolbar;
    }
    return null;
}

function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) return content.innerText.trim();
    }
    return '';
}

function injectionButton() {
    const existing = document.querySelector('.ai-reply-container');
    if (existing) existing.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar NOT Found");
        return;
    }
    console.log("Toolbar FOUND. Creating AI button...");

    const container = document.createElement('div');
    container.className = 'ai-reply-container';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '6px';
    container.style.marginTop = '6px';
    container.style.flexWrap = 'wrap';

    const button = createAIButton();

    const select = createToneSelect();
    const tones = ['Professional', 'Casual', 'Friendly'];
    tones.forEach(tone => {
        const opt = document.createElement('option');
        opt.value = tone;
        opt.textContent = tone;
        select.appendChild(opt);
    });
    select.value = 'Professional';

    const toggleLabel = document.createElement('label');
    toggleLabel.style.display = 'flex';
    toggleLabel.style.alignItems = 'center';
    toggleLabel.style.gap = '4px';
    toggleLabel.style.fontSize = '12px';
    toggleLabel.style.cursor = 'pointer';

    const toggleInput = document.createElement('input');
    toggleInput.type = 'checkbox';
    toggleInput.checked = true;

    const toggleText = document.createElement('span');
    toggleText.textContent = 'Auto Generate';

    toggleLabel.appendChild(toggleInput);
    toggleLabel.appendChild(toggleText);

    const manualInput = document.createElement('textarea');
    manualInput.placeholder = 'Describe the reply...';
    manualInput.style.display = 'none';
    manualInput.style.width = '100%';
    manualInput.style.minHeight = '40px';
    manualInput.style.fontSize = '12px';
    manualInput.style.padding = '4px';
    manualInput.style.border = '1px solid #ccc';
    manualInput.style.borderRadius = '4px';
    manualInput.style.marginTop = '4px';

    toggleInput.addEventListener('change', () => {
        if (toggleInput.checked) {
            manualInput.style.display = 'none';
            inputText = "";
        } else {
            manualInput.style.display = 'block';
            inputText = manualInput.value;
        }
        // manualInput.style.display = toggleInput.checked ? 'none' : 'block';

    });
    manualInput.addEventListener('input', (e) => {
        inputText = e.target.value.trim();
    })

    button.addEventListener('click', async () => {
        console.log(inputText);
        try {
            button.textContent = "Generating...";
            button.disabled = true;

            const tone = select.value;
            const emailContent = toggleInput.checked
                ? getEmailContent()
                : manualInput.value.trim();


            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailContent, tone, inputText })
            });

            if (!response.ok) throw new Error('API Request Failed');

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose Box was not found');
            }
        } catch (error) {
            console.error(error);
            alert("FAILED TO GENERATE THE REPLY");
        } finally {
            button.textContent = 'Generate';
            button.disabled = false;
        }
    });

    container.appendChild(button);
    container.appendChild(select);
    container.appendChild(toggleLabel);
    container.appendChild(manualInput);
    toolbar.insertBefore(container, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (
                node.matches('.aDh, .btC, [role="dialog"], div[aria-label="Message Body"]') ||
                node.querySelector('.aDh, .btC, [role="dialog"], div[aria-label="Message Body"]')
            )
        );
        if (hasComposeElements) {
            console.log("Compose Window Detected");
            setTimeout(injectionButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
