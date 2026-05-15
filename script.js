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
        x = parseFloat(x);
        y = parseFloat(y);
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
        this.angle = (parseFloat(angleDegrees) * Math.PI) / 180 - Math.PI / 2;
    }

    arc(angleDegrees, radius) {
        if (!this.penDown) return;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, parseFloat(radius), this.angle, this.angle + (parseFloat(angleDegrees) * Math.PI) / 180, angleDegrees < 0);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.stroke();
    }

    rectangle(x1, y1, x2, y2) {
        if (!this.penDown) return;
        this.ctx.beginPath();
        this.ctx.rect(parseFloat(x1), parseFloat(y1), parseFloat(x2) - parseFloat(x1), parseFloat(y2) - parseFloat(y1));
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.stroke();
    }

    circle(r) {
        if (!this.penDown) return;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, parseFloat(r), 0, 2 * Math.PI);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.stroke();
    }

    line(x1, y1, x2, y2) {
        if (!this.penDown) return;
        this.ctx.beginPath();
        this.ctx.moveTo(parseFloat(x1), parseFloat(y1));
        this.ctx.lineTo(parseFloat(x2), parseFloat(y2));
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.stroke();
    }

    ellipse(x1, y1, x2, y2) {
        if (!this.penDown) return;
        this.ctx.beginPath();
        const rx = Math.abs(parseFloat(x2) - parseFloat(x1)) / 2;
        const ry = Math.abs(parseFloat(y2) - parseFloat(y1)) / 2;
        const cx = (parseFloat(x1) + parseFloat(x2)) / 2;
        const cy = (parseFloat(y1) + parseFloat(y2)) / 2;
        this.ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
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
        this.forward(this.ctx.measureText(s).width + 5);
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
        this.eventHandlers = {
            click: null,
            keydown: new Map()
        };
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
        this.eventHandlers.click = null;
        this.eventHandlers.keydown.clear();
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

    runEvent(body) {
        try {
            this.run(body, new Map());
            this.turtle.drawTurtle();
        } catch (e) {
            console.error("Event execution error:", e);
        }
    }

    tokenize(code) {
        code = code.replace(/;.*$/gm, '');
        // Preserve brackets, parentheses, and commas
        code = code.replace(/\[/g, ' [ ').replace(/\]/g, ' ] ');
        code = code.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ');
        code = code.replace(/,/g, ' , ');

        const initialTokens = code.split(/\s+/).filter(t => t.length > 0);
        const finalTokens = [];

        for (let token of initialTokens) {
            if (token.startsWith('"') || token === '[' || token === ']' || token === '(' || token === ')' || token === ',') {
                finalTokens.push(token);
            } else {
                // Split by operators but keep the operators
                const subTokens = token.split(/(>=|<=|!=|<>|[+\-*/^><=])/g).filter(t => t.length > 0);
                finalTokens.push(...subTokens);
            }
        }
        return finalTokens;
    }

    extractProcedures(tokens) {
        let i = 0;
        const skipSeps = () => {
            while (i < tokens.length && (tokens[i] === '(' || tokens[i] === ',' || tokens[i] === ')')) i++;
        };

        while (i < tokens.length) {
            const token = tokens[i].toLowerCase();
            if (token === 'to' || token === 'pour') {
                const startIdx = i;
                i++;
                skipSeps();
                const name = tokens[i++].toLowerCase();
                const params = [];
                while (i < tokens.length) {
                    skipSeps();
                    if (tokens[i] && tokens[i].startsWith(':')) {
                        params.push(tokens[i++].substring(1).toLowerCase());
                    } else if (tokens[i] && tokens[i] === '[') {
                        break; // End of params, start of body (if not using traditional format)
                    } else if (tokens[i] && (tokens[i].toLowerCase() === 'end' || tokens[i].toLowerCase() === 'fin')) {
                        break;
                    } else {
                        // In some dialects, parameters don't have : in definition
                        // but let's stick to standard Logo for now or just break
                        break;
                    }
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
                    // Only convert to number if it's a single number string
                    if (/^-?\d+(\.\d+)?$/.test(s.trim())) {
                        return parseFloat(s);
                    }
                    return s;
                }

                if (token === '(') {
                    let val = parseExpression();
                    if (tokens[i] === ')') i++;
                    return val;
                }

                if (token === ',' || token === ')') {
                    return parsePrimary();
                }

                if (lowerToken === 'not' || lowerToken === 'non') {
                    return !parsePrimary();
                }

                if (['sin', 'cos', 'tan', 'atan', 'sqrt', 'abs', 'exp', 'ln', 'log', 'log10', 'pow', 'random', 'hasard', 'int', 'round', 'arrondi', 'ceil', 'plafond', 'xcor', 'ycor', 'heading', 'cap', 'distance', 'towards', 'vers', 'modulo', 'reste', 'min', 'max', 'élément', 'item', 'taille', 'count'].includes(lowerToken)) {
                    const func = lowerToken;
                    if (func === 'élément' || func === 'item') {
                        const idx = parsePrimary();
                        const list = parsePrimary();
                        if (typeof list === 'string') {
                            const arr = list.trim().split(/\s+/);
                            return arr[idx - 1];
                        }
                        return list;
                    }
                    if (func === 'taille' || func === 'count') {
                        const list = parsePrimary();
                        if (typeof list === 'string') {
                            return list.trim().split(/\s+/).length;
                        }
                        return 0;
                    }
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

                if (token === ',') return undefined; // Skip commas in expressions

                const val = parseFloat(token);
                if (isNaN(val)) {
                    // Check if it's a variable even without :
                    const varName = token.toLowerCase();
                    if (localVars.has(varName)) return localVars.get(varName);
                    if (this.variables.has(varName)) return this.variables.get(varName);
                    return token; // String literal or unknown
                }
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
            if (rawToken === '(' || rawToken === ',' || rawToken === ')') {
                continue;
            }

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
                'setxy', 'faisxy', 'fixexy', 'setpos', 'fixepos', 'setx', 'faisx', 'fixex', 'sety', 'faisy', 'fixey', 'setheading', 'faiscap', 'fixecap', 'arc', 'clean', 'nettoie', 'setbg', 'fccf',
                'rectangle', 'cercle', 'circle', 'ligne', 'line', 'ellipse', 'joueson', 'playsound', 'montreimage', 'showimage', 'montrevideo', 'showvideo',
                'élément', 'item', 'fixeélément', 'setitem', 'ajoute', 'append', 'retire', 'remove', 'quand_clic', 'onclick', 'quand_touche', 'onkey'
            ];
            const functions = ['sin', 'cos', 'tan', 'atan', 'sqrt', 'abs', 'exp', 'ln', 'log', 'log10', 'pow', 'random', 'hasard', 'int', 'round', 'arrondi', 'ceil', 'plafond', 'xcor', 'ycor', 'heading', 'cap', 'distance', 'towards', 'vers', 'modulo', 'reste', 'min', 'max', 'pi', 'pos', 'élément', 'item'];

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
                case 'rectangle':
                    this.turtle.rectangle(evaluateExpression(), evaluateExpression(), evaluateExpression(), evaluateExpression());
                    break;
                case 'cercle':
                case 'circle':
                    this.turtle.circle(evaluateExpression());
                    break;
                case 'ligne':
                case 'line':
                    this.turtle.line(evaluateExpression(), evaluateExpression(), evaluateExpression(), evaluateExpression());
                    break;
                case 'ellipse':
                    this.turtle.ellipse(evaluateExpression(), evaluateExpression(), evaluateExpression(), evaluateExpression());
                    break;
                case 'joueson':
                case 'playsound':
                    const soundUrl = evaluateExpression();
                    new Audio(soundUrl).play().catch(e => console.error("Audio error:", e));
                    break;
                case 'montreimage':
                case 'showimage':
                    const imgUrl = evaluateExpression();
                    const img = new Image();
                    img.onload = () => this.turtle.ctx.drawImage(img, this.turtle.x, this.turtle.y);
                    img.src = imgUrl;
                    break;
                case 'montrevideo':
                case 'showvideo':
                    const videoUrl = evaluateExpression();
                    const video = document.createElement('video');
                    video.src = videoUrl;
                    video.autoplay = true;
                    video.onplay = () => {
                        const draw = () => {
                            if (!video.paused && !video.ended) {
                                this.turtle.ctx.drawImage(video, this.turtle.x, this.turtle.y, 200, 150);
                                requestAnimationFrame(draw);
                            }
                        };
                        draw();
                    };
                    break;
                case 'élément':
                case 'item':
                    // This is handled in expressions mostly, but as a command it might not make sense unless printing
                    console.log(evaluateExpression());
                    break;
                case 'fixeélément':
                case 'setitem':
                    const index = evaluateExpression();
                    let listName = tokens[i++];
                    if (listName.startsWith('"')) listName = listName.substring(1).toLowerCase();
                    const newVal = evaluateExpression();
                    let list = localVars.get(listName) || this.variables.get(listName);
                    if (typeof list === 'string') {
                        let arr = list.trim().split(/\s+/);
                        arr[index - 1] = newVal;
                        const res = arr.join(' ');
                        if (localVars.has(listName)) localVars.set(listName, res);
                        else this.variables.set(listName, res);
                    }
                    break;
                case 'ajoute':
                case 'append':
                    while (i < tokens.length && (tokens[i] === '(' || tokens[i] === ',')) i++;
                    let appendListName = tokens[i++];
                    if (appendListName.startsWith('"')) appendListName = appendListName.substring(1).toLowerCase();
                    else appendListName = appendListName.toLowerCase();
                    const appendVal = evaluateExpression();
                    let appendList = localVars.get(appendListName) || this.variables.get(appendListName);
                    if (typeof appendList === 'string') {
                        let arr = appendList.trim().split(/\s+/);
                        arr.push(appendVal);
                        const res = arr.join(' ');
                        if (localVars.has(appendListName)) localVars.set(appendListName, res);
                        else this.variables.set(appendListName, res);
                    }
                    break;
                case 'retire':
                case 'remove':
                    const removeIdx = evaluateExpression();
                    while (i < tokens.length && (tokens[i] === '(' || tokens[i] === ',')) i++;
                    let removeListName = tokens[i++];
                    if (removeListName.startsWith('"')) removeListName = removeListName.substring(1).toLowerCase();
                    else removeListName = removeListName.toLowerCase();
                    let removeList = localVars.get(removeListName) || this.variables.get(removeListName);
                    if (typeof removeList === 'string') {
                        let arr = removeList.trim().split(/\s+/);
                        arr.splice(removeIdx - 1, 1);
                        const res = arr.join(' ');
                        if (localVars.has(removeListName)) localVars.set(removeListName, res);
                        else this.variables.set(removeListName, res);
                    }
                    break;
                case 'quand_clic':
                case 'onclick':
                    this.eventHandlers.click = getBlock();
                    break;
                case 'quand_touche':
                case 'onkey':
                    const key = evaluateExpression().toLowerCase();
                    this.eventHandlers.keydown.set(key, getBlock());
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
                    while (i < tokens.length && (tokens[i] === '(' || tokens[i] === ',')) i++;
                    let name = tokens[i++];
                    if (name.startsWith('"')) name = name.substring(1).toLowerCase();
                    else name = name.toLowerCase();
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
                    const msg = evaluateExpression();
                    this.turtle.write(msg);
                    if (window.logToConsole) window.logToConsole(String(msg));
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
    const outputConsole = document.getElementById('output-console');

    const logToConsole = (msg, isError = false) => {
        const div = document.createElement('div');
        div.textContent = msg;
        if (!isError) div.className = 'info';
        outputConsole.appendChild(div);
        outputConsole.scrollTop = outputConsole.scrollHeight;
    };
    window.logToConsole = logToConsole;

    canvas.addEventListener('click', (e) => {
        if (interpreter.eventHandlers.click) {
            // Set mouse vars
            const rect = canvas.getBoundingClientRect();
            interpreter.variables.set('mousex', e.clientX - rect.left);
            interpreter.variables.set('mousey', e.clientY - rect.top);
            interpreter.runEvent(interpreter.eventHandlers.click);
        }
    });

    window.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (interpreter.eventHandlers.keydown.has(key)) {
            interpreter.runEvent(interpreter.eventHandlers.keydown.get(key));
        }
    });

    const codeEditor = document.getElementById('code-editor');
    const runBtn = document.getElementById('run-btn');
    const clearBtn = document.getElementById('clear-btn');
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
        'text': 'police "bold_20px_Arial\necris "Bonjour\nav 50\nfc red\npolice "italic_16px_Courier\necris [Le Logo est puissant !]\nre 50 td 90 av 100\nsi [ (1 = 1) et (non (1 > 2)) ] [\n  ecris "Logique_OK\n]',
        'drawing': 'fc blue tc 3\nrectangle 50 50 150 100\nfc red\ncercle 50\nfc green\nligne 0 0 300 300\nellipse 200 200 400 300',
        'events': 'ecris [Cliquez sur le canevas ou appuyez sur une touche]\n\nquand_clic [\n  fc hasard 1000000\n  setpos [mousex mousey]\n  cercle 20\n]\n\nquand_touche "a [\n  ecris "Touche_A_appuyée\n]',
        'array': 'ma_liste = [10 20 30 40]\necris ma_liste\necris [Le 2ème élément est :]\necris élément 2 ma_liste\n\nfixeélément 2 ma_liste 99\necris [Liste modifiée :]\necris ma_liste\n\najoute "ma_liste 500\necris [Après ajout :]\necris ma_liste'
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
        outputConsole.textContent = '';
        try {
            interpreter.execute(code);
        } catch (e) {
            logToConsole('Erreur: ' + e.message, true);
        }
    });

    clearBtn.addEventListener('click', () => {
        turtle.reset();
        turtle.drawTurtle();
        outputConsole.textContent = '';
    });

    // Default language
    applyLang('fr');
    turtle.drawTurtle();
});
