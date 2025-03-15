document.addEventListener('DOMContentLoaded', () => {
    const historyDisplay = document.getElementById('history');
    const expressionDisplay = document.getElementById('expression');
    const resultDisplay = document.getElementById('result');
    const buttons = document.querySelectorAll('.calc-btn');

    let expression = '';
    let result = '0';
    let memory = 0;
    let history = [];

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
        } else {
            if (expression === '0') {
                expression = '';
            }
            expression += ` ${value} `;
        }
    }

    function handleFunction(value) {
        // Evaluate the current expression to get the latest result
        if (expression && expression !== '0') {
            evaluateExpression();
        }

        const num = expression && expression !== '0' ? parseFloat(result) : 0;
        let funcResult = null;

        switch (value) {
            case 'ln': funcResult = num > 0 ? Math.log(num).toFixed(6) : 'Error'; break;
            case '1/x': funcResult = num !== 0 ? (1 / num).toFixed(6) : 'Error'; break;
            case 'x^y': expression = result !== '0' ? `${result} ^ ` : '0 ^ '; return;
            case 'log': funcResult = num > 0 ? Math.log10(num).toFixed(6) : 'Error'; break;
            case 'e^x': funcResult = Math.exp(num).toFixed(6); break;
            case 'sec': funcResult = num !== 0 ? (1 / Math.cos(num * Math.PI / 180)).toFixed(6) : 'Error'; break;
            case 'acos': funcResult = Math.abs(num) <= 1 ? (Math.acos(num) * 180 / Math.PI).toFixed(6) : 'Error'; break;
            case 'y^x': expression = result !== '0' ? `${result} ^ ` : '0 ^ '; return;
            case '10^x': funcResult = Math.pow(10, num).toFixed(6); break;
            case 'x^2': funcResult = Math.pow(num, 2).toFixed(6); break;
            case 'csc': funcResult = num !== 0 ? (1 / Math.sin(num * Math.PI / 180)).toFixed(6) : 'Error'; break;
            case 'n!': funcResult = num >= 0 && Number.isInteger(num) && num <= 170 ? factorial(num).toString() : 'Error'; break;
            case 'pi': expression = Math.PI.toFixed(6); return;
            case 'cos': funcResult = Math.cos(num * Math.PI / 180).toFixed(6); break;
            case 'cosh': funcResult = Math.cosh(num).toFixed(6); break;
            case 'tanh': funcResult = Math.tanh(num).toFixed(6); break;
            case 'sqrt': funcResult = num >= 0 ? Math.sqrt(num).toFixed(6) : 'Error'; break;
            case 'sinh': funcResult = Math.sinh(num).toFixed(6); break;
            case 'asin': funcResult = Math.abs(num) <= 1 ? (Math.asin(num) * 180 / Math.PI).toFixed(6) : 'Error'; break;
            case 'atan': funcResult = (Math.atan(num) * 180 / Math.PI).toFixed(6); break;
            case 'cot': funcResult = num !== 0 ? (1 / Math.tan(num * Math.PI / 180)).toFixed(6) : 'Error'; break;
            case 'sin': funcResult = Math.sin(num * Math.PI / 180).toFixed(6); break;
            case 'tan': funcResult = Math.abs(num % 180 - 90) < 1e-10 ? 'Error' : Math.tan(num * Math.PI / 180).toFixed(6); break;
            case 'e':
                if (expression === '0') {
                    expression = Math.E.toFixed(6);
                } else {
                    expression += ` ${Math.E.toFixed(6)} `;
                }
                return; // Don't evaluate immediately, let the user build the expression
        }

        if (funcResult !== null) {
            expression = `${value}(${num})`;
            result = funcResult;
            history.push(`${expression} = ${result}`);
            if (history.length > 5) history.shift();
            expression = result;
        }
    }

    function handleMemory(value) {
        // Ensure the current expression is evaluated to get the latest result
        if (expression && expression !== '0') {
            evaluateExpression();
        }
        const num = parseFloat(result) || 0; // Use the latest result

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
            const cleaned = exp.replace(/\^/g, '**');
            return Function(`'use strict';return (${cleaned})`)();
        } catch (e) {
            throw new Error('Invalid Expression');
        }
    }

    function evaluateExpression() {
        if (!expression || expression === '0') return;
        try {
            const cleaned = expression.replace(/\^/g, '**')
                                     .replace(/ln\(([^)]+)\)/g, 'Math.log($1)')
                                     .replace(/1\/x\(([^)]+)\)/g, '1/($1)')
                                     .replace(/x\^y\(([^)]+)\)/g, 'Math.pow($1)')
                                     .replace(/log\(([^)]+)\)/g, 'Math.log10($1)')
                                     .replace(/e\^x\(([^)]+)\)/g, 'Math.exp($1)')
                                     .replace(/sec\(([^)]+)\)/g, '1/Math.cos($1 * Math.PI / 180)')
                                     .replace(/acos\(([^)]+)\)/g, 'Math.acos($1) * 180 / Math.PI')
                                     .replace(/y\^x\(([^)]+)\)/g, 'Math.pow($1)')
                                     .replace(/10\^x\(([^)]+)\)/g, 'Math.pow(10, $1)')
                                     .replace(/x\^2\(([^)]+)\)/g, 'Math.pow($1, 2)')
                                     .replace(/csc\(([^)]+)\)/g, '1/Math.sin($1 * Math.PI / 180)')
                                     .replace(/n!\(([^)]+)\)/g, 'factorial($1)')
                                     .replace(/cos\(([^)]+)\)/g, 'Math.cos($1 * Math.PI / 180)')
                                     .replace(/cosh\(([^)]+)\)/g, 'Math.cosh($1)')
                                     .replace(/tanh\(([^)]+)\)/g, 'Math.tanh($1)')
                                     .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
                                     .replace(/sinh\(([^)]+)\)/g, 'Math.sinh($1)')
                                     .replace(/asin\(([^)]+)\)/g, 'Math.asin($1) * 180 / Math.PI')
                                     .replace(/atan\(([^)]+)\)/g, 'Math.atan($1) * 180 / Math.PI')
                                     .replace(/cot\(([^)]+)\)/g, '1/Math.tan($1 * Math.PI / 180)')
                                     .replace(/sin\(([^)]+)\)/g, 'Math.sin($1 * Math.PI / 180)')
                                     .replace(/tan\(([^)]+)\)/g, 'Math.tan($1 * Math.PI / 180)');
            result = Function('factorial', `'use strict';return (${cleaned})`)(factorial).toFixed(6).toString();
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