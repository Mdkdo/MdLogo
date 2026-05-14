class Turtle {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.visible = true;
        this.reset();
    }

    reset() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.angle = -Math.PI / 2; // Pointing up
        this.penDown = true;
        this.color = 'black';
        this.width = 2;
        this.visible = true;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    home() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.angle = -Math.PI / 2;
    }

    forward(distance) {
        const newX = this.x + distance * Math.cos(this.angle);
        const newY = this.y + distance * Math.sin(this.angle);

        if (this.penDown) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(newX, newY);
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }

        this.x = newX;
        this.y = newY;
    }

    back(distance) {
        this.forward(-distance);
    }

    right(angleDegrees) {
        this.angle += (angleDegrees * Math.PI) / 180;
    }

    left(angleDegrees) {
        this.angle -= (angleDegrees * Math.PI) / 180;
    }

    penup() {
        this.penDown = false;
    }

    pendown() {
        this.penDown = true;
    }

    hideturtle() {
        this.visible = false;
    }

    showturtle() {
        this.visible = true;
    }

    setpencolor(color) {
        this.color = color;
    }

    setpensize(size) {
        this.width = parseFloat(size);
    }

    drawTurtle() {
        if (!this.visible) return;

        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.angle + Math.PI / 2);

        // Turtle body
        this.ctx.beginPath();
        this.ctx.moveTo(0, -12); // head
        this.ctx.lineTo(8, 8);  // right back
        this.ctx.lineTo(-8, 8); // left back
        this.ctx.closePath();

        this.ctx.fillStyle = '#2e7d32';
        this.ctx.fill();
        this.ctx.strokeStyle = '#1b5e20';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.restore();
    }
}

class LogoInterpreter {
    constructor(turtle) {
        this.turtle = turtle;
        this.variables = new Map();
        this.procedures = new Map();
        this.lang = 'fr';
        this.translations = {};
    }

    setTranslations(translations, lang) {
        this.translations = translations;
        this.lang = lang;
    }

    t(key) {
        return this.translations[this.lang]?.errors[key] || key;
    }

    execute(code) {
        this.variables.clear();
        this.procedures.clear();
        this.turtle.reset();

        const tokens = this.tokenize(code);
        this.extractProcedures(tokens);

        try {
            this.run(tokens, new Map());
        } catch (e) {
            console.error(e);
            throw e;
        } finally {
            this.turtle.drawTurtle();
        }
    }

    tokenize(code) {
        code = code.replace(/;.*$/gm, '');
        code = code.replace(/\[/g, ' [ ').replace(/\]/g, ' ] ');
        code = code.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ');
        code = code.replace(/([+\-*/^><=])/g, ' $1 ');
        code = code.replace(/! =/g, '!=').replace(/> =/g, '>=').replace(/< =/g, '<=').replace(/< >/g, '<>');

        return code.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    }

    extractProcedures(tokens) {
        let i = 0;
        while (i < tokens.length) {
            if (tokens[i] === 'to' || tokens[i] === 'pour') {
                const startIdx = i;
                i++;
                const name = tokens[i++];
                const params = [];
                while (i < tokens.length && tokens[i].startsWith(':')) {
                    params.push(tokens[i++].substring(1));
                }
                const body = [];
                while (i < tokens.length && tokens[i] !== 'end' && tokens[i] !== 'fin') {
                    body.push(tokens[i++]);
                }
                if (i >= tokens.length || (tokens[i] !== 'end' && tokens[i] !== 'fin')) {
                     throw new Error(this.t('unterminated_procedure') + ': ' + name);
                }
                i++; // skip 'end' or 'fin'
                this.procedures.set(name, { params, body });
                tokens.splice(startIdx, i - startIdx);
                i = startIdx;
            } else {
                i++;
            }
        }
    }

