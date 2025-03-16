const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const statusText = document.getElementById('status');
const notesList = document.getElementById('notes-list');
const themeSwitch = document.getElementById('theme-switch');
const manualNoteInput = document.getElementById('manual-note');
const addNoteBtn = document.getElementById('add-note-btn');

let isRecording = false;
let recognition = null;
const SILENCE_DURATION = 2000; // 2 seconds of silence to end a note

// Dark/Light Mode Toggle
themeSwitch.addEventListener('change', () => {
    document.body.classList.toggle('light-mode');
});

// Add Note Manually
addNoteBtn.addEventListener('click', () => {
    const noteText = manualNoteInput.value.trim();
    if (noteText) {
        addNote(noteText);
        manualNoteInput.value = '';
    }
});

// Speech Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (!SpeechRecognition) {
    statusText.textContent = "Your browser does not support speech recognition.";
    startBtn.disabled = true;
    stopBtn.disabled = true;
} else {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let silenceTimer;
    let finalTranscript = '';

    startBtn.addEventListener('click', () => {
        recognition.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        statusText.textContent = "Recording... Say 'note' followed by your note.";
        isRecording = true;
        finalTranscript = '';
    });

    stopBtn.addEventListener('click', () => {
        recognition.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        statusText.textContent = "Recording stopped.";
        isRecording = false;
    });

    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
            if (isRecording && finalTranscript.trim()) {
                const noteText = finalTranscript.trim();
                const noteDate = extractDate(noteText);
                addNote(noteText, noteDate);
                finalTranscript = '';
            }
        }, SILENCE_DURATION);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        statusText.textContent = "Error: " + event.error;
        startBtn.disabled = false;
        stopBtn.disabled = true;
    };

    recognition.onend = () => {
        if (isRecording) {
            statusText.textContent = "Recording stopped.";
        }
        startBtn.disabled = false;
        stopBtn.disabled = true;
    };
}

// Add a note to the list
function addNote(text, date) {
    const noteElement = document.createElement('div');
    noteElement.classList.add('note');

    const noteDateElement = document.createElement('div');
    noteDateElement.classList.add('note-date');
    noteDateElement.textContent = date || new Date().toLocaleString();

    const noteTextElement = document.createElement('div');
    noteTextElement.classList.add('note-text');
    noteTextElement.textContent = text;

    const noteActions = document.createElement('div');
    noteActions.classList.add('note-actions');

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => {
        const newText = prompt('Edit your note:', text);
        if (newText !== null) {
            noteTextElement.textContent = newText;
        }
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
        notesList.removeChild(noteElement);
    });

    noteActions.appendChild(editButton);
    noteActions.appendChild(deleteButton);

    noteElement.appendChild(noteDateElement);
    noteElement.appendChild(noteTextElement);
    noteElement.appendChild(noteActions);
    notesList.appendChild(noteElement);

    notesList.scrollTop = notesList.scrollHeight;
}

// Extract date from note text
function extractDate(text) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (const day of days) {
        if (text.toLowerCase().includes(day)) {
            return `Upcoming ${day.charAt(0).toUpperCase() + day.slice(1)}`;
        }
    }
    return null;
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.altKey && event.key.toLowerCase() === 'n') {
        if (!isRecording) {
            recognition.start();
            startBtn.disabled = true;
            stopBtn.disabled = false;
            statusText.textContent = "Recording... Say 'note' followed by your note.";
            isRecording = true;
        }
    }

    if (event.altKey && event.key.toLowerCase() === 's') {
        if (isRecording) {
            recognition.stop();
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusText.textContent = "Recording stopped.";
            isRecording = false;
        }
    }
});