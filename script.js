// Notes array to hold all notes (persisted in localStorage)
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// DOM elements
const noteForm = document.getElementById('note-form');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const notesContainer = document.getElementById('notes-container');

// Function to save notes to localStorage
function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
}

// Function to render all notes
function renderNotes() {
    notesContainer.innerHTML = ''; // Clear container
    notes.forEach(note => {
        const noteCard = document.createElement('div');
        noteCard.className = 'note-card';
        noteCard.innerHTML = `
            <div class="note-title" contenteditable="false">${note.title}</div>
            <div class="note-content" contenteditable="false">${note.content}</div>
            <div class="todo-section">
                <div class="todo-input">
                    <input type="text" placeholder="Add to-do" class="todo-add-input">
                    <button class="add-todo-btn">Add</button>
                </div>
                <ul class="todo-list">
                    ${note.todos.map(todo => `
                        <li class="todo-item" data-todo-id="${todo.id}">
                            <input type="checkbox" ${todo.done ? 'checked' : ''}>
                            <span class="todo-text ${todo.done ? 'done' : ''}">${todo.text}</span>
                            <button class="todo-delete">&times;</button>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <button class="note-delete">Delete Note</button>
        `;
        notesContainer.appendChild(noteCard);

        // Attach event listeners for this note
        attachNoteEvents(noteCard, note.id);
    });
}

// Function to attach events to a note card
function attachNoteEvents(card, noteId) {
    const noteTitleEl = card.querySelector('.note-title');
    const noteContentEl = card.querySelector('.note-content');

    // Double-click to edit title
    noteTitleEl.addEventListener('dblclick', () => {
        noteTitleEl.contentEditable = 'true';
        noteTitleEl.focus();
    });

    // Double-click to edit content
    noteContentEl.addEventListener('dblclick', () => {
        noteContentEl.contentEditable = 'true';
        noteContentEl.focus();
    });

    // Save edits on blur (clicking away) or Enter key
    [noteTitleEl, noteContentEl].forEach(el => {
        el.addEventListener('blur', () => {
            el.contentEditable = 'false';
            const note = notes.find(n => n.id === noteId);
            if (el.classList.contains('note-title')) {
                note.title = el.textContent.trim();
            } else {
                note.content = el.textContent.trim();
            }
            saveNotes();
        });

        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                el.blur(); // Trigger save
            }
        });
    });

    // Add to-do
    const addTodoBtn = card.querySelector('.add-todo-btn');
    const todoInput = card.querySelector('.todo-add-input');
    addTodoBtn.addEventListener('click', () => {
        addTodoItem(todoInput, noteId);
    });

    // Press Enter to add to-do
    todoInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTodoItem(todoInput, noteId);
        }
    });

    // Toggle to-do done state
    card.querySelectorAll('.todo-item input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const todoId = parseInt(e.target.closest('.todo-item').dataset.todoId);
            const note = notes.find(n => n.id === noteId);
            const todo = note.todos.find(t => t.id === todoId);
            todo.done = e.target.checked;
            saveNotes();
            renderNotes();
        });
    });

    // Delete to-do
    card.querySelectorAll('.todo-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const todoId = parseInt(e.target.closest('.todo-item').dataset.todoId);
            const note = notes.find(n => n.id === noteId);
            note.todos = note.todos.filter(t => t.id !== todoId);
            saveNotes();
            renderNotes();
        });
    });

    // Delete note with confirmation
    const deleteBtn = card.querySelector('.note-delete');
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this note?')) {
            notes = notes.filter(n => n.id !== noteId);
            saveNotes();
            renderNotes();
        }
    });
}

// Helper function to add a to-do item
function addTodoItem(todoInput, noteId) {
    const text = todoInput.value.trim();
    if (text) {
        const note = notes.find(n => n.id === noteId);
        const newTodo = { id: Date.now(), text, done: false };
        note.todos.push(newTodo);
        saveNotes();
        renderNotes();
    }
}

// Event listener for adding a new note
noteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = noteTitle.value.trim();
    const content = noteContent.value.trim();
    if (title || content) {
        const newNote = {
            id: Date.now(),
            title,
            content,
            todos: []
        };
        notes.push(newNote);
        saveNotes();
        renderNotes();
        noteForm.reset(); // Clear form
    }
});

// Initial render on page load
renderNotes();


