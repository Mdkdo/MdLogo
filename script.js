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

        // First pass: extract procedures
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
        // Replace operators with spaces around them
        code = code.replace(/([+\-*/><=])/g, ' $1 ');
        // Fix back the != and <= and >=
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

                // Remove procedure definition from tokens
                tokens.splice(startIdx, i - startIdx);
                i = startIdx;
            } else {
                i++;
            }
        }
    }

    run(tokens, localVars) {
        let i = 0;

        const resolveValue = (token) => {
            if (typeof token !== 'string') return token;
            if (token.startsWith(':')) {
                const varName = token.substring(1);
                if (localVars.has(varName)) return localVars.get(varName);
                if (this.variables.has(varName)) return this.variables.get(varName);
                throw new Error(`Variable inconnue: ${varName}`);
            }
            const val = parseFloat(token);
            return isNaN(val) ? token : val;
        };

        const evaluateExpression = () => {
            let left = resolveValue(tokens[i++]);

            // Check for arithmetic operators
            if (i < tokens.length && ['+', '-', '*', '/'].includes(tokens[i])) {
                const op = tokens[i++];
                const right = resolveValue(tokens[i++]);
                switch (op) {
                    case '+': return left + right;
                    case '-': return left - right;
                    case '*': return left * right;
                    case '/': return left / right;
                }
            }
            return left;
        };

        const evaluateCondition = (condTokens) => {
            // Minimal evaluator for condition block [ val1 op val2 ]
            // We assume it's exactly 3 tokens for now or simple variable
            let j = 0;
            const resolveLocal = (t) => {
                if (t.startsWith(':')) {
                    const varName = t.substring(1);
                    if (localVars.has(varName)) return localVars.get(varName);
                    if (this.variables.has(varName)) return this.variables.get(varName);
                    return t;
                }
                const v = parseFloat(t);
                return isNaN(v) ? t : v;
            };

            const v1 = resolveLocal(condTokens[0]);
            const op = condTokens[1];
            const v2 = resolveLocal(condTokens[2]);

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
                    this.turtle.setpencolor(resolveValue(tokens[i++]));
                    break;
                case 'ps':
                case 'setpensize':
                    this.turtle.setpensize(evaluateExpression());
                    break;
                case 'make':
                    let varName = tokens[i++];
                    if (varName.startsWith('"')) varName = varName.substring(1);
                    const varVal = evaluateExpression();
                    this.variables.set(varName, varVal);
                    break;
                case 'repeat':
                    const count = evaluateExpression();
                    const body = getBlock();
                    for (let k = 0; k < count; k++) {
                        this.run(body, localVars);
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
        'polygon': 'to poly :n :size\n  repeat :n [ fd :size rt 360 / :n ]\nend\n\npoly 5 100\npoly 6 80'
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
