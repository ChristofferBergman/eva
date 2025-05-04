// Hårdkodat ord
const word = "SNYGGE STOFFE";
let guessedLetters = [];
let correctGuesses = [];
let incorrectGuesses = 0;
const maxAttempts = 6;

const win = `
Vi sa att vi skulle vänta med firande av dig till Rasmus var hemma igen. Och det är han nu…
\r\n
Den 28’e augusti vid tretiden blir du hämtad i Hägggenäs för en färd norrut. Där skall det firas att du fyllt 75, men även en form av 40-årsjubileum. Med strömmens former och ledare, djupa och vilande färger, samt osannolika farkoster. Allt detta till skenet av stearinljus. När solens sista strålar försvunnit bakom horisonten beges det av hemåt och du återvänder till Häggenäs ca två (timmar) i midnatt.
`

// Funktion för att rita hänggubben på canvasen
function drawHangman() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Rensa canvasen

    // Hänggubbe steg baserat på antal fel
    if (incorrectGuesses >= 1) {
        // Bas
        ctx.beginPath();
        ctx.moveTo(20, 180);
        ctx.lineTo(60, 180);
        ctx.moveTo(40, 20);
        ctx.lineTo(40, 180);
        ctx.stroke();
    }
    if (incorrectGuesses >= 2) {
        // Galge
        ctx.beginPath();
        ctx.moveTo(40, 20);
        ctx.lineTo(150, 20);
        ctx.lineTo(150, 45);
        ctx.moveTo(40, 60);
        ctx.lineTo(80, 20);
        ctx.stroke();
    }
    if (incorrectGuesses >= 3) {
        // Huvud
        ctx.beginPath();
        ctx.arc(150, 60, 15, 0, Math.PI * 2, true);
        ctx.stroke();
    }
    if (incorrectGuesses >= 4) {
        // Kropp
        ctx.beginPath();
        ctx.moveTo(150, 75);
        ctx.lineTo(150, 130);
        ctx.stroke();
    }
    if (incorrectGuesses >= 5) {
        // Ben (vänster)
        ctx.beginPath();
        ctx.moveTo(150, 130);
        ctx.lineTo(130, 160);
        // Ben (höger)
        ctx.moveTo(150, 130);
        ctx.lineTo(170, 160);
        ctx.stroke();
    }
    if (incorrectGuesses >= 6) {
        // Arm (höger)
        ctx.beginPath();
        ctx.moveTo(150, 90);
        ctx.lineTo(170, 110);
        // Arm (vänster)
        ctx.moveTo(150, 90);
        ctx.lineTo(120, 110);
        ctx.stroke();
    }
}

// Funktion för att visa ordet
function displayWord() {
    const wordElement = document.getElementById('word');
    wordElement.innerHTML = '';
    
    // För varje bokstav i ordet, visa den om den är gissad korrekt
    for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        const span = document.createElement('span');
        
        if (letter === ' ') {
            span.textContent = ' ';
            span.classList.add('correct');  // Lägg till rätt klass för mellanslag
        } else if (correctGuesses.includes(letter)) {
            span.textContent = letter;
            span.classList.add('correct');
        } else {
            span.textContent = '_';
            span.classList.add('hidden');
        }
        
        wordElement.appendChild(span);
    }
}

// Funktion för att inaktivera eller aktivera gissningsknappen
function toggleGuessButton(isDisabled) {
    const guessButton = document.querySelector('button');
    guessButton.disabled = isDisabled;
}

// Funktion för att gissa bokstav
function guessLetter() {
    // Om spelet redan är över, gör inget
    if (incorrectGuesses >= maxAttempts || correctGuesses.length === new Set(word.replace(/\s/g, '')).size) {
        return;
    }

    const letterInput = document.getElementById('letter-input');
    const guessedLetter = letterInput.value.toUpperCase();

    // Kontrollera om det är en giltig bokstav och inte redan gissad
    if (guessedLetter && !guessedLetters.includes(guessedLetter) && guessedLetter !== ' ') {
        guessedLetters.push(guessedLetter);

        // Kontrollera om bokstaven finns i ordet
        if (word.includes(guessedLetter)) {
            correctGuesses.push(guessedLetter);
        } else {
            incorrectGuesses++;
        }
        
        // Uppdatera spelstatus
        displayWord();
        drawHangman();

        // Visa meddelande om spelet är slut
        if (incorrectGuesses >= maxAttempts) {
            document.getElementById('message').textContent = 'Du förlorade! Tryck Starta om spelet för att försöka igen.'
            toggleGuessButton(true); // Inaktivera knappen
        } else if (correctGuesses.length === new Set(word.replace(/\s/g, '')).size) {
            document.getElementById('message').textContent = `Grattis, du gissade rätt!\r\n
Här är din födelsedagspresent:\r\n
` + win;
            toggleGuessButton(true); // Inaktivera knappen
        } else {
            document.getElementById('message').textContent = '';
        }

        // Uppdatera listan med gissade bokstäver
        document.getElementById('guessed-letters').textContent = 'Gissade bokstäver: ' + guessedLetters.join(', ');
    }

    // Rensa inputfältet
    letterInput.value = '';
    letterInput.focus();
}

// Funktion för att återställa spelet
function resetGame() {
    guessedLetters = [];
    correctGuesses = [];
    incorrectGuesses = 0;
    document.getElementById('message').textContent = '';
    displayWord();
    drawHangman();
    toggleGuessButton(false); // Återaktivera knappen
}

// Initialisera spelet
displayWord();
drawHangman();
