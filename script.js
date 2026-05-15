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
        this.font = '16px Consolas';
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

    setxy(x, y) {
        if (this.penDown) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.x, this.y);
            this.ctx.lineTo(x, y);
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }
        this.x = x;
        this.y = y;
    }

    setheading(angleDegrees) {
        this.angle = (angleDegrees * Math.PI) / 180 - Math.PI / 2;
    }

    arc(angleDegrees, radius) {
        if (!this.penDown) return;
        this.ctx.beginPath();
        // Logo arcs are usually centered on the turtle and start from current heading
        // But some implementations draw it differently.
        // Let's implement it as: draw an arc with radius R, covering angle A.
        this.ctx.arc(this.x, this.y, radius, this.angle, this.angle + (angleDegrees * Math.PI) / 180, angleDegrees < 0);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.stroke();
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

    setFont(font) {
        this.font = font;
    }

    write(text) {
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.angle + Math.PI / 2);
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.color;
        // If text is a number, convert to string. If null/undefined, use empty string.
        const s = (text === null || text === undefined) ? "" : String(text);
        this.ctx.fillText(s, 0, 0);
        this.ctx.restore();
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
        this.translations = {
            "fr": {
                "title": "Interpréteur Logo (Tortue)",
                "placeholder": "Entrez vos commandes Logo ici...\nExemple: répète 4 [ av 100 td 90 ]",
                "run": "Exécuter",
                "clear": "Effacer",
                "choose_example": "-- Choisir un exemple --",
                "examples": {
                  "square": "Carré",
                  "circle": "Cercle",
                  "spiral-fixed": "Spirale",
                  "flower": "Fleur",
                  "colorful": "Couleurs",
                  "procedure": "Procédure (Carré)",
                  "tree": "Arbre récursif",
                  "math": "Fonctions Mathématiques",
                  "repcount-fix": "Spirale (Variables)"
                },
                "errors": {
                  "unknown_command": "Commande inconnue",
                  "unknown_variable": "Variable inconnue",
                  "unterminated_procedure": "Procédure non terminée",
                  "expected_bracket": "Attendu ["
                }
            }
        };
    }

    setTranslations(translations, lang) {
        this.translations = translations;
        this.lang = lang;
    }

    t(key) {
        return this.translations[this.lang]?.errors?.[key] || key;
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

        const initialTokens = code.split(/\s+/).filter(t => t.length > 0);
        const finalTokens = [];

        for (let token of initialTokens) {
            if (token.startsWith('"') || token === '[' || token === ']' || token === '(' || token === ')') {
                finalTokens.push(token);
            } else {
                const subTokens = token.split(/(>=|<=|!=|<>|[+\-*/^><=])/g).filter(t => t.length > 0);
                finalTokens.push(...subTokens);
            }
        }
        return finalTokens;
    }

    extractProcedures(tokens) {
        let i = 0;
        while (i < tokens.length) {
            const token = tokens[i].toLowerCase();
            if (token === 'to' || token === 'pour') {
                const startIdx = i;
                i++;
                const name = tokens[i++].toLowerCase();
                const params = [];
                while (i < tokens.length && tokens[i].startsWith(':')) {
                    params.push(tokens[i++].substring(1).toLowerCase());
                }
                const body = [];
                while (i < tokens.length && tokens[i].toLowerCase() !== 'end' && tokens[i].toLowerCase() !== 'fin') {
                    body.push(tokens[i++]);
                }
                if (i >= tokens.length || (tokens[i].toLowerCase() !== 'end' && tokens[i].toLowerCase() !== 'fin')) {
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
            const parseExpression = () => parseLogical();

            const parseLogical = () => {
                let left = parseComparison();
                while (i < tokens.length) {
                    const op = tokens[i].toLowerCase();
                    if (['and', 'et', 'or', 'ou', 'xor'].includes(op)) {
                        i++;
                        const right = parseComparison();
                        switch (op) {
                            case 'and':
                            case 'et': left = left && right; break;
                            case 'or':
                            case 'ou': left = left || right; break;
                            case 'xor': left = (!!left ^ !!right); break;
                        }
                    } else {
                        break;
                    }
                }
                return left;
            };

            const parseComparison = () => {
                let left = parseAddSub();
                while (i < tokens.length && ['=', '!=', '<>', '<', '>', '<=', '>='].includes(tokens[i])) {
                    const op = tokens[i++];
                    const right = parseAddSub();
                    switch (op) {
                        case '=': left = (left == right); break;
                        case '!=':
                        case '<>': left = (left != right); break;
                        case '<': left = (left < right); break;
                        case '>': left = (left > right); break;
                        case '<=': left = (left <= right); break;
                        case '>=': left = (left >= right); break;
                    }
                }
                return left;
            };

            const parseAddSub = () => {
                let left = parseMulDiv();
                while (i < tokens.length && (tokens[i] === '+' || tokens[i] === '-')) {
                    const op = tokens[i++];
                    const right = parseMulDiv();
                    if (op === '+') left += right;
                    else left -= right;
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

            const parsePower = () => {
                let left = parseUnary();
                while (i < tokens.length && tokens[i] === '^') {
                    i++;
                    let right = parseUnary();
                    left = Math.pow(left, right);
                }
                return left;
            };

            const parseUnary = () => {
                if (tokens[i] === '-') {
                    i++;
                    return -parseUnary();
                }
                if (tokens[i] === '+') {
                    i++;
                    return parseUnary();
                }
                return parsePrimary();
            };

            const parsePrimary = () => {
                let token = tokens[i++];
                if (!token) return undefined;
                const lowerToken = token.toLowerCase();

                if (token.startsWith('"')) {
                    const s = token.substring(1).replace(/_/g, ' ');
                    const n = parseFloat(s);
                    return isNaN(n) ? s : n;
                }

                if (token === '[') {
                    i--; // Put back [ so getBlock can handle it
                    const s = getBlock().join(' ');
                    const n = parseFloat(s);
                    return isNaN(n) ? s : n;
                }

                if (token === '(') {
                    let val = parseExpression();
                    if (tokens[i++] !== ')') throw new Error('Attendu )');
                    return val;
                }

                if (lowerToken === 'not' || lowerToken === 'non') {
                    return !parsePrimary();
                }

                if (['sin', 'cos', 'tan', 'atan', 'sqrt', 'abs', 'exp', 'ln', 'log', 'log10', 'pow', 'random', 'hasard', 'int', 'round', 'arrondi', 'ceil', 'plafond', 'xcor', 'ycor', 'heading', 'cap', 'distance', 'towards', 'vers', 'modulo', 'reste', 'min', 'max'].includes(lowerToken)) {
                    const func = lowerToken;
                    if (func === 'pow') {
                        const base = parsePrimary();
                        const exponent = parsePrimary();
                        return Math.pow(base, exponent);
                    }
                    if (func === 'random' || func === 'hasard') {
                        const limit = parsePrimary();
                        return Math.floor(Math.random() * limit);
                    }
                    if (func === 'distance') {
                        const x = parsePrimary();
                        const y = parsePrimary();
                        return Math.sqrt(Math.pow(x - this.turtle.x, 2) + Math.pow(y - this.turtle.y, 2));
                    }
                    if (func === 'towards' || func === 'vers') {
                        const x = parsePrimary();
                        const y = parsePrimary();
                        const angle = Math.atan2(y - this.turtle.y, x - this.turtle.x);
                        return (angle + Math.PI / 2) * 180 / Math.PI;
                    }
                    if (func === 'pos') {
                        return `${Math.round(this.turtle.x)} ${Math.round(this.turtle.y)}`;
                    }
                    if (func === 'modulo' || func === 'reste') {
                        const a = parsePrimary();
                        const b = parsePrimary();
                        return a % b;
                    }
                    if (func === 'min' || func === 'max') {
                        const a = parsePrimary();
                        const b = parsePrimary();
                        return func === 'min' ? Math.min(a, b) : Math.max(a, b);
                    }
                    if (func === 'xcor') return this.turtle.x;
                    if (func === 'ycor') return this.turtle.y;
                    if (func === 'heading' || func === 'cap') return (this.turtle.angle + Math.PI / 2) * 180 / Math.PI;

                    const arg = parsePrimary();
                    switch (func) {
                        case 'sin': return Math.sin(arg * Math.PI / 180);
                        case 'cos': return Math.cos(arg * Math.PI / 180);
                        case 'tan': return Math.tan(arg * Math.PI / 180);
                        case 'atan': return Math.atan(arg) * 180 / Math.PI;
                        case 'sqrt': return Math.sqrt(arg);
                        case 'abs': return Math.abs(arg);
                        case 'exp': return Math.exp(arg);
                        case 'int': return Math.floor(arg);
                        case 'round':
                        case 'arrondi': return Math.round(arg);
                        case 'ceil':
                        case 'plafond': return Math.ceil(arg);
                        case 'ln':
                        case 'log': return Math.log(arg);
                        case 'log10': return Math.log10(arg);
                        default: return 0;
                    }
                }

                if (token.startsWith(':')) {
                    const varName = token.substring(1).toLowerCase();
                    if (localVars.has(varName)) return localVars.get(varName);
                    if (this.variables.has(varName)) return this.variables.get(varName);
                    throw new Error(this.t('unknown_variable') + ': ' + varName);
                }

                if (lowerToken === 'repcount') {
                    if (localVars.has('repcount')) return localVars.get('repcount');
                    if (this.variables.has('repcount')) return this.variables.get('repcount');
                    return 0;
                }

                if (lowerToken === 'pi') return Math.PI;

                const val = parseFloat(token);
                if (isNaN(val)) return token; // String (can be case sensitive)
                return val;
            };

            return parseExpression();
        };

        const evaluateCondition = (condTokens) => {
            const originalTokens = tokens;
            const originalI = i;
            tokens = condTokens;
            i = 0;

            try {
                return evaluateExpression();
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

        const getQuotedString = () => {
            let token = tokens[i++];
            if (!token) return "";
            if (token.startsWith('"')) return token.substring(1).replace(/_/g, ' ');
            if (token === '[') {
                i--; // put it back
                return getBlock().join(' ');
            }
            return token;
        };

        while (i < tokens.length) {
            const rawToken = tokens[i++];
            const token = rawToken.toLowerCase();

            // Assignment
            if (rawToken.startsWith(':') && i < tokens.length && tokens[i] === '=') {
                const varName = rawToken.substring(1).toLowerCase();
                i++;
                const val = evaluateExpression();
                if (localVars.has(varName)) localVars.set(varName, val);
                else this.variables.set(varName, val);
                continue;
            }

            const commonCommands = [
                'fd', 'av', 'forward', 'avance', 'bk', 're', 'back', 'recule', 'rt', 'td', 'right', 'tournedroite', 'lt', 'tg', 'left', 'tournegauche',
                'pu', 'lc', 'penup', 'levépinceau', 'pd', 'bc', 'pendown', 'baissépinceau', 'cs', 've', 'clearscreen', 'videécran', 'home', 'origine',
                'ht', 'ct', 'hideturtle', 'cachetortue', 'st', 'mt', 'showturtle', 'montretortue', 'pc', 'fc', 'fcc', 'setpencolor', 'fixecouleurcrayon',
                'ps', 'tc', 'fep', 'setpensize', 'fixeépaisseurpinceau', 'make', 'donne', 'repeat', 'repete', 'répète',
                'if', 'si', 'ifelse', 'si_sinon', 'to', 'pour', 'end', 'fin',
                'ecris', 'write', 'label', 'print', 'affiche', 'police', 'font',
                'setxy', 'faisxy', 'fixexy', 'setpos', 'fixepos', 'setx', 'faisx', 'fixex', 'sety', 'faisy', 'fixey', 'setheading', 'faiscap', 'fixecap', 'arc', 'clean', 'nettoie', 'setbg', 'fccf'
            ];
            const functions = ['sin', 'cos', 'tan', 'atan', 'sqrt', 'abs', 'exp', 'ln', 'log', 'log10', 'pow', 'random', 'hasard', 'int', 'round', 'arrondi', 'ceil', 'plafond', 'xcor', 'ycor', 'heading', 'cap', 'distance', 'towards', 'vers', 'modulo', 'reste', 'min', 'max', 'pi', 'pos'];

            if (!commonCommands.includes(token) && !functions.includes(token) &&
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
                case 'avance':
                    this.turtle.forward(evaluateExpression());
                    break;
                case 'bk':
                case 're':
                case 'back':
                case 'recule':
                    this.turtle.back(evaluateExpression());
                    break;
                case 'rt':
                case 'td':
                case 'right':
                case 'tournedroite':
                    this.turtle.right(evaluateExpression());
                    break;
                case 'lt':
                case 'tg':
                case 'left':
                case 'tournegauche':
                    this.turtle.left(evaluateExpression());
                    break;
                case 'pu':
                case 'lc':
                case 'penup':
                case 'levépinceau':
                    this.turtle.penup();
                    break;
                case 'pd':
                case 'bc':
                case 'pendown':
                case 'baissépinceau':
                    this.turtle.pendown();
                    break;
                case 'cs':
                case 've':
                case 'clearscreen':
                case 'videécran':
                    this.turtle.reset();
                    break;
                case 'home':
                case 'origine':
                    this.turtle.home();
                    break;
                case 'clean':
                case 'nettoie':
                    this.turtle.clear();
                    break;
                case 'setxy':
                case 'faisxy':
                case 'fixexy':
                case 'setpos':
                case 'fixepos':
                    const val1 = evaluateExpression();
                    if (typeof val1 === 'string') {
                        const parts = val1.trim().split(/\s+/).map(parseFloat);
                        if (parts.length >= 2) {
                            this.turtle.setxy(parts[0], parts[1]);
                        }
                    } else {
                        this.turtle.setxy(val1, evaluateExpression());
                    }
                    break;
                case 'setbg':
                case 'fccf':
                    this.turtle.canvas.style.backgroundColor = evaluateExpression();
                    break;
                case 'setx':
                case 'faisx':
                case 'fixex':
                    this.turtle.setxy(evaluateExpression(), this.turtle.y);
                    break;
                case 'sety':
                case 'faisy':
                case 'fixey':
                    this.turtle.setxy(this.turtle.x, evaluateExpression());
                    break;
                case 'setheading':
                case 'faiscap':
                case 'fixecap':
                    this.turtle.setheading(evaluateExpression());
                    break;
                case 'arc':
                    this.turtle.arc(evaluateExpression(), evaluateExpression());
                    break;
                case 'ht':
                case 'ct':
                case 'hideturtle':
                case 'cachetortue':
                    this.turtle.hideturtle();
                    break;
                case 'st':
                case 'mt':
                case 'showturtle':
                case 'montretortue':
                    this.turtle.showturtle();
                    break;
                case 'pc':
                case 'fc':
                case 'fcc':
                case 'setpencolor':
                case 'fixecouleurcrayon':
                    this.turtle.setpencolor(evaluateExpression());
                    break;
                case 'ps':
                case 'tc':
                case 'fep':
                case 'setpensize':
                case 'fixeépaisseurpinceau':
                    this.turtle.setpensize(evaluateExpression());
                    break;
                case 'make':
                case 'donne':
                    let name = tokens[i++];
                    if (name.startsWith('"')) name = name.substring(1).toLowerCase();
                    this.variables.set(name, evaluateExpression());
                    break;
                case 'repeat':
                case 'repete':
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
                case 'ecris':
                case 'write':
                case 'label':
                case 'print':
                case 'affiche':
                    this.turtle.write(evaluateExpression());
                    break;
                case 'police':
                case 'font':
                    this.turtle.setFont(getQuotedString());
                    break;
                default:
                    throw new Error(this.t('unknown_command') + ': ' + rawToken);
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

    const examples = {
        'square': 'repete 4 [ av 100 td 90 ]',
        'circle': 'repete 360 [ av 1 td 1 ]',
        'spiral-fixed': 'repete 50 [ av 100 td 123 ]',
        'flower': 'repete 36 [ repete 4 [ av 100 td 90 ] td 10 ]',
        'colorful': 'fc red tc 5 av 50 fc blue av 50 fc green av 50',
        'procedure': 'pour carré :taille\n  repete 4 [ av :taille td 90 ]\nfin\n\ncarré 50\ncarré 100',
        'tree': 'pour arbre :taille\n  si [ :taille > 5 ] [\n    av :taille\n    td 20\n    arbre :taille - 10\n    tg 40\n    arbre :taille - 10\n    td 20\n    re :taille\n  ]\nfin\n\ntc 2\ntg 90\nlc re 100 bc\narbre 60',
        'math': 'angle = 0\nrepete 300 [\n  av 2 * sin :angle\n  td 2\n  angle = :angle + 2\n]\n\n; Spirale avec repcount\nve home\nrepete 100 [\n  av sqrt :repcount * 10\n  td 20\n]',
        'repcount-fix': 'repete 100 [\n   av sqrt :repcount * 10\n   td 20\n]',
        'text': 'police "bold_20px_Arial\necris "Bonjour\nav 50\nfc red\npolice "italic_16px_Courier\necris [Le Logo est puissant !]\nre 50 td 90 av 100\nsi [ (1 = 1) et (non (1 > 2)) ] [\n  ecris "Logique_OK\n]'
    };

    let translations = interpreter.translations;

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

    try {
        const response = await fetch('lang.json');
        if (response.ok) {
            translations = await response.json();
        }
    } catch (e) {
        console.warn('Could not load lang.json from server, using default French.', e);
    }

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
