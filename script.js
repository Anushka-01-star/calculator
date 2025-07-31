document.addEventListener('DOMContentLoaded', () => {
    const resultInput = document.getElementById('result');
    const buttons = document.querySelector('.buttons');

    let expression = '0';
    let memory = 0;

    // --- Update Display --- //
    function updateDisplay() {
        const displayExpression = expression
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/\^/g, 'xʸ');
        resultInput.value = displayExpression;

        // Adjust font size based on length
        const maxLength = 10; // Max length before font size reduction
        const defaultFontSize = 56;
        const minFontSize = 20;

        if (displayExpression.length > maxLength) {
            const newSize = Math.max(minFontSize, defaultFontSize - (displayExpression.length - maxLength) * 2.5);
            resultInput.style.fontSize = `${newSize}px`;
        } else {
            resultInput.style.fontSize = `${defaultFontSize}px`;
        }

        // Scroll to the end of the input
        resultInput.scrollLeft = resultInput.scrollWidth;

        resultInput.classList.add('updated');
        setTimeout(() => resultInput.classList.remove('updated'), 100);
    }

    updateDisplay();

    // --- Event Listener --- //
    buttons.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.matches('button')) return;

        const action = target.dataset.action;
        const value = target.dataset.value;

        if (value) {
            handleInput(value);
        } else if (action) {
            handleAction(action);
        }
    });

    // --- Input Handling --- //
    function handleInput(value) {
        // Prevent multiple operators
        const lastChar = expression.slice(-1);
        if (/[+\-*/^.]/.test(lastChar) && /[+\-*/^.]/.test(value)) {
            return;
        }

        if (expression === '0' && value !== '.') {
            expression = value;
        } else {
            expression += value;
        }
        updateDisplay();
    }

    // --- Action Handling --- //
    function handleAction(action) {
        switch (action) {
            case 'clear':
                expression = '0';
                break;
            case 'calculate':
                calculate();
                break;
            case 'percent':
                applyUnaryOperator(num => num / 100);
                break;
            case 'sqrt':
                applyUnaryOperator(Math.sqrt);
                break;
            case 'pow':
                handleInput('^');
                break;
            // Memory Functions
            case 'mc':
                memory = 0;
                break;
            case 'mr':
                expression = memory.toString();
                break;
            case 'm+':
                try {
                    memory += eval(prepareExpression(expression));
                } catch {
                    // ignore if expression is not valid
                }
                break;
            case 'm-':
                try {
                    memory -= eval(prepareExpression(expression));
                } catch {
                    // ignore
                }
                break;
        }
        updateDisplay();
    }
    
    function applyUnaryOperator(operatorFunc) {
        // Tries to apply operator on the last number of the expression
        const match = expression.match(/([+\-*/^])?(\.?\d+\.?\d*)$/);
        if (match) {
            const prefix = expression.substring(0, match.index);
            const operator = match[1] || '';
            const numberStr = match[2];
            const number = parseFloat(numberStr);
            if (!isNaN(number)) {
                const result = operatorFunc(number);
                expression = prefix + operator + String(result);
            }
        } else {
            // If the expression is just a number
            try {
                const number = parseFloat(expression);
                if (!isNaN(number)) {
                    expression = String(operatorFunc(number));
                }
            } catch (e) {
                // do nothing
            }
        }
    }

    // --- Calculation --- //
    function prepareExpression(expr) {
        return expr.replace(/\^/g, '**');
    }

    function calculate() {
        try {
            // Sanitize expression to prevent security issues with eval
            const sanitizedExpression = expression.replace(/[^-()\d/*+^.]/g, '');
            const preparedExpression = prepareExpression(sanitizedExpression);
            const result = eval(preparedExpression);
            expression = String(result);
        } catch (error) {
            expression = 'Error';
        }
        updateDisplay();
    }

    // --- Keyboard Support --- //
    document.addEventListener('keydown', (event) => {
        const key = event.key;

        if (/[0-9.]/.test(key)) {
            handleInput(key);
            event.preventDefault();
        } else if (/[+\-*/]/.test(key)) {
            handleInput(key);
            event.preventDefault();
        } else if (key === '^') {
            handleInput('^');
            event.preventDefault();
        } else if (key === 'Enter' || key === '=') {
            calculate();
            event.preventDefault();
        } else if (key === 'Backspace') {
            expression = expression.slice(0, -1) || '0';
            updateDisplay();
            event.preventDefault();
        } else if (key.toLowerCase() === 'c' || key === 'Escape') {
            expression = '0';
            updateDisplay();
            event.preventDefault();
        } else if (key.toLowerCase() === '%') {
            applyUnaryOperator(num => num / 100);
            updateDisplay();
            event.preventDefault();
        }
    });
});