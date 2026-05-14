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
        // Replace brackets with spaces around them
        code = code.replace(/\[/g, ' [ ').replace(/\]/g, ' ] ');
        // Replace parentheses with spaces
        code = code.replace(/\(/g, ' ( ').replace(/\)/g, ' ) ');
        // Replace operators with spaces around them
        code = code.replace(/([+\-*/^><=])/g, ' $1 ');
        // Fix back the != and <= and >= and <>
        code = code.replace(/! =/g, '!=').replace(/> =/g, '>=').replace(/< =/g, '<=').replace(/< >/g, '<>');

        return code.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    }

    extractProcedures(tokens) {
        let i = 0;
        while (i < tokens.length) {
            if (tokens[i] === 'to') {
                const startIdx = i;
                i++; // skip 'to'
                const name = tokens[i++];
                const params = [];
                while (i < tokens.length && tokens[i].startsWith(':')) {
                    params.push(tokens[i++].substring(1));
                }
                const body = [];
                while (i < tokens.length && tokens[i] !== 'end') {
                    body.push(tokens[i++]);
                }
                if (tokens[i] !== 'end') throw new Error(`Procédure non terminée: ${name}`);
                i++; // skip 'end'
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
            // Recursive descent parser for expressions
            const parsePrimary = () => {
                let token = tokens[i++];
                if (token === '(') {
                    let val = parseExpression();
                    if (tokens[i++] !== ')') throw new Error('Attendu )');
                    return val;
                }

                // Math functions
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
                    throw new Error(`Variable inconnue: ${varName}`);
                }

                const val = parseFloat(token);
                if (isNaN(val)) return token; // String or unknown
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
            if (tokens[i++] !== '[') throw new Error('Attendu [');
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
                i++; // skip =
                const val = evaluateExpression();
                if (localVars.has(varName)) localVars.set(varName, val);
                else this.variables.set(varName, val);
                continue;
            }
            if (!['fd','forward','bk','back','rt','right','lt','left','pu','penup','pd','pendown','cs','clearscreen','home','ht','hideturtle','st','showturtle','pc','setpencolor','ps','setpensize','make','repeat','if','ifelse','to','end'].includes(token) &&
                !this.procedures.has(token) && i < tokens.length && tokens[i] === '=') {
                const varName = token;
                i++; // skip =
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
                case 'forward':
                    this.turtle.forward(evaluateExpression());
                    break;
                case 'bk':
                case 'back':
                    this.turtle.back(evaluateExpression());
                    break;
                case 'rt':
                case 'right':
                    this.turtle.right(evaluateExpression());
                    break;
                case 'lt':
                case 'left':
                    this.turtle.left(evaluateExpression());
                    break;
                case 'pu':
                case 'penup':
                    this.turtle.penup();
                    break;
                case 'pd':
                case 'pendown':
                    this.turtle.pendown();
                    break;
                case 'cs':
                case 'clearscreen':
                    this.turtle.reset();
                    break;
                case 'home':
                    this.turtle.home();
                    break;
                case 'ht':
                case 'hideturtle':
                    this.turtle.hideturtle();
                    break;
                case 'st':
                case 'showturtle':
                    this.turtle.showturtle();
                    break;
                case 'pc':
                case 'setpencolor':
                    this.turtle.setpencolor(evaluateExpression());
                    break;
                case 'ps':
                case 'setpensize':
                    this.turtle.setpensize(evaluateExpression());
                    break;
                case 'make':
                    let name = tokens[i++];
                    if (name.startsWith('"')) name = name.substring(1);
                    this.variables.set(name, evaluateExpression());
                    break;
                case 'repeat':
                    const count = evaluateExpression();
                    const body = getBlock();
                    for (let k = 1; k <= count; k++) {
                        const newLocalVars = new Map(localVars);
                        newLocalVars.set('repcount', k);
                        this.run(body, newLocalVars);
                    }
                    break;
                case 'if':
                    const ifCondBlock = getBlock();
                    const ifBody = getBlock();
                    if (evaluateCondition(ifCondBlock)) {
                        this.run(ifBody, localVars);
                    }
                    break;
                case 'ifelse':
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
                    throw new Error(`Commande inconnue: ${token}`);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('turtle-canvas');
    const ctx = canvas.getContext('2d');
    const turtle = new Turtle(canvas, ctx);
    const interpreter = new LogoInterpreter(turtle);

    const codeEditor = document.getElementById('code-editor');
    const runBtn = document.getElementById('run-btn');
    const clearBtn = document.getElementById('clear-btn');
    const errorConsole = document.getElementById('error-console');
    const examplesSelect = document.getElementById('examples-select');

    const examples = {
        'square': 'repeat 4 [ fd 100 rt 90 ]',
        'circle': 'repeat 360 [ fd 1 rt 1 ]',
        'spiral-fixed': 'repeat 50 [ fd 100 rt 123 ]',
        'flower': 'repeat 36 [ repeat 4 [ fd 100 rt 90 ] rt 10 ]',
        'colorful': 'pc red ps 5 fd 50 pc blue fd 50 pc green fd 50',
        'procedure': 'to square :size\n  repeat 4 [ fd :size rt 90 ]\nend\n\nsquare 50\nsquare 100',
        'tree': 'to tree :size\n  if [ :size > 5 ] [\n    fd :size\n    rt 20\n    tree :size - 10\n    lt 40\n    tree :size - 10\n    rt 20\n    bk :size\n  ]\nend\n\nps 2\nlt 90\npu bk 100 pd\ntree 60',
        'math': 'angle = 0\nrepeat 300 [\n  fd 2 * sin :angle\n  rt 2\n  angle = :angle + 2\n]\n\n; Spirale avec repcount\ncs home\nrepeat 100 [\n  fd sqrt :repcount * 10\n  rt 20\n]',
        'repcount-fix': 'repeat 100 [\n   fd sqrt :repcount * 10\n   rt 20\n]'
    };

    if (examplesSelect) {
        examplesSelect.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val && examples[val]) {
                codeEditor.value = examples[val];
            }
        });
    }

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

    // Initial draw
    turtle.drawTurtle();
});
