/* ==========================================================================
   NEUROASSIST IA — APP LOGIC & SYSTEM PROMPT
   ========================================================================== */

// 1. SYSTEM PROMPT COMPLETE INSTRUCTION (DERIVED FROM DOCUMENT)
const SYSTEM_PROMPT = `
Tu es mon secrétaire de rédaction spécialisé en neuropsychologie clinique. Ton rôle est de m'aider à rédiger, reformuler, structurer, corriger et harmoniser mes comptes rendus neuropsychologiques à partir des informations cliniques que je te transmets. Tu n'as pas pour rôle de remplacer mon jugement clinique ni de poser un diagnostic à ma place. Tu dois avant tout transformer mes notes, parfois très brutes, en un texte professionnel, clair, fidèle et directement utilisable dans un compte rendu. Tu dois progressivement apprendre et reproduire mon style de rédaction à partir des exemples de comptes rendus que je te fournis.

MON ACTIVITÉ DE NEUROPSYCHOLOGUE :
Je réalise principalement des bilans neuropsychologiques chez l'enfant, l'adolescent et l'adulte. Les demandes concernent notamment :
- Les troubles attentionnels et le TDAH ;
- Les suspicions de Trouble du Spectre de l'Autisme (TSA) ;
- Les difficultés d'apprentissage ;
- Les difficultés cognitives dans un contexte neurologique ou psychiatrique ;
- Des bilans comparatifs ou de suivi permettant d'évaluer l'évolution du fonctionnement cognitif.

MES ÉVALUATIONS PEUVENT COMPRENDRE :
- Une anamnèse clinique et développementale ;
- L'évaluation du fonctionnement intellectuel (WISC, WAIS, WPPSI) ;
- L'évaluation de l'attention, de la mémoire épisodique verbale et visuelle, des fonctions exécutives, des capacités visuo-spatiales/constructives, de la vitesse de traitement, du langage et certains apprentissages ;
- Des questionnaires comportementaux, émotionnels ou diagnostiques ;
- Des entretiens diagnostiques structurés ou semi-structurés (ADOS-2, ADI-R).
- Des informations de parents, enseignants, médecins, psychologues, psychiatres, orthophonistes.

TYPES DE DOCUMENTS & SECTIONS À RÉDIGER :
1. ANAMNÈSE : Présente uniquement les informations pertinentes pour comprendre la demande et le fonctionnement (motif, situation personnelle/scolaire/pro, développement précoce, parcours, antécédents, suivis/traitements, difficultés cognitives, attention, social/communication, comportements/intérêts/routines, sensorialité, émotionnel, autonomie). Ne mettre QUE les rubriques fournies. Organisation logique du plus général au plus spécifique ou chronologique.
2. OBSERVATIONS CLINIQUES PENDANT LE BILAN : Décrit de manière sobre ce qui a réellement été observé (attitude, engagement, consignes, fatigabilité, impulsivité, agitation, fluctuations attentionnelles, stratégies, comportement social). Distinguer clairement ce qui est observé pendant le bilan de ce qui est rapporté.
3. ANALYSE DES RÉSULTATS : Explication clinique compréhensible. Reprendre exactement les phrases types d'interprétation des scores :
   - Note standard <= 6 = inférieur à la moyenne
   - Note standard 7 = fragile
   - Note standard 8 = Moyenne basse
   - Note standard de 9 à 11 = Moyenne
   - Note standard 12 à 13 = Moyenne haute
   - Note standard >= 14 = supérieur à la moyenne
   - Pour le reste des scores, ce sont des percentiles.
4. CONCLUSION : Synthèse hiérarchisée prudente. Commence par les principaux résultats cognitifs, puis difficultés et comportement. Mettre en lien prudent avec l'hypothèse (ex: "le profil apparaît compatible avec...", "les éléments recueillis soutiennent l'hypothèse de...", "les résultats mettent en évidence...", "une fragilité est observée...", "ces éléments sont à mettre en perspective avec..."). Éviter les affirmations diagnostiques trop catégoriques.

PRINCIPES DE RÉDACTION STRICTS :
1. Toujours rester fidèle à mes informations : NE JAMAIS INVENTER une information clinique.
2. Ne pas déformer mes observations : Conserver exactement le sens clinique et les nuances (parfois, fréquemment, peut, semble, rapporte, selon sa mère, dans certaines situations).
3. Distinguer les sources : Préciser toujours "Mme X rapporte", "Selon sa mère", "Lors de l'évaluation, il est observé".
4. Éviter les répétitions : Regrouper les informations proches.
5. Hiérarchiser les informations : Élément important en premier.
6. Ne pas alourdir inutilement : Bannir "Il convient également de souligner que", "Il est important de noter que", "Par ailleurs, il apparaît également que", "Dans le cadre de", "En ce qui concerne".
7. Éviter les jugements : Vocabulaire descriptif et neutre (ex: "Il peut interrompre fréquemment" et non "Il se montre irrespectueux").
8. Conserver une écriture naturelle : Style simple, fluide, professionnel et humain. Phrases relativement courtes et naturelles.

MISE EN FORME :
Conserver exactement la structure, les titres, intitulés d'items et grilles (ADI-R, ADOS-2, tableaux de scores). Améliorer uniquement la rédaction du contenu sous les items.
`.trim();

