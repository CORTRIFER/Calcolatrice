// script.js

let display = document.getElementById('display');

function appendToDisplay(value) {
    
	// Se il display mostra "Errore", resettalo prima di aggiungere nuovi valori
    if (display.innerText === 'Errore') {
        
		display.innerText = '0';
    }
	
	// Ignora gli spazi
    if (value === ' ') return;

    const current = display.innerText;
    const lastChar = current.slice(-1);
    const operators = ['+', '-', '*', '/', '^'];
    
	const nonStartingOperators = ['*', '/', '^']; // Operatori non validi dopo singolo -

    // Caso speciale: impedisci operatori non validi dopo singolo -
    if (current === '-' && nonStartingOperators.includes(value)) {
        
		return; // Blocca l'inserimento
    }

    // Caso speciale per funzioni trigonometriche
    if (value === 'sin(' || value === 'cos(' || value === 'tan(') {
        
		if (current === '0') {
            
			display.innerText = value;
        } 
		else {
			
            display.innerText += value;
        }
		
        return;
    }
	
	// Caso speciale: Gestione specifica per ".+", ".-", ecc.
    if (lastChar === '.' && operators.includes(value)) {
        
		display.innerText += '0' + value;
        return;
    }

    // Caso speciale: se current è "-" e l'utente preme ".", trasforma in "-0."
    if (current === '-' && value === '.') {
        
		display.innerText = '-0.';
        return;
    }

    // Caso speciale: se l'ultimo carattere è un operatore e l'utente preme ".", aggiungi "0."
    if (operators.includes(lastChar) && value === '.') {
        
		display.innerText += '0.';
        return;
    }

    // Caso speciale per il punto decimale
    if (value === '.') {
        
		if (current === '0') {
            
			display.innerText = '0.';
        } 
		else {
			
            const lastNumber = current.split(/[\+\-\*\/\^\(\)]/).pop();
            
			if (!lastNumber.includes('.')) {
                
				display.innerText += value;
            }
        }
        
		return;
    }

    // Caso per operatori
    if (operators.includes(value)) {
        
		// Permette di iniziare solo con - (per numeri negativi)
        if (current === '0') {
            
			if (value === '-') {
                
				display.innerText = value;
            }
			
            return;
        }
        
        // Se l'ultimo carattere è già un operatore, sostituiscilo
        if (operators.includes(lastChar)) {
            
			display.innerText = current.slice(0, -1) + value;
        } 
		else {
			
            display.innerText += value;
        }
		
        return;
    }

    // Caso per numeri
    if (current === '0') {
        
		display.innerText = value;
    } 
	else {
		
        display.innerText += value;
    }
}

// Pulisce il display
function clearDisplay() {
    
	display.innerText = '0';
}

