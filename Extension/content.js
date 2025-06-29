console.log("Email Writer Extension - Content Script loaded");

function createToneSelect() {
  const select = document.createElement('select');
  select.className = 'ai-tone-selector';
  select.style.padding = '4px';
  select.style.border = '1px solid #ccc';
  select.style.borderRadius = '4px';
  select.style.marginRight = '6px';

  const tones = [
    { value: '',              label: 'Select tone…' },
    { value: 'Professional',  label: 'Professional' },
    { value: 'Casual',        label: 'Casual' },
    { value: 'Friendly',      label: 'Friendly' },
  ];

  for (const { value, label } of tones) {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    select.appendChild(opt);
  }
  return select;
}

function createAIButton(){
    const button=document.createElement('div');
    button.className='T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.style.marginRight='8px';
    button.innerHTML='AI Reply';
    button.setAttribute('role','button');
    button.setAttribute('data-tooltip','Generate AI Reply');
    return button;
}

function findComposeToolbar(){
    const selectors=[
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar=document.querySelector(selector);
        if(toolbar)  return toolbar;
    }
    return null;

}

function getEmailContent(){
    const selectors=[
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content=document.querySelector(selector);
        if(content)  return content.innerText.trim();
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

    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.textContent = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    button.style.marginRight = '4px';

    const select = document.createElement('select');
    select.style.height = '28px';
    select.style.border = '1px solid #dadce0';
    select.style.borderRadius = '4px';
    select.style.background = '#fff';
    select.style.fontSize = '12px';
    select.style.cursor = 'pointer';
    select.style.padding = '0 4px';

    const tones = [
        { value: 'Professional', label: 'Professional' },
        { value: 'Casual', label: 'Casual' },
        { value: 'Friendly', label: 'Friendly' }
    ];
    for (const { value, label } of tones) {
        const opt = document.createElement('option');
        opt.value = value;
        opt.textContent = label;
        select.appendChild(opt);
    }
    select.value = 'Professional';

    button.addEventListener('click', async () => {
        try {
            button.textContent = "Generating...";
            button.style.pointerEvents = "none";

            const emailContent = getEmailContent();
            const tone = select.value;

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: tone
                })
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
            button.textContent = 'AI Reply';
            button.style.pointerEvents = "auto";
        }
    });

    container.appendChild(button);
    container.appendChild(select);
    toolbar.insertBefore(container, toolbar.firstChild);
}




const observer= new MutationObserver((mutations)=>{
    for(const mutation of mutations){
        const addedNodes=Array.from(mutation.addedNodes);
        const hasComposeElements =addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC, [role="dialog"], div[aria-label="Message Body"]')||node.querySelector('.aDh, .btC, [role="dialog"], div[aria-label="Message Body"]'))
        );
        if(hasComposeElements){
            console.log("Compose Window Detected");
            setTimeout(injectionButton,500);
        }
    }
});

observer.observe(document.body,{
    childList:true,
    subtree:true
})