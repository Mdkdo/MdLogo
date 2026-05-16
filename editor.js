document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('turtle-canvas');
    const ctx = canvas.getContext('2d');
    const turtle = new Turtle(canvas, ctx);
    const interpreter = new LogoInterpreter(turtle);
    const outputConsole = document.getElementById('output-console');
    const highlightLayer = document.getElementById('highlight-layer');
    const codeEditor = document.getElementById('code-editor');

    const logToConsole = (msg, isError = false) => {
        const div = document.createElement('div');
        div.textContent = msg;
        if (!isError) div.className = 'info';
        outputConsole.appendChild(div);
        outputConsole.scrollTop = outputConsole.scrollHeight;
    };
    window.logToConsole = logToConsole;

    // Editor Logic
    const keywords = ['repete', 'répète', 'repeat', 'si', 'if', 'si_sinon', 'ifelse', 'pour', 'to', 'fin', 'end', 'donne', 'make', 'rend', 'output', 'quand_clic', 'onclick', 'quand_touche', 'onkey'];
    const commands = ['av', 'fd', 're', 'bk', 'td', 'rt', 'tg', 'lt', 've', 'cs', 'nettoie', 'clean', 'home', 'origine', 'lc', 'pu', 'bc', 'pd', 'ct', 'ht', 'mt', 'st', 'faisxy', 'setxy', 'faiscap', 'setheading', 'arc', 'rectangle', 'cercle', 'circle', 'ligne', 'line', 'ellipse', 'ecris', 'write', 'police', 'font', 'joueson', 'playsound', 'montreimage', 'showimage', 'montrevideo', 'showvideo', 'fcc', 'pc', 'fc', 'tc', 'ps', 'fcl', 'remplit', 'fill', 'fccf', 'setbg', 'list_ajout', 'list_append', 'list_modifie', 'list_modify', 'list_retire', 'list_remove'];
    const mathFuncs = ['sin', 'cos', 'tan', 'atan', 'sqrt', 'abs', 'exp', 'ln', 'log', 'log10', 'pow', 'random', 'hasard', 'int', 'round', 'arrondi', 'ceil', 'plafond', 'xcor', 'ycor', 'heading', 'cap', 'distance', 'towards', 'vers', 'modulo', 'reste', 'min', 'max', 'pi', 'pos', 'élément', 'item', 'list_taille', 'list_size', 'repcount', 'mousex', 'mousey'];

    const updateHighlighting = () => {
        let code = codeEditor.value;
        let escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const regex = /(;.*$)|("[\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿ]*)|(:[\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿ]+)|(\[|\])|(\d+\.?\d*)|(\b[a-z0-9_áàâäãåçéèêëíìîïñóòôöõúùûüýÿ]+\b)/gmi;
        const highlighted = escaped.replace(regex, (match, comment, string, variable, bracket, number, word) => {
            if (comment) return `<span class="hl-comment">${match}</span>`;
            if (string) return `<span class="hl-string">${match}</span>`;
            if (variable) return `<span class="hl-variable">${match}</span>`;
            if (bracket) return `<span class="hl-bracket">${match}</span>`;
            if (number) return `<span class="hl-number">${match}</span>`;
            if (word) {
                const lower = word.toLowerCase();
                if (keywords.includes(lower)) return `<span class="hl-keyword">${word.toUpperCase()}</span>`;
                if (commands.includes(lower) || mathFuncs.includes(lower)) return `<span class="hl-function">${word.toUpperCase()}</span>`;
                return word;
            }
            return match;
        });
        highlightLayer.innerHTML = highlighted + (code.endsWith('\n') ? ' ' : '');
    };

    const handleAutoUppercase = (e) => {
        const separators = [' ', '(', '[', ',', '\n', '\t', ')', ']'];
        // On some browsers e.data might be null for enter/tab, check last char of text before cursor
        const start = codeEditor.selectionStart;
        const text = codeEditor.value;
        const char = e.data || text[start - 1];

        if (separators.includes(char)) {
            const before = text.substring(0, start - 1);
            const words = before.split(/[\s\(\[,\)\]]/);
            const lastWord = words[words.length - 1];
            if (!lastWord) return;
            const lowerLast = lastWord.toLowerCase();

            if (keywords.includes(lowerLast) || commands.includes(lowerLast) || mathFuncs.includes(lowerLast)) {
                const upperLast = lastWord.toUpperCase();
                if (upperLast !== lastWord) {
                    const newText = text.substring(0, start - 1 - lastWord.length) + upperLast + text.substring(start - 1);
                    codeEditor.value = newText;
                    codeEditor.setSelectionRange(start, start);
                    updateHighlighting();
                }
            }
        }
    };

    codeEditor.addEventListener('input', (e) => {
        handleAutoUppercase(e);
        updateHighlighting();
        autoSave();
    });

    codeEditor.addEventListener('scroll', () => {
        highlightLayer.scrollTop = codeEditor.scrollTop;
        highlightLayer.scrollLeft = codeEditor.scrollLeft;
    });

    const autoSave = () => {
        localStorage.setItem('logo_code', codeEditor.value);
    };

    // Toolbar Actions
    const actions = {
        'new': () => { if(confirm('Nouveau projet ?')) { codeEditor.value = ''; updateHighlighting(); } },
        'open': () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = (e) => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (re) => { codeEditor.value = re.target.result; updateHighlighting(); };
                reader.readAsText(file);
            };
            input.click();
        },
        'save': () => {
            const blob = new Blob([codeEditor.value], {type: 'text/plain'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'logo_code.txt';
            a.click();
        },
        'run': () => {
            outputConsole.textContent = '';
            try { interpreter.execute(codeEditor.value); }
            catch (e) { logToConsole('Erreur: ' + e.message, true); }
        },
        'select-all': () => { codeEditor.select(); },
        'copy': () => { document.execCommand('copy'); },
        'cut': () => { document.execCommand('cut'); },
        'paste': async () => {
            const text = await navigator.clipboard.readText();
            const start = codeEditor.selectionStart, end = codeEditor.selectionEnd;
            codeEditor.setRangeText(text, start, end, 'end');
            updateHighlighting();
        },
        'undo': () => { document.execCommand('undo'); },
        'redo': () => { document.execCommand('redo'); },
        'comment': () => {
            const start = codeEditor.selectionStart, end = codeEditor.selectionEnd;
            const lines = codeEditor.value.substring(start, end).split('\n');
            const commented = lines.map(l => l.startsWith(';') ? l.substring(1) : ';' + l).join('\n');
            codeEditor.setRangeText(commented, start, end, 'select');
            updateHighlighting();
        },
        'tab': () => {
            const start = codeEditor.selectionStart, end = codeEditor.selectionEnd;
            codeEditor.setRangeText('  ', start, end, 'end');
            updateHighlighting();
        },
        'untab': () => {
            const start = codeEditor.selectionStart, end = codeEditor.selectionEnd;
            const selected = codeEditor.value.substring(start, end);
            const untabbed = selected.replace(/^  /gm, '');
            codeEditor.setRangeText(untabbed, start, end, 'select');
            updateHighlighting();
        },
        'theme': () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('logo_theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        },
        'settings': () => {
            const opt = prompt('Paramètres :\n1. Couleur fond canevas\n2. Image tortue (URL)\nEntrez 1 ou 2 :', '1');
            if (opt === '1') {
                const color = prompt('Couleur de fond (ex: white, #eee):', turtle.canvas.style.backgroundColor);
                if (color) {
                    turtle.canvas.style.backgroundColor = color;
                    localStorage.setItem('logo_canvas_bg', color);
                }
            } else if (opt === '2') {
                const url = prompt('URL de l\'image de la tortue :', turtle.turtleImage?.src || '');
                if (url !== null) {
                    if (url === '') {
                        turtle.turtleImage = null;
                        localStorage.removeItem('logo_turtle_img');
                        turtle.drawTurtle();
                    } else {
                        const img = new Image();
                        img.onload = () => {
                            turtle.turtleImage = img;
                            localStorage.setItem('logo_turtle_img', url);
                            turtle.drawTurtle();
                        };
                        img.src = url;
                    }
                }
            }
        }
    };

    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.getAttribute('data-action');
            if (actions[action]) actions[action]();
        });
    });

    // Language logic (Minimal since we remove button but keep translation map for errors)
    let translations = interpreter.translations;
    try {
        const response = await fetch('lang.json');
        if (response.ok) translations = await response.json();
    } catch (e) {}
    interpreter.setTranslations(translations, 'fr');

    // Init
    const savedCode = localStorage.getItem('logo_code');
    if (savedCode) codeEditor.value = savedCode;

    const savedTheme = localStorage.getItem('logo_theme');
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');

    const savedCanvasBg = localStorage.getItem('logo_canvas_bg');
    if (savedCanvasBg) turtle.canvas.style.backgroundColor = savedCanvasBg;

    const savedTurtleImg = localStorage.getItem('logo_turtle_img');
    if (savedTurtleImg) {
        const img = new Image();
        img.onload = () => {
            turtle.turtleImage = img;
            turtle.drawTurtle();
        };
        img.src = savedTurtleImg;
    }

    window.addEventListener('resize', () => {
        const container = document.getElementById('canvas-container');
        if (container) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            turtle.drawTurtle();
        }
    });
    window.dispatchEvent(new Event('resize'));
    updateHighlighting();
    turtle.drawTurtle();

    // Context Menu for Mouse events
    canvas.addEventListener('click', (e) => {
        if (interpreter.eventHandlers.click) {
            const rect = canvas.getBoundingClientRect();
            interpreter.variables.set('mousex', turtle.fromCanvasX(e.clientX - rect.left));
            interpreter.variables.set('mousey', turtle.fromCanvasY(e.clientY - rect.top));
            interpreter.runEvent(interpreter.eventHandlers.click);
        }
    });
    window.addEventListener('keydown', (e) => {
        if (interpreter.eventHandlers.keydown.has(e.key.toLowerCase())) {
            interpreter.runEvent(interpreter.eventHandlers.keydown.get(e.key.toLowerCase()));
        }
    });

    // Examples
    const examplesSelect = document.getElementById('examples-select');
    const examples = {
        'square': 'repete 4 [ av 100 td 90 ]',
        'circle': 'repete 360 [ av 1 td 1 ]',
        'flower': 'repete 36 [ repete 4 [ av 100 td 90 ] td 10 ]',
        'tree': 'pour arbre :taille\n  si [ :taille > 5 ] [\n    av :taille\n    td 20\n    arbre :taille - 10\n    tg 40\n    arbre :taille - 10\n    td 20\n    re :taille\n  ]\nfin\ntc 2 tg 90 lc re 100 bc\narbre 60',
        'array': 'ma_liste = [10 20 30 40]\necris ma_liste\necris [Le 2ème élément est :]\necris ma_liste [ 2 ]',
        'multimedia': 'montreimage "https://picsum.photos/200/300 [50 50 100 100]\nmontrevideo "https://www.w3schools.com/html/mov_bbb.mp4 [200 50 150 100]'
    };

    // Populate examples
    for (const key in examples) {
        const opt = document.createElement('option');
        opt.value = key; opt.textContent = key;
        examplesSelect.appendChild(opt);
    }

    examplesSelect.addEventListener('change', (e) => {
        if (e.target.value) {
            codeEditor.value = examples[e.target.value];
            updateHighlighting();
        }
    });
});