// DEFAULT API KEY
const DEFAULT_API_KEY = '';

// STATE MANAGEMENT
let apiKey = localStorage.getItem('neuroassist_api_key') || DEFAULT_API_KEY;
let selectedModel = localStorage.getItem('neuroassist_model') || 'claude-3-5-sonnet-20241022';
let customStyleText = localStorage.getItem('neuroassist_custom_style') || '';
let chatHistory = [];

// DOM ELEMENTS
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const btnSend = document.getElementById('btn-send');
const btnClearChat = document.getElementById('btn-clear-chat');
const btnFileUpload = document.getElementById('btn-file-upload');
const fileInput = document.getElementById('file-input');

// MODAL ELEMENTS
const modalSettings = document.getElementById('modal-settings');
const modalStyle = document.getElementById('modal-style');
const modalGuide = document.getElementById('modal-guide');
const apiKeyInput = document.getElementById('api-key-input');
const modelSelect = document.getElementById('model-select');
const styleTextInput = document.getElementById('style-text-input');
const styleIndicator = document.getElementById('style-indicator');
const statusText = document.getElementById('status-text');
const apiStatusBadge = document.getElementById('api-status');

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  initUI();
  setupEventListeners();
});

function initUI() {
  apiKeyInput.value = apiKey;
  modelSelect.value = selectedModel;
  
  if (customStyleText) {
    styleIndicator.classList.remove('hidden');
    styleTextInput.value = customStyleText;
  } else {
    styleIndicator.classList.add('hidden');
  }

  updateStatusBadge();
}

function updateStatusBadge() {
  if (apiKey && apiKey.length > 5) {
    apiStatusBadge.className = 'status-badge';
    statusText.textContent = 'Clé API configurée';
  } else {
    apiStatusBadge.className = 'status-badge error';
    statusText.textContent = 'Clé API manquante';
  }
}

function setupEventListeners() {
  // Chat form submit
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;
    
    userInput.value = '';
    userInput.style.height = 'auto';

    await handleSendMessage(text);
  });

  // Auto resize textarea
  userInput.addEventListener('input', () => {
    userInput.style.height = 'auto';
    userInput.style.height = (userInput.scrollHeight) + 'px';
  });

  // Quick prompt buttons
  document.querySelectorAll('.btn-template').forEach(btn => {
    btn.addEventListener('click', () => {
      const templatePrompt = btn.dataset.prompt;
      userInput.value = templatePrompt;
      userInput.focus();
      userInput.style.height = (userInput.scrollHeight) + 'px';
    });
  });

  // Modal Triggers
  document.getElementById('btn-open-settings').addEventListener('click', () => modalSettings.classList.remove('hidden'));
  document.getElementById('btn-open-guide').addEventListener('click', () => modalGuide.classList.remove('hidden'));
  document.getElementById('btn-load-style-modal').addEventListener('click', () => modalStyle.classList.remove('hidden'));

  // Close modals
  document.querySelectorAll('.modal-close, .close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const overlay = e.target.closest('.modal-overlay');
      if (overlay) overlay.classList.add('hidden');
    });
  });

  // Save Settings
  document.getElementById('btn-save-key').addEventListener('click', () => {
    apiKey = apiKeyInput.value.trim();
    selectedModel = modelSelect.value;
    localStorage.setItem('neuroassist_api_key', apiKey);
    localStorage.setItem('neuroassist_model', selectedModel);
    updateStatusBadge();
    modalSettings.classList.add('hidden');
  });

  // Save Custom Style Model
  document.getElementById('btn-save-style').addEventListener('click', () => {
    customStyleText = styleTextInput.value.trim();
    localStorage.setItem('neuroassist_custom_style', customStyleText);
    if (customStyleText) {
      styleIndicator.classList.remove('hidden');
    } else {
      styleIndicator.classList.add('hidden');
    }
    modalStyle.classList.add('hidden');
  });

  // Remove Style Model
  document.getElementById('btn-remove-style').addEventListener('click', () => {
    customStyleText = '';
    localStorage.removeItem('neuroassist_custom_style');
    styleTextInput.value = '';
    styleIndicator.classList.add('hidden');
  });

  // Clear Chat
  btnClearChat.addEventListener('click', () => {
    if (confirm('Voulez-vous réinitialiser la conversation en cours ?')) {
      chatHistory = [];
      const messages = chatMessages.querySelectorAll('.message:not(.message-system)');
      messages.forEach(m => m.remove());
    }
  });

  // File Upload
  btnFileUpload.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      userInput.value += (userInput.value ? '\n\n' : '') + evt.target.result;
      userInput.style.height = (userInput.scrollHeight) + 'px';
    };
    reader.readAsText(file);
    fileInput.value = '';
  });
}

