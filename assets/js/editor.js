document.addEventListener('DOMContentLoaded', () => {
    // =============================================
    //  CONFIGURATION (MODIFIEZ CECI POUR UN AUTRE SITE)
    // =============================================
    const EDITOR_CONFIG = window.EDITOR_CONFIG || {
        // 1. Identifiants GitHub
        github: {
            owner: 'VOTRE-UTILISATEUR-GITHUB',
            repo: 'VOTRE-NOM-DE-REPO',
            filePath: 'index.html',
            branch: 'main'
        },
        // 2. Connexion Admin
        auth: {
            username: 'admin',
            password: 'aurum2026'
        },
        // 3. Menu de Navigation (pour le menu déroulant de l'éditeur)
        navigation: [
            { label: '🏠 Accueil', value: '#hero-bg' },
            { label: '📞 Contact', value: '#contact' }
            // Ajoutez vos propres sections ici
        ]
    };

    // =============================================
    //  EDITOR UI — All controls in bottom bar
    // =============================================
    // Generate Navigation Options
    const navOptions = EDITOR_CONFIG.navigation
        .map(item => `<option value="${item.value}">${item.label}</option>`)
        .join('');

    const editorUI = `
    <div id="login-modal">
        <div class="login-box">
            <h2>Connexion Admin</h2>
            <form id="login-form" class="login-form">
                <input type="text" id="admin-id" placeholder="Identifiant" required>
                <input type="password" id="admin-secret" placeholder="Code Secret" required>
                <button type="submit">Se connecter</button>
            </form>
            <p id="login-error" style="color: #ff4d4d; margin-top: 10px; display: none;">Identifiants incorrects</p>
        </div>
    </div>

    <div id="github-modal">
        <div class="login-box">
            <h2>Mise en ligne (GitHub)</h2>
            <p style="color:white; margin-bottom:15px; font-size:0.9rem;">Entrez votre token GitHub.</p>
            <input type="password" id="github-token" placeholder="ghp_xxxxxxxxxxxx" style="width:100%; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; border-radius:4px;">
            <button id="confirm-deploy-btn" class="editor-btn primary" style="width:100%;">Publier</button>
            <button id="cancel-deploy-btn" class="editor-btn" style="width:100%; margin-top:10px;">Annuler</button>
        </div>
    </div>

    <div id="editor-toolbar">
        <!-- Header: Brand + Navigation + Save -->
        <div class="toolbar-header">
            <div class="editor-branding">
                <i class="fa-solid fa-pen-to-square"></i> Éditeur
            </div>
            <div class="toolbar-header-actions">
                <span id="selected-label">Aucun élément</span>
                <select id="editor-page-nav">
                    <option value="">📄 Naviguer...</option>
                    ${navOptions}
                </select>
                <button class="editor-btn" id="btn-replace-image" style="display:none; background: #333; margin-right:10px;"><i class="fa-solid fa-image"></i> Remplacer l'image</button>
                <button class="editor-btn primary" id="save-changes-btn"><i class="fa-solid fa-cloud-arrow-up"></i> Sauvegarder</button>
            </div>
        </div>

        <!-- Controls Row -->
        <div class="toolbar-controls">
            <div class="ctrl-group">
                <span class="ctrl-group-label">Police</span>
                <select id="ctrl-font" class="ctrl-input">
                    <option value="inherit">Par défaut</option>
                    <option value="'Inter', sans-serif">Inter</option>
                    <option value="'Manrope', sans-serif">Manrope</option>
                    <option value="Arial, sans-serif">Arial</option>
                    <option value="Georgia, serif">Georgia</option>
                    <option value="'Courier New', monospace">Courier</option>
                    <option value="'Times New Roman', serif">Times</option>
                </select>
            </div>

            <div class="ctrl-sep"></div>

            <div class="ctrl-group">
                <span class="ctrl-group-label">Taille</span>
                <input type="number" id="ctrl-size" class="ctrl-input" min="8" max="200" value="16">
                <span style="color: var(--editor-muted); font-size: 0.8rem;">px</span>
            </div>

            <div class="ctrl-sep"></div>

            <div class="ctrl-group">
                <span class="ctrl-group-label">Couleur</span>
                <input type="color" id="ctrl-color" class="ctrl-input" value="#ffffff">
            </div>

            <div class="ctrl-sep"></div>

            <div class="ctrl-group">
                <span class="ctrl-group-label">Style</span>
                <button class="ctrl-format-btn" id="ctrl-bold" title="Gras"><b>G</b></button>
                <button class="ctrl-format-btn" id="ctrl-italic" title="Italique"><i>I</i></button>
                <button class="ctrl-format-btn" id="ctrl-normal" title="Normal">N</button>
            </div>

            <div class="ctrl-sep"></div>

            <div class="ctrl-group">
                <span class="ctrl-group-label">Alignement</span>
                <button class="ctrl-align-btn" id="ctrl-align-left" title="Gauche"><i class="fa-solid fa-align-left"></i></button>
                <button class="ctrl-align-btn" id="ctrl-align-center" title="Centre"><i class="fa-solid fa-align-center"></i></button>
                <button class="ctrl-align-btn" id="ctrl-align-right" title="Droite"><i class="fa-solid fa-align-right"></i></button>
            </div>
        </div>
    </div>

    <!-- Hidden selection box & tools -->
    <div id="editor-selection-box">
        <div class="resize-handle nw" data-dir="nw"></div>
        <div class="resize-handle ne" data-dir="ne"></div>
        <div class="resize-handle sw" data-dir="sw"></div>
        <div class="resize-handle se" data-dir="se"></div>
    </div>
    
    <input type="file" id="file-upload-input" accept="image/*">
    `;

    const wrapper = document.createElement('div');
    wrapper.id = 'editor-wrapper';
    wrapper.innerHTML = editorUI;
    document.body.appendChild(wrapper);

    // =============================================
    //  REFERENCES
    // =============================================
    const loginModal = document.getElementById('login-modal');
    const githubModal = document.getElementById('github-modal');
    const toolbar = document.getElementById('editor-toolbar');
    const loginForm = document.getElementById('login-form');
    const selectionBox = document.getElementById('editor-selection-box');
    const fileInput = document.getElementById('file-upload-input');
    const pageNav = document.getElementById('editor-page-nav');
    const selectedLabel = document.getElementById('selected-label');
    const btnReplace = document.getElementById('btn-replace-image');

    // Controls
    const ctrlFont = document.getElementById('ctrl-font');
    const ctrlSize = document.getElementById('ctrl-size');
    const ctrlColor = document.getElementById('ctrl-color');
    const ctrlBold = document.getElementById('ctrl-bold');
    const ctrlItalic = document.getElementById('ctrl-italic');
    const ctrlNormal = document.getElementById('ctrl-normal');
    const ctrlAlignLeft = document.getElementById('ctrl-align-left');
    const ctrlAlignCenter = document.getElementById('ctrl-align-center');
    const ctrlAlignRight = document.getElementById('ctrl-align-right');

    let isEditMode = false;
    let currentSelectedElement = null;
    let currentImageTarget = null;
    let isDragging = false;
    const DRAG_THRESHOLD = 5;

    const REPO_OWNER = EDITOR_CONFIG.github.owner;
    const REPO_NAME = EDITOR_CONFIG.github.repo;
    const FILE_PATH = EDITOR_CONFIG.github.filePath;

    const EDITOR_SELECTORS = '#login-modal, #github-modal, #editor-toolbar, #editor-panel, #editor-selection-box, #editor-wrapper, #file-upload-input';

    // =============================================
    //  SESSION CHECK
    // =============================================
    if (localStorage.getItem('frameon_admin_session') === 'true') {
        enableEditor();
    }

    // =============================================
    //  LOGIN
    // =============================================
    window.openLoginModal = () => loginModal.classList.add('visible');

    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.remove('visible');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('admin-id').value;
        const secret = document.getElementById('admin-secret').value;
        if (id === EDITOR_CONFIG.auth.username && secret === EDITOR_CONFIG.auth.password) {
            localStorage.setItem('frameon_admin_session', 'true');
            loginModal.classList.remove('visible');
            enableEditor();
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    });

    // =============================================
    //  ENABLE EDITOR
    // =============================================
    function enableEditor() {
        isEditMode = true;
        document.body.classList.add('editor-active');
        toolbar.classList.add('active');
        makeEditable();
        setupResizeHandles();
        disableNavigation();
        setupPageNav();
        setupImageReplace();
        setupControlListeners();
    }

    // =============================================
    //  UNIVERSAL EDITABILITY
    // =============================================
    function makeEditable() {
        const allElements = document.querySelectorAll('body *');

        allElements.forEach(el => {
            // Skip editor UI
            if (el.closest(EDITOR_SELECTORS)) return;
            if (['SCRIPT', 'STYLE', 'LINK', 'META', 'BR', 'HR'].includes(el.tagName)) return;
            if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') return;

            // Text-editable tags
            const textTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'LI', 'A', 'STRONG', 'EM', 'LABEL', 'BUTTON', 'TD', 'TH'];
            if (textTags.includes(el.tagName)) {
                el.contentEditable = 'true';
                el.classList.add('editable-highlight');
            }

            // Click to select OR Drag to move
            el.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return; // left click only
                e.stopPropagation();
                e.preventDefault();

                const startX = e.clientX;
                const startY = e.clientY;
                let dragging = false;

                // Read existing transform
                const cs = window.getComputedStyle(el);
                const matrix = new DOMMatrix(cs.transform);
                const origTx = matrix.m41;
                const origTy = matrix.m42;

                function onMove(ev) {
                    const dx = ev.clientX - startX;
                    const dy = ev.clientY - startY;
                    if (!dragging && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
                        dragging = true;
                        isDragging = true;
                        el.style.cursor = 'grabbing';
                        el.style.zIndex = '9000';
                        selectElement(el);
                    }
                    if (dragging) {
                        el.style.transform = `translate(${origTx + dx}px, ${origTy + dy}px)`;
                        updateSelectionBox();
                    }
                }

                function onUp() {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                    el.style.cursor = '';
                    if (dragging) {
                        isDragging = false;
                        el.style.zIndex = '';
                        updateSelectionBox();
                    } else {
                        // It was a normal click → select
                        selectElement(el);
                    }
                }

                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
            });
        });
    }

    // =============================================
    //  DISABLE BUTTONS & LINKS
    // =============================================
    function disableNavigation() {
        document.addEventListener('click', (e) => {
            if (!isEditMode) return;
            const target = e.target.closest('a, button');
            if (!target) return;
            if (target.closest(EDITOR_SELECTORS)) return;
            if (target.classList.contains('btn-login')) return;
            e.preventDefault();
            e.stopPropagation();
            selectElement(target);
        }, true);
    }

    // =============================================
    //  SELECT / DESELECT ELEMENT
    // =============================================
    function selectElement(el) {
        currentSelectedElement = el;
        updateSelectionBox();
        readElementStyle(el);

        // Update label
        let label = el.tagName.toLowerCase();
        if (el.tagName === 'IMG') label = '🖼 Image';
        else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName)) label = '📝 Titre ' + el.tagName;
        else if (el.tagName === 'P') label = '📄 Paragraphe';
        else if (el.tagName === 'A') label = '🔗 Lien';
        else if (el.tagName === 'BUTTON') label = '🔘 Bouton';
        else if (el.tagName === 'DIV' || el.tagName === 'SECTION') label = '📦 ' + el.tagName;
        else label = '✏️ ' + label;
        // Show/Hide Image Replace Button
        if (el.tagName === 'IMG') {
            btnReplace.style.display = 'flex';
            currentImageTarget = el;
        } else {
            btnReplace.style.display = 'none';
            currentImageTarget = null;
        }

        selectedLabel.textContent = label;
    }

    function deselectElement() {
        currentSelectedElement = null;
        selectionBox.classList.remove('active');
        selectedLabel.textContent = 'Aucun élément';
    }

    // Read current style into controls
    function readElementStyle(el) {
        const cs = window.getComputedStyle(el);

        ctrlSize.value = parseInt(cs.fontSize) || 16;
        ctrlColor.value = rgbToHex(cs.color);

        // Alignment buttons
        const align = cs.textAlign || 'left';
        [ctrlAlignLeft, ctrlAlignCenter, ctrlAlignRight].forEach(b => b.classList.remove('active'));
        if (align === 'center') ctrlAlignCenter.classList.add('active');
        else if (align === 'right') ctrlAlignRight.classList.add('active');
        else ctrlAlignLeft.classList.add('active');

        // Font family - try to match
        const ff = cs.fontFamily;
        let matched = false;
        for (let opt of ctrlFont.options) {
            if (opt.value === 'inherit') continue;
            // distinct check to avoid matching generic sans-serif to everything
            const fontName = opt.value.split(',')[0].replace(/['"]/g, '');
            if (ff.includes(fontName)) {
                ctrlFont.value = opt.value;
                matched = true;
                break;
            }
        }
        if (!matched) ctrlFont.value = 'inherit';

        // Bold & Italic
        const fw = parseInt(cs.fontWeight);
        const fs = cs.fontStyle;

        if (!isNaN(fw) && fw >= 700 || cs.fontWeight === 'bold') ctrlBold.classList.add('active');
        else ctrlBold.classList.remove('active');

        if (fs === 'italic') ctrlItalic.classList.add('active');
        else ctrlItalic.classList.remove('active');
    }

    // =============================================
    //  SELECTION TRACKING (Fix for partial selection)
    // =============================================
    let lastRange = null;

    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);
            const container = range.commonAncestorContainer;
            // Only tracking if inside our page and not inside editor UI
            const el = container.nodeType === 1 ? container : container.parentElement;
            if (el && !el.closest(EDITOR_SELECTORS) && el.isContentEditable) {
                if (!sel.isCollapsed) {
                    lastRange = range.cloneRange();
                }
            }
        }
    });

    function restoreSelection() {
        if (lastRange) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(lastRange);
            return true;
        }
        return false;
    }

    // =============================================
    //  CONTROL LISTENERS (bottom bar)
    // =============================================
    function setupControlListeners() {
        // Prevent focus loss on buttons
        const buttons = document.querySelectorAll('.ctrl-format-btn, .ctrl-align-btn, .editor-btn');
        buttons.forEach(btn => {
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Keep focus on text
            });
        });

        // FONT FAMILY
        ctrlFont.addEventListener('change', () => {
            applyStyle('fontFamily', ctrlFont.value);
        });

        // FONT SIZE
        ctrlSize.addEventListener('change', () => { // use change to avoid rapid firing on input
            applyStyle('fontSize', ctrlSize.value + 'px');
        });
        ctrlSize.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') applyStyle('fontSize', ctrlSize.value + 'px');
        });

        // COLOR
        ctrlColor.addEventListener('input', () => {
            // Restore selection first if lost
            if (lastRange) restoreSelection();
            document.execCommand('styleWithCSS', false, true);
            document.execCommand('foreColor', false, ctrlColor.value);

            // Fallback for full element if no selection
            if (!lastRange && currentSelectedElement) {
                currentSelectedElement.style.color = ctrlColor.value;
            }
        });

        // BOLD
        ctrlBold.addEventListener('click', () => {
            if (isPartialSelection()) {
                document.execCommand('bold');
            } else if (currentSelectedElement) {
                const w = currentSelectedElement.style.fontWeight === '700' ? '400' : '700';
                currentSelectedElement.style.fontWeight = w;
                ctrlBold.classList.toggle('active');
            }
        });

        // ITALIC
        ctrlItalic.addEventListener('click', () => {
            if (isPartialSelection()) {
                document.execCommand('italic');
            } else if (currentSelectedElement) {
                const s = currentSelectedElement.style.fontStyle === 'italic' ? 'normal' : 'italic';
                currentSelectedElement.style.fontStyle = s;
                ctrlItalic.classList.toggle('active');
            }
        });

        // NORMAL (Reset)
        ctrlNormal.addEventListener('click', () => {
            if (isPartialSelection()) {
                document.execCommand('removeFormat');
            } else if (currentSelectedElement) {
                currentSelectedElement.style.fontWeight = '400';
                currentSelectedElement.style.fontStyle = 'normal';
                currentSelectedElement.style.color = '';
                currentSelectedElement.style.textDecoration = 'none';
            }
        });

        // ALIGN BUTTONS
        function setAlign(value) {
            if (currentSelectedElement) {
                currentSelectedElement.style.textAlign = value;
            }
            // Visual feedback
            [ctrlAlignLeft, ctrlAlignCenter, ctrlAlignRight].forEach(b => b.classList.remove('active'));
            if (value === 'left') ctrlAlignLeft.classList.add('active');
            else if (value === 'center') ctrlAlignCenter.classList.add('active');
            else if (value === 'right') ctrlAlignRight.classList.add('active');
        }
        ctrlAlignLeft.addEventListener('click', () => setAlign('left'));
        ctrlAlignCenter.addEventListener('click', () => setAlign('center'));
        ctrlAlignRight.addEventListener('click', () => setAlign('right'));
    }

    function isPartialSelection() {
        // Check if we have a valid text selection
        const sel = window.getSelection();
        return sel.rangeCount > 0 && !sel.isCollapsed &&
            sel.anchorNode && !sel.anchorNode.parentNode.closest(EDITOR_SELECTORS);
    }

    function applyStyle(prop, value) {
        // 1. Try partial text selection
        if (isPartialSelection() || restoreSelection()) {
            if (prop === 'fontSize' || prop === 'fontFamily') {
                // Wrap in span
                const sel = window.getSelection();
                if (sel.rangeCount > 0) {
                    const range = sel.getRangeAt(0);
                    const span = document.createElement('span');
                    span.style[prop] = value;

                    // Extract contents to preserve inner HTML (like bold tags)
                    const content = range.extractContents();
                    span.appendChild(content);
                    range.insertNode(span);

                    // Clean up: merge adjacent spans if possible? (Optional complexity)
                    return;
                }
            }
        }

        // 2. Fallback: Full element
        if (currentSelectedElement) {
            if (currentSelectedElement.tagName === 'IMG' && prop === 'fontSize') {
                // fontSize input maps to width for images in our UI
                currentSelectedElement.style.width = parseFloat(value) + 'px';
                currentSelectedElement.style.height = 'auto';
            } else {
                currentSelectedElement.style[prop] = value;
            }
        }
    }

    // =============================================
    //  SELECTION BOX & RESIZE
    // =============================================
    function setupResizeHandles() {
        selectionBox.querySelectorAll('.resize-handle').forEach(h => {
            h.addEventListener('mousedown', initResize);
        });
    }

    function updateSelectionBox() {
        if (!currentSelectedElement) return;
        const r = currentSelectedElement.getBoundingClientRect();
        selectionBox.style.top = (r.top + window.scrollY) + 'px';
        selectionBox.style.left = (r.left + window.scrollX) + 'px';
        selectionBox.style.width = r.width + 'px';
        selectionBox.style.height = r.height + 'px';
        selectionBox.classList.add('active');
    }

    window.addEventListener('scroll', updateSelectionBox);
    window.addEventListener('resize', updateSelectionBox);

    function initResize(e) {
        e.preventDefault();
        e.stopPropagation();
        const dir = e.target.dataset.dir;
        const sx = e.clientX, sy = e.clientY;
        const sr = currentSelectedElement.getBoundingClientRect();
        const sw = sr.width, sh = sr.height;

        function onMove(e) {
            const dx = e.clientX - sx, dy = e.clientY - sy;
            let w = sw, h = sh;
            if (dir.includes('e')) w = sw + dx;
            if (dir.includes('w')) w = sw - dx;
            if (dir.includes('s')) h = sh + dy;
            if (dir.includes('n')) h = sh - dy;
            currentSelectedElement.style.width = Math.max(20, w) + 'px';
            currentSelectedElement.style.height = Math.max(20, h) + 'px';
            if (currentSelectedElement.tagName === 'IMG' && !e.shiftKey) {
                currentSelectedElement.style.height = 'auto';
            }
            updateSelectionBox();
            ctrlSize.value = Math.round(w);
        }
        function onUp() {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        }
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
    }

    // (Drag is now handled inside makeEditable per-element)

    // Deselect on body click
    document.body.addEventListener('mousedown', (e) => {
        if (e.target === document.body) deselectElement();
    });

    // =============================================
    //  PAGE / POPUP NAVIGATION
    // =============================================
    function setupPageNav() {
        pageNav.addEventListener('change', (e) => {
            const val = e.target.value;
            if (!val) return;

            if (val.startsWith('modal:')) {
                const projectName = val.split(':')[1];
                const card = document.querySelector(`.project-card[data-project="${projectName}"]`);
                if (card) {
                    const wasEdit = isEditMode;
                    isEditMode = false;
                    card.click();
                    isEditMode = wasEdit;
                }
            } else {
                const section = document.querySelector(val);
                if (section) section.scrollIntoView({ behavior: 'smooth' });
            }
            pageNav.value = '';
        });
    }

    // =============================================
    //  IMAGE REPLACEMENT
    // =============================================

    function setupImageReplace() {
        // Trigger file input on button click
        btnReplace.addEventListener('click', () => {
            if (currentImageTarget && currentImageTarget.tagName === 'IMG') {
                fileInput.click();
            }
        });



        // File selected
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file || !currentImageTarget) return;

            const img = currentImageTarget;

            // Preview immediately
            const reader = new FileReader();
            reader.onload = (ev) => {
                img.src = ev.target.result;
                updateSelectionBox();
            };
            reader.readAsDataURL(file);

            // Upload to GitHub if token saved
            const token = localStorage.getItem('frameon_github_token');
            if (token) {
                uploadImage(token, file, img);
            }
        });
    }

    async function uploadImage(token, file, img) {
        img.style.opacity = '0.5';
        try {
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
            const path = `uploads/${Date.now()}_${safeName}`;
            const content = await fileToBase64(file);

            const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/assets/${path}`;
            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `🖼️ Upload: ${path}`, content, branch: 'main' })
            });
            if (!res.ok) throw new Error('Upload failed');

            img.src = `assets/${path}`;
        } catch (err) {
            console.error('Image upload error:', err);
        }
        img.style.opacity = '1';
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.readAsDataURL(file);
            r.onload = () => resolve(r.result.split(',')[1]);
            r.onerror = reject;
        });
    }



    // =============================================
    //  GITHUB DEPLOY + EXIT
    // =============================================
    document.getElementById('save-changes-btn').addEventListener('click', () => {
        githubModal.classList.add('visible');
    });

    document.getElementById('cancel-deploy-btn').addEventListener('click', () => {
        githubModal.classList.remove('visible');
    });

    const savedToken = localStorage.getItem('frameon_github_token');
    if (savedToken) document.getElementById('github-token').value = savedToken;

    document.getElementById('confirm-deploy-btn').addEventListener('click', async () => {
        const token = document.getElementById('github-token').value;
        if (!token) return alert('Token manquant !');
        localStorage.setItem('frameon_github_token', token);

        const btn = document.getElementById('confirm-deploy-btn');
        btn.textContent = 'Publication...';
        btn.disabled = true;

        try {
            await deployToGitHub(token);
            alert('✅ Site publié ! Le mode édition va se fermer.');
            githubModal.classList.remove('visible');
            localStorage.setItem('frameon_admin_session', 'false');
            window.location.reload();
        } catch (err) {
            console.error(err);
            alert('❌ Erreur : ' + err.message);
        } finally {
            btn.textContent = 'Publier';
            btn.disabled = false;
        }
    });

    async function deployToGitHub(token) {
        const cleanDoc = document.documentElement.cloneNode(true);

        // 1. Remove ALL editor UI elements (multiple selectors for safety)
        const removeSelectors = [
            '#editor-wrapper',
            '#login-modal',
            '#github-modal',
            '#editor-toolbar',
            '#editor-panel',
            '#context-toolbar',
            '#editor-selection-box',
            '#file-upload-input',
            '.img-replace-overlay',
            '.resize-handle'
        ];
        cleanDoc.querySelectorAll(removeSelectors.join(',')).forEach(el => el.remove());

        // 2. Strip ALL editor attributes from every element
        cleanDoc.querySelectorAll('*').forEach(el => {
            el.removeAttribute('contenteditable');
            el.classList.remove(
                'editable-highlight', 'editable-container', 'editable-image',
                'editor-active', 'active'
            );
            // Remove empty class attribute
            if (el.classList.length === 0) el.removeAttribute('class');
            // Clean editor-specific inline styles
            if (el.style.outline) el.style.outline = '';
            if (el.style.cursor === 'text' || el.style.cursor === 'pointer') el.style.cursor = '';
            if (el.getAttribute('style') === '') el.removeAttribute('style');
        });

        // 3. Clean body
        const body = cleanDoc.querySelector('body');
        if (body) {
            body.classList.remove('editor-active');
            body.style.paddingBottom = '';
            body.style.marginTop = '';
            if (body.classList.length === 0) body.removeAttribute('class');
            if (body.getAttribute('style') === '') body.removeAttribute('style');
        }

        const html = '<!DOCTYPE html>\n' + cleanDoc.outerHTML;
        const fileUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

        const getRes = await fetch(fileUrl, { headers: { 'Authorization': `token ${token}` } });
        if (!getRes.ok) throw new Error('Token invalide');
        const { sha } = await getRes.json();

        const putRes = await fetch(fileUrl, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: '🚀 Mise à jour via Éditeur (Clean)',
                content: btoa(unescape(encodeURIComponent(html))),
                sha, branch: 'main'
            })
        });
        if (!putRes.ok) throw new Error('Échec du commit');
    }

    // =============================================
    //  HELPERS
    // =============================================
    function rgbToHex(rgb) {
        if (!rgb) return '#000000';
        if (rgb.startsWith('#')) return rgb;
        const m = rgb.match(/\d+/g);
        if (!m) return '#000000';
        return '#' + m.map(x => (+x).toString(16).padStart(2, '0')).join('');
    }
});
