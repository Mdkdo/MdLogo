class Turtle {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.visible = true;
        this.turtleImage = null; // Optional custom image
        this.reset();
    }

    toCanvasX(x) {
        return this.canvas.width / 2 + x;
    }

    toCanvasY(y) {
        return this.canvas.height / 2 - y;
    }

    fromCanvasX(cx) {
        return cx - this.canvas.width / 2;
    }

    fromCanvasY(cy) {
        return this.canvas.height / 2 - cy;
    }

    reset() {
        this.x = 0;
        this.y = 0;
        this.angle = Math.PI / 2; // Pointing up (logical angle 90 deg)
        this.penDown = true;
        this.color = 'black';
        this.width = 2;
        this.visible = true;
        this.font = '16px Consolas';
        this.clear();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    home() {
        this.x = 0;
        this.y = 0;
        this.angle = Math.PI / 2;
    }

    setxy(x, y) {
        x = parseFloat(x);
        y = parseFloat(y);
        if (this.penDown) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.toCanvasX(this.x), this.toCanvasY(this.y));
            this.ctx.lineTo(this.toCanvasX(x), this.toCanvasY(y));
            this.ctx.strokeStyle = this.color;
            this.ctx.lineWidth = this.width;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }
        this.x = x;
        this.y = y;
    }

    setheading(angleDegrees) {
        this.angle = (90 - parseFloat(angleDegrees)) * Math.PI / 180;
    }

    arc(angleDegrees, radius) {
        if (!this.penDown) return;
        this.ctx.beginPath();
        const startAngle = -this.angle;
        const endAngle = startAngle + (parseFloat(angleDegrees) * Math.PI / 180);
        this.ctx.arc(this.toCanvasX(this.x), this.toCanvasY(this.y), parseFloat(radius), startAngle, endAngle, angleDegrees < 0);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.stroke();
    }

    rectangle(x1, y1, x2, y2) {
        if (!this.penDown) return;
        this.ctx.beginPath();
        const lx1 = this.toCanvasX(parseFloat(x1));
        const ly1 = this.toCanvasY(parseFloat(y1));
        const lx2 = this.toCanvasX(parseFloat(x2));
        const ly2 = this.toCanvasY(parseFloat(y2));
        this.ctx.rect(lx1, ly1, lx2 - lx1, ly2 - ly1);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.stroke();
    }

    circle(r) {
        if (!this.penDown) return;
        this.ctx.beginPath();
        this.ctx.arc(this.toCanvasX(this.x), this.toCanvasY(this.y), parseFloat(r), 0, 2 * Math.PI);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.stroke();
    }

    line(x1, y1, x2, y2) {
        if (!this.penDown) return;
        this.ctx.beginPath();
        this.ctx.moveTo(this.toCanvasX(parseFloat(x1)), this.toCanvasY(parseFloat(y1)));
        this.ctx.lineTo(this.toCanvasX(parseFloat(x2)), this.toCanvasY(parseFloat(y2)));
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
        this.ctx.ellipse(this.toCanvasX(cx), this.toCanvasY(cy), rx, ry, 0, 0, 2 * Math.PI);
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = this.width;
        this.ctx.stroke();
    }

    forward(distance) {
        const newX = this.x + distance * Math.cos(this.angle);
        const newY = this.y + distance * Math.sin(this.angle);

        if (this.penDown) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.toCanvasX(this.x), this.toCanvasY(this.y));
            this.ctx.lineTo(this.toCanvasX(newX), this.toCanvasY(newY));
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

    translateColor(color) {
        if (typeof color !== 'string') return color;
        const colors = {
            'rouge': 'red', 'vert': 'green', 'bleu': 'blue', 'jaune': 'yellow',
            'noir': 'black', 'blanc': 'white', 'gris': 'gray', 'marron': 'brown',
            'orange': 'orange', 'rose': 'pink', 'violet': 'purple', 'cyan': 'cyan',
            'magenta': 'magenta', 'foncé': 'dark', 'clair': 'light'
        };
        let c = color.toLowerCase();
        for (const [fr, en] of Object.entries(colors)) {
            c = c.replace(fr, en);
        }
        return c;
    }

    setpencolor(color) {
        this.color = this.translateColor(color);
    }

    setpensize(size) {
        this.width = parseFloat(size);
    }

    setFont(font) {
        this.font = font;
    }

    write(text) {
        this.ctx.save();
        this.ctx.translate(this.toCanvasX(this.x), this.toCanvasY(this.y));
        this.ctx.rotate(-this.angle + Math.PI / 2);
        this.ctx.font = this.font;
        this.ctx.fillStyle = this.color;
        const s = (text === null || text === undefined) ? "" : String(text);
        this.ctx.fillText(s, 0, 0);
        this.ctx.restore();
    }

    drawTurtle() {
        if (!this.visible) return;

        this.ctx.save();
        this.ctx.translate(this.toCanvasX(this.x), this.toCanvasY(this.y));
        this.ctx.rotate(-this.angle + Math.PI / 2);

        if (this.turtleImage && this.turtleImage.complete) {
            const size = 30;
            this.ctx.drawImage(this.turtleImage, -size/2, -size/2, size, size);
        } else {
            // Default Turtle body
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
        }

        this.ctx.restore();
    }
}

