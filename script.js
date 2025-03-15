document.addEventListener('DOMContentLoaded', () => {
    const historyDisplay = document.getElementById('history');
    const expressionDisplay = document.getElementById('expression');
    const resultDisplay = document.getElementById('result');
    const buttons = document.querySelectorAll('.calc-btn:not(#functions-button)');
    const functionsButton = document.getElementById('functions-button');
    const scientificFunctionsWrapper = document.getElementById('scientific-functions-wrapper');

    let expression = '';
    let result = '0';
    let memory = 0;
    let history = [];
    let isScientificExpanded = false;

    // Toggle Scientific Functions
    functionsButton.addEventListener('click', (e) => {
        e.preventDefault();
        isScientificExpanded = !isScientificExpanded;
        scientificFunctionsWrapper.classList.toggle('expanded', isScientificExpanded);
        console.log('Toggle clicked, expanded:', isScientificExpanded);
    });

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const value = button.getAttribute('data-value');

            if (button.classList.contains('number')) {
                handleNumber(value);
            } else if (button.classList.contains('operator')) {
                handleOperator(value);
            } else if (button.classList.contains('func')) {
                handleFunction(value);
            } else if (button.classList.contains('memory')) {
                handleMemory(value);
            }

            updateDisplay();
            if (value === '=' || value === 'DEL') evaluateExpression();
        });
    });

    function handleNumber(value) {
        if (expression === '0') {
            expression = value;
        } else {
            expression += value;
        }
    }

    function handleOperator(value) {
        if (value === 'C') {
            expression = '';
            result = '0';
        } else if (value === '+/-') {
            if (expression) {
                const lastNumberMatch = expression.match(/-?\d*\.?\d*$/);
                if (lastNumberMatch) {
                    const lastNumber = lastNumberMatch[0];
                    const newNumber = lastNumber.startsWith('-') ? lastNumber.slice(1) : '-' + lastNumber;
                    expression = expression.replace(/(-?\d*\.?\d*)$/, newNumber);
                } else {
                    expression = '-' + expression;
                }
            }
        } else if (value === '%' && expression) {
            try {
                const num = evaluateSimpleExpression(expression);
                result = (num / 100).toFixed(6).toString();
                expression = result;
                history.push(`${num} % = ${result}`);
                if (history.length > 5) history.shift();
            } catch (e) {
                result = 'Error';
            }
        } else if (value === '=') {
            evaluateExpression();
        } else if (value === 'DEL') {
            expression = expression.trim();
            if (expression) {
                const lastChar = expression.slice(-1);
                if (lastChar === ' ') {
                    expression = expression.slice(0, -3); // Remove operator and spaces
                } else {
                    expression = expression.slice(0, -1); // Remove last character
                }
                if (!expression) expression = '0';
            }
        } else if (value === '(' || value === ')') {
            if (expression === '0') {
                expression = value;
            } else {
                expression += value;
            }
        } else {
            if (expression === '0') {
                expression = '';
            }
            expression += ` ${value} `;
        }
    }

    function handleFunction(value) {
        const lastChar = expression.trim().slice(-1);
        const isOperatorOrParen = ['+', '-', '*', '/', '^', '('].includes(lastChar);

        // For functions that take an argument (e.g., sin, cos)
        if (['sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh', 'ln', 'log', '1/x', 'e^x', '10^x', 'x^2', 'sqrt', 'n!'].includes(value)) {
            if (expression === '0') {
                expression = `${value}(`;
            } else if (isOperatorOrParen) {
                expression += `${value}(`;
            } else {
                expression += ` ${value}(`;
            }
        } else {
            // For constants (e.g., pi, e)
            if (expression === '0') {
                expression = value;
            } else if (isOperatorOrParen) {
                expression += value;
            } else {
                expression += ` ${value}`;
            }
        }
    }

    function handleMemory(value) {
        if (expression && expression !== '0') {
            evaluateExpression();
        }
        const num = parseFloat(result) || 0;

        switch (value) {
            case 'MC':
                memory = 0;
                console.log('Memory cleared:', memory);
                break;
            case 'MR':
                expression = memory.toString();
                result = memory.toString();
                console.log('Memory recalled:', memory);
                break;
            case 'M+':
                memory += num;
                console.log('Memory after M+:', memory);
                break;
            case 'M-':
                memory -= num;
                console.log('Memory after M-:', memory);
                break;
        }
    }

    function factorial(n) {
        if (n === 0 || n === 1) return 1;
        return n * factorial(n - 1);
    }

    function evaluateSimpleExpression(exp) {
        try {
            let cleaned = exp.replace(/pi/g, Math.PI.toString())
                            .replace(/e/g, Math.E.toString())
                            .replace(/\^/g, '**');

            // Replace functions with their JavaScript equivalents
            cleaned = cleaned.replace(/sin\(([^)]+)\)/g, (_, arg) => `Math.sin((${arg}) * Math.PI / 180)`)
                            .replace(/cos\(([^)]+)\)/g, (_, arg) => `Math.cos((${arg}) * Math.PI / 180)`)
                            .replace(/tan\(([^)]+)\)/g, (_, arg) => `Math.tan((${arg}) * Math.PI / 180)`)
                            .replace(/sec\(([^)]+)\)/g, (_, arg) => `1/Math.cos((${arg}) * Math.PI / 180)`)
                            .replace(/csc\(([^)]+)\)/g, (_, arg) => `1/Math.sin((${arg}) * Math.PI / 180)`)
                            .replace(/cot\(([^)]+)\)/g, (_, arg) => `1/Math.tan((${arg}) * Math.PI / 180)`)
                            .replace(/asin\(([^)]+)\)/g, (_, arg) => `(Math.asin(${arg}) * 180 / Math.PI)`)
                            .replace(/acos\(([^)]+)\)/g, (_, arg) => `(Math.acos(${arg}) * 180 / Math.PI)`)
                            .replace(/atan\(([^)]+)\)/g, (_, arg) => `(Math.atan(${arg}) * 180 / Math.PI)`)
                            .replace(/sinh\(([^)]+)\)/g, (_, arg) => `Math.sinh(${arg})`)
                            .replace(/cosh\(([^)]+)\)/g, (_, arg) => `Math.cosh(${arg})`)
                            .replace(/tanh\(([^)]+)\)/g, (_, arg) => `Math.tanh(${arg})`)
                            .replace(/ln\(([^)]+)\)/g, (_, arg) => `Math.log(${arg})`)
                            .replace(/log\(([^)]+)\)/g, (_, arg) => `Math.log10(${arg})`)
                            .replace(/1\/x\(([^)]+)\)/g, (_, arg) => `1/(${arg})`)
                            .replace(/x\^y\(([^)]+)\)/g, (_, arg) => `Math.pow(${arg})`)
                            .replace(/y\^x\(([^)]+)\)/g, (_, arg) => `Math.pow(${arg})`)
                            .replace(/e\^x\(([^)]+)\)/g, (_, arg) => `Math.exp(${arg})`)
                            .replace(/10\^x\(([^)]+)\)/g, (_, arg) => `Math.pow(10, ${arg})`)
                            .replace(/x\^2\(([^)]+)\)/g, (_, arg) => `Math.pow(${arg}, 2)`)
                            .replace(/sqrt\(([^)]+)\)/g, (_, arg) => `Math.sqrt(${arg})`)
                            .replace(/n!\(([^)]+)\)/g, (_, arg) => `factorial(${arg})`);

            return Function('factorial', `'use strict';return (${cleaned})`)(factorial);
        } catch (e) {
            throw new Error('Invalid Expression');
        }
    }

    function evaluateExpression() {
        if (!expression || expression === '0') return;
        try {
            const cleaned = expression.replace(/\^/g, '**')
                                    .replace(/pi/g, Math.PI.toString())
                                    .replace(/e/g, Math.E.toString());

            // Replace functions with their JavaScript equivalents
            const evaluated = cleaned.replace(/sin\(([^)]+)\)/g, (_, arg) => `Math.sin((${arg}) * Math.PI / 180)`)
                                    .replace(/cos\(([^)]+)\)/g, (_, arg) => `Math.cos((${arg}) * Math.PI / 180)`)
                                    .replace(/tan\(([^)]+)\)/g, (_, arg) => `Math.tan((${arg}) * Math.PI / 180)`)
                                    .replace(/sec\(([^)]+)\)/g, (_, arg) => `1/Math.cos((${arg}) * Math.PI / 180)`)
                                    .replace(/csc\(([^)]+)\)/g, (_, arg) => `1/Math.sin((${arg}) * Math.PI / 180)`)
                                    .replace(/cot\(([^)]+)\)/g, (_, arg) => `1/Math.tan((${arg}) * Math.PI / 180)`)
                                    .replace(/asin\(([^)]+)\)/g, (_, arg) => `(Math.asin(${arg}) * 180 / Math.PI)`)
                                    .replace(/acos\(([^)]+)\)/g, (_, arg) => `(Math.acos(${arg}) * 180 / Math.PI)`)
                                    .replace(/atan\(([^)]+)\)/g, (_, arg) => `(Math.atan(${arg}) * 180 / Math.PI)`)
                                    .replace(/sinh\(([^)]+)\)/g, (_, arg) => `Math.sinh(${arg})`)
                                    .replace(/cosh\(([^)]+)\)/g, (_, arg) => `Math.cosh(${arg})`)
                                    .replace(/tanh\(([^)]+)\)/g, (_, arg) => `Math.tanh(${arg})`)
                                    .replace(/ln\(([^)]+)\)/g, (_, arg) => `Math.log(${arg})`)
                                    .replace(/log\(([^)]+)\)/g, (_, arg) => `Math.log10(${arg})`)
                                    .replace(/1\/x\(([^)]+)\)/g, (_, arg) => `1/(${arg})`)
                                    .replace(/x\^y\(([^)]+)\)/g, (_, arg) => `Math.pow(${arg})`)
                                    .replace(/y\^x\(([^)]+)\)/g, (_, arg) => `Math.pow(${arg})`)
                                    .replace(/e\^x\(([^)]+)\)/g, (_, arg) => `Math.exp(${arg})`)
                                    .replace(/10\^x\(([^)]+)\)/g, (_, arg) => `Math.pow(10, ${arg})`)
                                    .replace(/x\^2\(([^)]+)\)/g, (_, arg) => `Math.pow(${arg}, 2)`)
                                    .replace(/sqrt\(([^)]+)\)/g, (_, arg) => `Math.sqrt(${arg})`)
                                    .replace(/n!\(([^)]+)\)/g, (_, arg) => `factorial(${arg})`);

            result = Function('factorial', `'use strict';return (${evaluated})`)(factorial).toFixed(6).toString();
            history.push(`${expression} = ${result}`);
            if (history.length > 5) history.shift();
            expression = result;
        } catch (e) {
            result = 'Error';
        }
    }

    function updateDisplay() {
        historyDisplay.textContent = history.join(' | ');
        expressionDisplay.textContent = expression || '0';
        resultDisplay.textContent = result;
    }
});