// MESSAGE HANDLING & API CALL
async function handleSendMessage(text) {
  // Add user message UI
  appendMessageUI('user', text);

  // Add to internal history
  chatHistory.push({ role: 'user', content: text });

  // Prepare loading indicator UI
  const loadingEl = appendLoadingUI();

  try {
    // Construct full system prompt including custom style if provided
    let fullSystemPrompt = SYSTEM_PROMPT;
    if (customStyleText) {
      fullSystemPrompt += `\n\nEXEMPLE DE STYLE RÉDACTIONNEL MODÈLE À REPRODUIRE :\n"""\n${customStyleText}\n"""`;
    }

    let responseText = await callAnthropicAPI(chatHistory, fullSystemPrompt);

    // Remove loading indicator
    loadingEl.remove();

    // Add Assistant Response UI
    appendMessageUI('assistant', responseText);

    // Add assistant response to history
    chatHistory.push({ role: 'assistant', content: responseText });

  } catch (err) {
    loadingEl.remove();
    appendMessageUI('assistant', `⚠️ **Erreur API** : ${err.message}\n\n*Cliquez sur le bouton **Clé API** en haut à droite pour vérifier ou mettre à jour votre clé.*`);
  }
}

// CALL ANTHROPIC API
async function callAnthropicAPI(messages, systemPrompt) {
  // Check if running on web server (Vercel)
  if (window.location.protocol.startsWith('http')) {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          system: systemPrompt,
          apiKey: apiKey,
          model: selectedModel
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Erreur serveur Vercel (${res.status})`);
      }
      return data.content[0].text;
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch')) {
        throw e;
      }
      console.log('Serveur API indisponible, tentative d’appel direct...', e);
    }
  }

  // Fallback: Direct Browser API Call to Anthropic
  const directRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true'
    },
    body: JSON.stringify({
      model: selectedModel,
      max_tokens: 4096,
      system: systemPrompt,
      messages: messages
    })
  });

  const data = await directRes.json();
  if (!directRes.ok) {
    throw new Error(data.error?.message || 'Clé API invalide ou refusée par Anthropic.');
  }

  return data.content[0].text;
}

// UI HELPERS
function appendMessageUI(role, text) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message message-${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = role === 'user' ? '<i class="fa-solid fa-user-doctor"></i>' : '<i class="fa-solid fa-brain"></i>';

  const content = document.createElement('div');
  content.className = 'message-content';

  if (window.marked && role === 'assistant') {
    content.innerHTML = marked.parse(text);
  } else {
    content.textContent = text;
  }

  if (role === 'assistant') {
    const actions = document.createElement('div');
    actions.className = 'message-actions';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn-copy';
    copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copier le texte';
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(text);
      copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copié !';
      setTimeout(() => copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copier le texte', 2000);
    });

    actions.appendChild(copyBtn);
    content.appendChild(actions);
  }

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(content);

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return msgDiv;
}

function appendLoadingUI() {
  const msgDiv = document.createElement('div');
  msgDiv.className = 'message message-assistant';

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = '<i class="fa-solid fa-brain"></i>';

  const content = document.createElement('div');
  content.className = 'message-content';
  content.innerHTML = '<p><i class="fa-solid fa-spinner fa-spin"></i> Rédaction en cours selon vos directives cliniques...</p>';

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(content);
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return msgDiv;
}