class ReturnSignal {
    constructor(value) {
        this.value = value;
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
                  "square": "Carré", "circle": "Cercle", "spiral-fixed": "Spirale", "flower": "Fleur",
                  "colorful": "Couleurs", "procedure": "Procédure (Carré)", "tree": "Arbre récursif",
                  "math": "Fonctions Mathématiques", "repcount-fix": "Spirale (Variables)",
                  "text": "Texte et Logique", "drawing": "Formes Géométriques", "events": "Événements Souris/Clavier",
                  "array": "Tableaux et Listes", "multimedia": "Multimédia (Vidéo/Image)"
                },
                "errors": {
                  "unknown_command": "Commande inconnue", "unknown_variable": "Variable inconnue",
                  "unterminated_procedure": "Procédure non terminée", "expected_bracket": "Attendu [",
                  "save_auto": "Auto-enregistré", "saved": "Enregistré"
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
        code = code.replace(/\[/g, ' [ ').replace(/\]/g, ' ] ');
        code = code.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ');
        code = code.replace(/,/g, ' , ');

        const initialWords = code.split(/\s+/).filter(t => t.length > 0);
        const finalTokens = [];

        for (let word of initialWords) {
            if (word.startsWith('"') || word === '[' || word === ']' || word === '(' || word === ')' || word === ',') {
                finalTokens.push(word);
                continue;
            }
            const sub = word.split(/(>=|<=|!=|<>|[+\-*/^><=])/g).filter(t => t.length > 0);
            for (let j = 0; j < sub.length; j++) {
                if (sub[j] === '-' && j + 1 < sub.length && /^\d/.test(sub[j+1])) {
                    if (j === 0) {
                        finalTokens.push("-" + sub[j+1]);
                        j++;
                        continue;
                    }
                }
                finalTokens.push(sub[j]);
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
                        break;
                    } else if (tokens[i] && (tokens[i].toLowerCase() === 'end' || tokens[i].toLowerCase() === 'fin')) {
                        break;
                    } else {
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
                    i--;
                    const s = getBlock().join(' ');
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

                if (this.procedures.has(lowerToken)) {
                    const proc = this.procedures.get(lowerToken);
                    const procArgs = new Map();
                    for (const param of proc.params) {
                        procArgs.set(param, evaluateExpression());
                    }
                    try {
                        this.run(proc.body, procArgs);
                    } catch (e) {
                        if (e instanceof ReturnSignal) return e.value;
                        throw e;
                    }
                    return undefined;
                }

                if (['sin', 'cos', 'tan', 'atan', 'sqrt', 'abs', 'exp', 'ln', 'log', 'log10', 'pow', 'random', 'hasard', 'int', 'round', 'arrondi', 'ceil', 'plafond', 'xcor', 'ycor', 'heading', 'cap', 'distance', 'towards', 'vers', 'modulo', 'reste', 'min', 'max', 'élément', 'item', 'list_taille', 'list_size', 'rvb', 'rgb'].includes(lowerToken)) {
                    const func = lowerToken;
                    if (func === 'rvb' || func === 'rgb') {
                        const r = parsePrimary();
                        const v = parsePrimary();
                        const b = parsePrimary();
                        return `rgb(${r},${v},${b})`;
                    }
                    if (func === 'élément' || func === 'item') {
                        const idx = parsePrimary();
                        const list = parsePrimary();
                        if (typeof list === 'string') {
                            const arr = list.trim().split(/\s+/);
                            return arr[idx - 1];
                        }
                        return list;
                    }
                    if (func === 'list_taille' || func === 'list_size') {
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
                    return localVars.get('repcount') || this.variables.get('repcount') || 0;
                }
                if (lowerToken === 'pi') return Math.PI;

                const val = parseFloat(token);
                if (isNaN(val)) {
                    const varName = token.toLowerCase();
                    let list = localVars.get(varName) || this.variables.get(varName);
                    if (list !== undefined && i < tokens.length && tokens[i] === '[') {
                        const idxBlock = getBlock();
                        const oldT = tokens; const oldI = i;
                        tokens = idxBlock; i = 0;
                        const idxVal = evaluateExpression();
                        tokens = oldT; i = oldI;
                        if (typeof list === 'string') {
                            const arr = list.trim().split(/\s+/);
                            return arr[idxVal - 1];
                        }
                    }
                    if (localVars.has(varName)) return localVars.get(varName);
                    if (this.variables.has(varName)) return this.variables.get(varName);
                    return token;
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
                i--;
                return getBlock().join(' ');
            }
            return token;
        };

        const skipSep = () => {
            while (i < tokens.length && (tokens[i] === '(' || tokens[i] === ',')) i++;
        };

        while (i < tokens.length) {
            const rawToken = tokens[i++];
            const token = rawToken.toLowerCase();
            if (rawToken === '(' || rawToken === ',' || rawToken === ')') continue;

            const commonCommands = [
                'fd', 'av', 'forward', 'avance', 'bk', 're', 'back', 'recule', 'rt', 'td', 'right', 'tournedroite', 'lt', 'tg', 'left', 'tournegauche',
                'pu', 'lc', 'penup', 'levépinceau', 'pd', 'bc', 'pendown', 'baissépinceau', 'cs', 've', 'clearscreen', 'videécran', 'home', 'origine',
                'ht', 'ct', 'hideturtle', 'cachetortue', 'st', 'mt', 'showturtle', 'montretortue', 'pc', 'fc', 'fcc', 'setpencolor', 'fixecouleurcrayon',
                'ps', 'tc', 'fep', 'setpensize', 'fixeépaisseurpinceau', 'make', 'donne', 'repeat', 'repete', 'répète',
                'if', 'si', 'ifelse', 'si_sinon', 'to', 'pour', 'end', 'fin',
                'ecris', 'write', 'label', 'print', 'affiche', 'police', 'font',
                'setxy', 'faisxy', 'fixexy', 'setpos', 'fixepos', 'setx', 'faisx', 'fixex', 'sety', 'faisy', 'fixey', 'setheading', 'faiscap', 'fixecap', 'arc', 'clean', 'nettoie', 'setbg', 'fccf',
                'rectangle', 'cercle', 'circle', 'ligne', 'line', 'ellipse', 'joueson', 'playsound', 'montreimage', 'showimage', 'montrevideo', 'showvideo',
                'élément', 'item', 'list_modifie', 'list_modify', 'list_ajout', 'list_append', 'list_retire', 'list_remove', 'quand_clic', 'onclick', 'quand_touche', 'onkey', 'rend', 'output'
            ];
            const functions = ['sin', 'cos', 'tan', 'atan', 'sqrt', 'abs', 'exp', 'ln', 'log', 'log10', 'pow', 'random', 'hasard', 'int', 'round', 'arrondi', 'ceil', 'plafond', 'xcor', 'ycor', 'heading', 'cap', 'distance', 'towards', 'vers', 'modulo', 'reste', 'min', 'max', 'pi', 'pos', 'élément', 'item', 'list_taille', 'list_size'];

            if (rawToken.startsWith(':') || (!commonCommands.includes(token) && !functions.includes(token) && !this.procedures.has(token))) {
                const name = rawToken.startsWith(':') ? rawToken.substring(1).toLowerCase() : token;
                if (i < tokens.length && tokens[i] === '[') {
                    const saveI = i;
                    const idxBlock = getBlock();
                    if (i < tokens.length && tokens[i] === '=') {
                        i++;
                        const newVal = evaluateExpression();
                        const oldT = tokens; const oldI = i;
                        tokens = idxBlock; i = 0;
                        const idxVal = evaluateExpression();
                        tokens = oldT; i = oldI;
                        let list = localVars.get(name) || this.variables.get(name);
                        if (typeof list === 'string') {
                            let arr = list.trim().split(/\s+/);
                            arr[idxVal - 1] = newVal;
                            const res = arr.join(' ');
                            if (localVars.has(name)) localVars.set(name, res);
                            else this.variables.set(name, res);
                            continue;
                        }
                    } else {
                        i = saveI;
                    }
                }
            }

            if (rawToken.startsWith(':') && i < tokens.length && tokens[i] === '=') {
                const varName = rawToken.substring(1).toLowerCase();
                i++;
                const val = evaluateExpression();
                if (localVars.has(varName)) localVars.set(varName, val);
                else this.variables.set(varName, val);
                continue;
            }
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
                try {
                    this.run(proc.body, procArgs);
                } catch (e) {
                    if (!(e instanceof ReturnSignal)) throw e;
                }
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
                        if (parts.length >= 2) this.turtle.setxy(parts[0], parts[1]);
                    } else {
                        skipSep();
                        this.turtle.setxy(val1, evaluateExpression());
                    }
                    break;
                case 'setbg':
                case 'fccf':
                    this.turtle.canvas.style.backgroundColor = this.turtle.translateColor(evaluateExpression());
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
                case 'arc': {
                    const a1 = evaluateExpression(); skipSep();
                    this.turtle.arc(a1, evaluateExpression());
                    break;
                }
                case 'rectangle': {
                    const x1 = evaluateExpression(); skipSep();
                    const y1 = evaluateExpression(); skipSep();
                    const x2 = evaluateExpression(); skipSep();
                    const y2 = evaluateExpression();
                    this.turtle.rectangle(x1, y1, x2, y2);
                    break;
                }
                case 'cercle':
                case 'circle':
                    this.turtle.circle(evaluateExpression());
                    break;
                case 'ligne':
                case 'line': {
                    const lx1 = evaluateExpression(); skipSep();
                    const ly1 = evaluateExpression(); skipSep();
                    const lx2 = evaluateExpression(); skipSep();
                    const ly2 = evaluateExpression();
                    this.turtle.line(lx1, ly1, lx2, ly2);
                    break;
                }
                case 'ellipse': {
                    const ex1 = evaluateExpression(); skipSep();
                    const ey1 = evaluateExpression(); skipSep();
                    const ex2 = evaluateExpression(); skipSep();
                    const ey2 = evaluateExpression();
                    this.turtle.ellipse(ex1, ey1, ex2, ey2);
                    break;
                }
                case 'joueson':
                case 'playsound':
                    new Audio(evaluateExpression()).play().catch(e => console.error(e));
                    break;
                case 'montreimage':
                case 'showimage': {
                    const imgUrl = evaluateExpression();
                    let ix = this.turtle.x, iy = this.turtle.y, iw, ih;
                    if (tokens[i] === '[') {
                        const params = getBlock();
                        const oldT = tokens; const oldI = i;
                        tokens = params; i = 0;
                        ix = evaluateExpression();
                        iy = evaluateExpression();
                        if (i < tokens.length) iw = evaluateExpression();
                        if (i < tokens.length) ih = evaluateExpression();
                        tokens = oldT; i = oldI;
                    }
                    const img = new Image();
                    img.onload = () => {
                        const cx = this.turtle.toCanvasX(ix), cy = this.turtle.toCanvasY(iy);
                        if (iw && ih) this.turtle.ctx.drawImage(img, cx, cy, iw, ih);
                        else this.turtle.ctx.drawImage(img, cx, cy);
                    };
                    img.src = imgUrl;
                    break;
                }
                case 'montrevideo':
                case 'showvideo': {
                    const videoUrl = evaluateExpression();
                    let vx = this.turtle.x, vy = this.turtle.y, vw = 200, vh = 150;
                    if (tokens[i] === '[') {
                        const params = getBlock();
                        const oldT = tokens; const oldI = i;
                        tokens = params; i = 0;
                        vx = evaluateExpression();
                        vy = evaluateExpression();
                        if (i < tokens.length) vw = evaluateExpression();
                        if (i < tokens.length) vh = evaluateExpression();
                        tokens = oldT; i = oldI;
                    }
                    const video = document.createElement('video');
                    video.src = videoUrl;
                    video.autoplay = true; video.loop = true; video.muted = true;
                    video.onplay = () => {
                        const draw = () => {
                            if (!video.paused && !video.ended) {
                                this.turtle.ctx.drawImage(video, this.turtle.toCanvasX(vx), this.turtle.toCanvasY(vy), vw, vh);
                                requestAnimationFrame(draw);
                            }
                        };
                        draw();
                    };
                    break;
                }
                case 'list_modifie':
                case 'list_modify': {
                    const idx = evaluateExpression();
                    let name = tokens[i++];
                    if (name.startsWith('"')) name = name.substring(1).toLowerCase();
                    const val = evaluateExpression();
                    let list = localVars.get(name) || this.variables.get(name);
                    if (typeof list === 'string') {
                        let arr = list.trim().split(/\s+/);
                        arr[idx - 1] = val;
                        const res = arr.join(' ');
                        if (localVars.has(name)) localVars.set(name, res);
                        else this.variables.set(name, res);
                    }
                    break;
                }
                case 'list_ajout':
                case 'list_append': {
                    skipSep();
                    let name = tokens[i++].toLowerCase();
                    if (name.startsWith('"')) name = name.substring(1);
                    const val = evaluateExpression();
                    let list = localVars.get(name) || this.variables.get(name);
                    if (typeof list === 'string') {
                        let arr = list.trim().split(/\s+/);
                        arr.push(val);
                        const res = arr.join(' ');
                        if (localVars.has(name)) localVars.set(name, res);
                        else this.variables.set(name, res);
                    }
                    break;
                }
                case 'list_retire':
                case 'list_remove': {
                    const idx = evaluateExpression(); skipSep();
                    let name = tokens[i++].toLowerCase();
                    if (name.startsWith('"')) name = name.substring(1);
                    let list = localVars.get(name) || this.variables.get(name);
                    if (typeof list === 'string') {
                        let arr = list.trim().split(/\s+/);
                        arr.splice(idx - 1, 1);
                        const res = arr.join(' ');
                        if (localVars.has(name)) localVars.set(name, res);
                        else this.variables.set(name, res);
                    }
                    break;
                }
                case 'quand_clic':
                case 'onclick':
                    this.eventHandlers.click = getBlock();
                    break;
                case 'quand_touche':
                case 'onkey':
                    this.eventHandlers.keydown.set(evaluateExpression().toLowerCase(), getBlock());
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
                    skipSep();
                    let n = tokens[i++];
                    if (n.startsWith('"')) n = n.substring(1).toLowerCase();
                    this.variables.set(n, evaluateExpression());
                    break;
                case 'repeat':
                case 'repete':
                case 'répète':
                    const count = evaluateExpression();
                    const body = getBlock();
                    for (let k = 1; k <= count; k++) {
                        const newLocal = new Map(localVars);
                        newLocal.set('repcount', k);
                        this.run(body, newLocal);
                    }
                    break;
                case 'if':
                case 'si': {
                    const cond = getBlock(), b = getBlock();
                    if (evaluateCondition(cond)) this.run(b, localVars);
                    break;
                }
                case 'ifelse':
                case 'si_sinon': {
                    const cond = getBlock(), t = getBlock(), f = getBlock();
                    if (evaluateCondition(cond)) this.run(t, localVars); else this.run(f, localVars);
                    break;
                }
                case 'ecris':
                case 'write':
                case 'label':
                case 'print':
                case 'affiche':
                    const msg = evaluateExpression();
                    this.turtle.write(msg);
                    if (window.logToConsole) window.logToConsole(String(msg));
                    break;
                case 'rend':
                case 'output':
                    throw new ReturnSignal(evaluateExpression());
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