    run(tokens, localVars) {
        let i = 0;

        const evaluateExpression = () => {
            const parsePrimary = () => {
                let token = tokens[i++];
                if (token === '(') {
                    let val = parseExpression();
                    if (tokens[i++] !== ')') throw new Error('Attendu )');
                    return val;
                }

                if (['sin', 'cos', 'tan', 'sqrt', 'abs', 'exp', 'ln', 'log', 'pow'].includes(token)) {
                    const func = token;
                    if (func === 'pow') {
                        const base = parsePrimary();
                        const exponent = parsePrimary();
                        return Math.pow(base, exponent);
                    }
                    const arg = parsePrimary();
                    switch (func) {
                        case 'sin': return Math.sin(arg * Math.PI / 180);
                        case 'cos': return Math.cos(arg * Math.PI / 180);
                        case 'tan': return Math.tan(arg * Math.PI / 180);
                        case 'sqrt': return Math.sqrt(arg);
                        case 'abs': return Math.abs(arg);
                        case 'exp': return Math.exp(arg);
                        case 'ln':
                        case 'log': return Math.log(arg);
                        default: return 0;
                    }
                }

                if (token.startsWith(':')) {
                    const varName = token.substring(1);
                    if (localVars.has(varName)) return localVars.get(varName);
                    if (this.variables.has(varName)) return this.variables.get(varName);
                    throw new Error(this.t('unknown_variable') + ': ' + varName);
                }

                const val = parseFloat(token);
                if (isNaN(val)) return token;
                return val;
            };

            const parsePower = () => {
                let left = parsePrimary();
                while (i < tokens.length && tokens[i] === '^') {
                    i++;
                    let right = parsePrimary();
                    left = Math.pow(left, right);
                }
                return left;
            };

            const parseMulDiv = () => {
                let left = parsePower();
                while (i < tokens.length && (tokens[i] === '*' || tokens[i] === '/')) {
                    const op = tokens[i++];
                    const right = parsePower();
                    if (op === '*') left *= right;
                    else left /= right;
                }
                return left;
            };

            const parseExpression = () => {
                let left = parseMulDiv();
                while (i < tokens.length && (tokens[i] === '+' || tokens[i] === '-')) {
                    const op = tokens[i++];
                    const right = parseMulDiv();
                    if (op === '+') left += right;
                    else left -= right;
                }
                return left;
            };

            return parseExpression();
        };

        const evaluateCondition = (condTokens) => {
            const originalTokens = tokens;
            const originalI = i;
            tokens = condTokens;
            i = 0;

            try {
                const v1 = evaluateExpression();
                if (i >= tokens.length) return !!v1;
                const op = tokens[i++];
                const v2 = evaluateExpression();
                switch (op) {
                    case '=': return v1 == v2;
                    case '!=':
                    case '<>': return v1 != v2;
                    case '<': return v1 < v2;
                    case '>': return v1 > v2;
                    case '<=': return v1 <= v2;
                    case '>=': return v1 >= v2;
                    default: return !!v1;
                }
            } finally {
                tokens = originalTokens;
                i = originalI;
            }
        };

        const getBlock = () => {
            if (tokens[i++] !== '[') throw new Error(this.t('expected_bracket'));
            const block = [];
            let bracketCount = 1;
            while (i < tokens.length && bracketCount > 0) {
                if (tokens[i] === '[') bracketCount++;
                if (tokens[i] === ']') bracketCount--;
                if (bracketCount > 0) block.push(tokens[i]);
                i++;
            }
            return block;
        };

        while (i < tokens.length) {
            const token = tokens[i++];

            // Assignment
            if (token.startsWith(':') && i < tokens.length && tokens[i] === '=') {
                const varName = token.substring(1);
                i++;
                const val = evaluateExpression();
                if (localVars.has(varName)) localVars.set(varName, val);
                else this.variables.set(varName, val);
                continue;
            }

            const commonCommands = ['fd','av','forward','bk','re','back','rt','td','right','lt','tg','left','pu','lc','penup','pd','bc','pendown','cs','ve','clearscreen','home','ht','ct','hideturtle','st','mt','showturtle','pc','fc','setpencolor','ps','tc','setpensize','make','donne','repeat','répète','if','si','ifelse','si_sinon','to','pour','end','fin'];
            if (!commonCommands.includes(token) &&
                !this.procedures.has(token) && i < tokens.length && tokens[i] === '=') {
                const varName = token;
                i++;
                const val = evaluateExpression();
                if (localVars.has(varName)) localVars.set(varName, val);
                else this.variables.set(varName, val);
                continue;
            }

            if (this.procedures.has(token)) {
                const proc = this.procedures.get(token);
                const procArgs = new Map();
                for (const param of proc.params) {
                    procArgs.set(param, evaluateExpression());
                }
                this.run(proc.body, procArgs);
                continue;
            }

            switch (token) {
                case 'fd':
                case 'av':
                case 'forward':
                    this.turtle.forward(evaluateExpression());
                    break;
                case 'bk':
                case 're':
                case 'back':
                    this.turtle.back(evaluateExpression());
                    break;
                case 'rt':
                case 'td':
                case 'right':
                    this.turtle.right(evaluateExpression());
                    break;
                case 'lt':
                case 'tg':
                case 'left':
                    this.turtle.left(evaluateExpression());
                    break;
                case 'pu':
                case 'lc':
                case 'penup':
                    this.turtle.penup();
                    break;
                case 'pd':
                case 'bc':
                case 'pendown':
                    this.turtle.pendown();
                    break;
                case 'cs':
                case 've':
                case 'clearscreen':
                    this.turtle.reset();
                    break;
                case 'home':
                    this.turtle.home();
                    break;
                case 'ht':
                case 'ct':
                case 'hideturtle':
                    this.turtle.hideturtle();
                    break;
                case 'st':
                case 'mt':
                case 'showturtle':
                    this.turtle.showturtle();
                    break;
                case 'pc':
                case 'fc':
                case 'setpencolor':
                    this.turtle.setpencolor(evaluateExpression());
                    break;
                case 'ps':
                case 'tc':
                case 'setpensize':
                    this.turtle.setpensize(evaluateExpression());
                    break;
                case 'make':
                case 'donne':
                    let name = tokens[i++];
                    if (name.startsWith('"')) name = name.substring(1);
                    this.variables.set(name, evaluateExpression());
                    break;
                case 'repeat':
                case 'répète':
                    const count = evaluateExpression();
                    const body = getBlock();
                    for (let k = 1; k <= count; k++) {
                        const newLocalVars = new Map(localVars);
                        newLocalVars.set('repcount', k);
                        this.run(body, newLocalVars);
                    }
                    break;
                case 'if':
                case 'si':
                    const ifCondBlock = getBlock();
                    const ifBody = getBlock();
                    if (evaluateCondition(ifCondBlock)) {
                        this.run(ifBody, localVars);
                    }
                    break;
                case 'ifelse':
                case 'si_sinon':
                    const ifelseCondBlock = getBlock();
                    const trueBody = getBlock();
                    const falseBody = getBlock();
                    if (evaluateCondition(ifelseCondBlock)) {
                        this.run(trueBody, localVars);
                    } else {
                        this.run(falseBody, localVars);
                    }
                    break;
                default:
                    throw new Error(this.t('unknown_command') + ': ' + token);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('turtle-canvas');
    const ctx = canvas.getContext('2d');
    const turtle = new Turtle(canvas, ctx);
    const interpreter = new LogoInterpreter(turtle);

    const codeEditor = document.getElementById('code-editor');
    const runBtn = document.getElementById('run-btn');
    const clearBtn = document.getElementById('clear-btn');
    const errorConsole = document.getElementById('error-console');
    const examplesSelect = document.getElementById('examples-select');
    const langSelect = document.getElementById('lang-select');
    const titleEl = document.querySelector('header h1');

    let translations = {};
    try {
        const response = await fetch('lang.json');
        translations = await response.json();
    } catch (e) {
        console.error('Failed to load translations', e);
    }

    const applyLang = (lang) => {
        const t = translations[lang];
        if (!t) return;

        interpreter.setTranslations(translations, lang);
        titleEl.textContent = t.title;
        codeEditor.placeholder = t.placeholder;
        runBtn.textContent = t.run;
        clearBtn.textContent = t.clear;

        // Update examples dropdown
        examplesSelect.innerHTML = `<option value="">${t.choose_example}</option>`;
        for (const [key, label] of Object.entries(t.examples)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = label;
            examplesSelect.appendChild(option);
        }
    };

    const examples = {
        'square': 'répète 4 [ av 100 td 90 ]',
        'circle': 'répète 360 [ av 1 td 1 ]',
        'spiral-fixed': 'répète 50 [ av 100 td 123 ]',
        'flower': 'répète 36 [ répète 4 [ av 100 td 90 ] td 10 ]',
        'colorful': 'fc red tc 5 av 50 fc blue av 50 fc green av 50',
        'procedure': 'pour carré :taille\n  répète 4 [ av :taille td 90 ]\nfin\n\ncarré 50\ncarré 100',
        'tree': 'pour arbre :taille\n  si [ :taille > 5 ] [\n    av :taille\n    td 20\n    arbre :taille - 10\n    tg 40\n    arbre :taille - 10\n    td 20\n    re :taille\n  ]\nfin\n\ntc 2\ntg 90\nlc re 100 bc\narbre 60',
        'math': 'angle = 0\nrépète 300 [\n  av 2 * sin :angle\n  td 2\n  angle = :angle + 2\n]\n\n; Spirale avec repcount\nve home\nrépète 100 [\n  av sqrt :repcount * 10\n  td 20\n]',
        'repcount-fix': 'répète 100 [\n   av sqrt :repcount * 10\n   td 20\n]'
    };

    langSelect.addEventListener('change', (e) => {
        applyLang(e.target.value);
    });

    examplesSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val && examples[val]) {
            codeEditor.value = examples[val];
        }
    });

    runBtn.addEventListener('click', () => {
        const code = codeEditor.value;
        errorConsole.textContent = '';
        try {
            interpreter.execute(code);
        } catch (e) {
            errorConsole.textContent = 'Erreur: ' + e.message;
        }
    });

    clearBtn.addEventListener('click', () => {
        turtle.reset();
        turtle.drawTurtle();
        errorConsole.textContent = '';
    });

    // Default language
    applyLang('fr');
    turtle.drawTurtle();
});