// Funzione calculateResult modificata
function calculateResult() {
    
	try {
		
        let expression = display.innerText;

		expression = expression.replace(/\^/g, "**");
		
        // Sostituzioni per le nuove funzioni
		expression = expression.replace(/ln\(([0-9+\-*\/^(). ]+)\)/g, 'Math.log($1)'); // log naturale
		expression = expression.replace(/log_([0-9+\-*\/^(). ]+)\((.*?)\)/g, 'Math.log($2)/Math.log($1)') // log base qualsiasi
        expression = expression.replace(/root\(([0-9+\-*\/^(). ]+),([0-9+\-*\/^(). ]+)\)/g, 'Math.pow($2,1/$1)'); // radice n-esima
		
		//expression = expression.replace(/([0-9.]+)\^([0-9.]+)/g, 'Math.pow($1,$2)'); // potenza (Gestita con radice)

        // Altre sostituzioni esistenti
        expression = expression.replace(/sin\(/g, 'Math.sin('); //In radianti
        expression = expression.replace(/cos\(/g, 'Math.cos(');
        expression = expression.replace(/tan\(/g, 'Math.tan(');

        // Gestione parentesi
        while ((expression.match(/\(/g) || []).length > (expression.match(/\)/g) || []).length) {
            
			expression += ')';
        }

        let result = eval(expression);

        if (isNaN(result) || !isFinite(result)) {
            
			throw new Error("Risultato non valido");
        }

        display.innerText = result;

    } 
	catch (error) {
        
		display.innerText = 'Errore';
        console.error("Errore nel calcolo:", error);
    }
}

// Variabile per memorizzare l'ultimo valore decimale
let lastDecimalValue = null;

// Funzione per convertire un numero decimale in frazione
function convertToFraction() {
	
	let expression = display.innerText;

    // Se l'espressione corrente è già una frazione (contiene '/'), 
    // ripristina il valore decimale precedente
    if (expression.includes('/')) {
        
		if (lastDecimalValue !== null) {
            
			display.innerText = lastDecimalValue;
            
			lastDecimalValue = null; // Resetta per il prossimo ciclo
        }
		
        return;
    }

    // Controlla se ci sono parentesi aperte non chiuse
    if (expression.includes('(') && !expression.includes(')')) {
        
		display.innerText = 'Errore';
        return;
    }

    let number = parseFloat(expression);

    if (isNaN(number)) {
        
		display.innerText = 'Errore';
        return;
    }

    // Salva il valore decimale corrente prima della conversione
    lastDecimalValue = expression;

    let gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    let sign = number < 0 ? -1 : 1;
    number = Math.abs(number);

    let denominator = 1;
    while (number % 1 !== 0) {
        
		number *= 10;
        denominator *= 10;
    }

    let numerator = number * sign;
    let commonDivisor = gcd(numerator, denominator);
    
    numerator /= commonDivisor;
    denominator /= commonDivisor;

    display.innerText = numerator + '/' + denominator;
}

function applyTrigFunction(func) {
    
	const trigSelect = document.getElementById('trig-select');
    
    if (!func) return;
    
    if (display.innerText === '0') {
        
		display.innerText = func + '(';
    } 
	else {
		
        display.innerText += func + '(';
    }
    
    // Resetta il menu dopo la selezione
    trigSelect.value = '';
}

function customLog() {
    
	let base = prompt("Inserisci la base del logaritmo (numero oppure 'e': 2.71...):");
    if (base === null) return;
    
    let number = prompt("Inserisci il numero:");
    if (number === null) return;

    if (base === "" || number === "") {
        
		display.innerText = 'Errore';
        return;
    }
	
	
	// Controllo base: solo numeri, 'e' o espressioni matematiche
    if (base !== 'e' && !/^[0-9+\-*\/^(). ]+$/.test(base)) {
        
		display.innerText = "Errore: base non valida";
        return;
    }

    // Controllo numero: solo numeri o espressioni matematiche
    if (!/^[0-9+\-*\/^(). ]+$/.test(number)) {
        
		display.innerText = "Errore: numero non valido";
        return;
    }

	
    base = base.trim().toLowerCase();

    // Gestione dello 0 iniziale
    if (display.innerText === '0') {
        
		display.innerText = '';
    }

    // Formatta l'output per il display
    if (base === 'e') {
        
		display.innerText += `ln(${number})`;  // Mostra "ln(numero)"
    } 
	else {
		
        display.innerText += `log_${base}(${number})`;  // Mostra "log_base(numero)"
    }
}

function customRoot() {
    
	let index = prompt("Inserisci l'indice della radice:");
    if (index === null) return;
    
    let number = prompt("Inserisci il numero:");
    if (number === null) return;

    if (index === "" || number === "") {
        
		display.innerText = 'Errore';
        return;
    }
	
	
	// Controllo indice: solo numeri o espressioni matematiche
    if (!/^[0-9+\-*\/^(). ]+$/.test(index)) {
        
		display.innerText = "Errore: indice non valido";
        return;
    }

    // Controllo numero: solo numeri o espressioni matematiche
    if (!/^[0-9+\-*\/^(). ]+$/.test(number)) {
        
		display.innerText = "Errore: numero non valido";
        return;
    }
	

    // Gestione dello 0 iniziale
    if (display.innerText === '0') {
        
		display.innerText = '';
    }

    display.innerText += `root(${index},${number})`;
}

function customPower() {
    
	let base = prompt("Inserisci la base:");
    if (base === null) return;
    
    let exponent = prompt("Inserisci l'esponente:");
    if (exponent === null) return;

    if (base === "" || exponent === "") {
        
		display.innerText = 'Errore';
        return;
    }
	
	
	// Controllo base e esponente: solo numeri o espressioni matematiche
    if (!/^[0-9+\-*\/^(). ]+$/.test(base) || !/^[0-9+\-*\/^(). ]+$/.test(exponent)) {
        
		display.innerText = "Errore: input non valido";
        return;
    }
	

    // Gestione dello 0 iniziale
    if (display.innerText === '0') {
        
		display.innerText = '';
    }

    display.innerText += `${base}^${exponent}`;
}


document.getElementById('trig-select').addEventListener('mousedown', function() {
    
	// Nasconde "Trg" quando il menu è aperto
    this.querySelector('option[value=""]').style.display = 'none';
});

document.getElementById('trig-select').addEventListener('change', function() {
    
	// Ripristina "Trg" quando una selezione è fatta
    this.querySelector('option[value=""]').style.display = '';
});


// Supporto per tastiera
let inputBuffer = '';

document.addEventListener('keydown', function(event) {
   
	const key = event.key;

    // Aggiungi lettere al buffer per parole chiave (es. sin, log, root)
    if (/^[a-zA-Z]$/.test(key)) {
        
		inputBuffer += key.toLowerCase();

        // Funzioni riconosciute per intero
        if (inputBuffer.endsWith('sin')) {
            
			appendToDisplay('sin(');
            inputBuffer = '';
            return;
        } 
        else if (inputBuffer.endsWith('cos')) {
            
			appendToDisplay('cos(');
            inputBuffer = '';
            return;
        } 
        else if (inputBuffer.endsWith('tan')) {
            
			appendToDisplay('tan(');
            inputBuffer = '';
            return;
        } 
        else if (inputBuffer.endsWith('ln')) {
            
			appendToDisplay('ln(');
            inputBuffer = '';
            return;
        } 
        else if (inputBuffer.endsWith('log')) {
            
			customLog();
            inputBuffer = '';
            return;
        } 
        else if (inputBuffer.endsWith('root')) {
            
			customRoot();
            inputBuffer = '';
            return;
        } 
        else if (inputBuffer.endsWith('pow')) {
            
			customPower();
            inputBuffer = '';
            return;
        }
        else if (inputBuffer.toLowerCase().endsWith('ntf')) {
            
			convertToFraction();
            inputBuffer = '';
            return;
        }
        
        // Se non è una funzione completa, non fare nulla e continua ad accumulare nel buffer
        return;
    }

    // Simboli e numeri
    if (!isNaN(key) || ['+', '-', '*', '/', '(', ')', '.', '^'].includes(key)) {
        
		appendToDisplay(key);
        inputBuffer = ''; // reset se cambia contesto
    } 
    else if (key === 'Enter' || key == '=') {
        
		event.preventDefault();
        calculateResult();
        inputBuffer = '';
    } 
    else if (key === 'Backspace') {
        
		event.preventDefault();
        const current = display.innerText;
        display.innerText = current.length > 1 ? current.slice(0, -1) : '0';
        inputBuffer = '';
    } 
    else if (key.toLowerCase() === 'c' && inputBuffer === '') {
        
		// Solo se non c'è un buffer in corso (cioè non stiamo scrivendo "cos" ecc.)
        event.preventDefault();
        clearDisplay();
        inputBuffer = '';
    }
    else if (key === 'Escape') {
        
		// Aggiunto anche ESC come alternativa per cancellare
        event.preventDefault();
        clearDisplay();
        inputBuffer = '';
    }
});


const hiddenInput = document.createElement('input');

hiddenInput.type = 'text';

hiddenInput.style.position = 'absolute';

hiddenInput.style.opacity = '0';
hiddenInput.style.height = '0';
hiddenInput.style.width = '0';

hiddenInput.style.border = 'none';

document.body.appendChild(hiddenInput);

// Gestione click sul display
display.addEventListener('click', function() {
    
	if ('ontouchstart' in window) {
        
		hiddenInput.focus();
        
        // Opzionale: imposta inputmode per tastiera completa
        hiddenInput.removeAttribute('inputmode');
    }
});

// Gestione input da tastiera
hiddenInput.addEventListener('input', function(e) {
    
	// Prendi l'ultimo carattere inserito (per gestire meglio input rapidi)
    const lastChar = this.value.slice(-1);
    
    // Se è un carattere valido, aggiungilo al display
    if (/[0-9+\-*\/^().=]/.test(lastChar)) {
        
		appendToDisplay(lastChar);
    }
    
    // Pulisci l'input nascosto
    this.value = '';
});

hiddenInput.addEventListener('keydown', function(e) {
    
	if (e.key === 'Enter') {
        
		e.preventDefault();
        calculateResult();
    } 
	else if (e.key === 'Backspace') {
        
		e.preventDefault();
        const current = display.innerText;
        display.innerText = current.length > 1 ? current.slice(0, -1) : '0';
    } 
	else if (e.key.toLowerCase() === 'c' || e.key === 'Escape') {
        
		e.preventDefault();
        clearDisplay();
    }
    
    // Previeni l'input diretto nel campo nascosto
    if (/[0-9+\-*\/^().=]/.test(e.key)) {
        
		e.preventDefault();
        appendToDisplay(e.key);
    }
});
