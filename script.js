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
    }

    execute(code) {
        const tokens = this.tokenize(code);
        this.turtle.reset(); // Reset turtle state and clear canvas before execution
        try {
            this.parse(tokens);
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
        return code.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    }

    parse(tokens) {
        let i = 0;
        const executeTokens = (tks) => {
            let j = 0;
            while (j < tks.length) {
                const token = tks[j];
                j++;

                switch (token) {
                    case 'fd':
                    case 'forward':
                        this.turtle.forward(parseFloat(tks[j++]));
                        break;
                    case 'bk':
                    case 'back':
                        this.turtle.back(parseFloat(tks[j++]));
                        break;
                    case 'rt':
                    case 'right':
                        this.turtle.right(parseFloat(tks[j++]));
                        break;
                    case 'lt':
                    case 'left':
                        this.turtle.left(parseFloat(tks[j++]));
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
                        this.turtle.setpencolor(tks[j++]);
                        break;
                    case 'ps':
                    case 'setpensize':
                        this.turtle.setpensize(tks[j++]);
                        break;
                    case 'repeat':
                        const countStr = tks[j++];
                        const count = parseInt(countStr);
                        if (isNaN(count)) throw new Error(`Nombre de répétitions invalide: ${countStr}`);
                        if (tks[j++] !== '[') throw new Error('Attendu [ après le nombre de répétitions');
                        const body = [];
                        let bracketCount = 1;
                        while (j < tks.length && bracketCount > 0) {
                            if (tks[j] === '[') bracketCount++;
                            if (tks[j] === ']') bracketCount--;
                            if (bracketCount > 0) body.push(tks[j]);
                            j++;
                        }
                        if (bracketCount > 0) throw new Error('Crochet fermant manquant ]');
                        for (let k = 0; k < count; k++) {
                            executeTokens(body);
                        }
                        break;
                    default:
                        if (token) throw new Error(`Commande inconnue: ${token}`);
                }
            }
        };

        executeTokens(tokens);
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
        'colorful': 'pc red ps 5 fd 50 pc blue fd 50 pc green fd 50'
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
