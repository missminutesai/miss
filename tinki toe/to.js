// Clock
function updateClock() {
    const clockElement = document.getElementById('clock');
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    clockElement.textContent = timeString;
  }
  setInterval(updateClock, 1000);
  
  // Task List Logic
  const todoForm = document.getElementById('todo-form');
  const todoList = document.getElementById('todo-list');
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  
  function renderTasks() {
    todoList.innerHTML = '';
    const now = new Date();
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.textContent = `${task.text} - ${task.time}`;
      if (new Date(`1970-01-01T${task.time}:00`) < now && !task.completed) {
        li.classList.add('overdue');
      }
  
      const controls = document.createElement('div');
      controls.className = 'task-controls';
  
      // Complete Button
      const completeBtn = document.createElement('button');
      completeBtn.textContent = task.completed ? 'Undo' : 'Complete';
      completeBtn.addEventListener('click', () => {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
      });
  
      // Delete Button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
      });
  
      controls.appendChild(completeBtn);
      controls.appendChild(deleteBtn);
      li.appendChild(controls);
      todoList.appendChild(li);
    });
  }
  
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  
  todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskInput = document.getElementById('task-input');
    const taskTime = document.getElementById('task-time');
    tasks.push({ text: taskInput.value, time: taskTime.value, completed: false });
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskTime.value = '';
  });
  renderTasks();
  
  // Timer Logic
  const timerDisplay = document.getElementById('timer-display');
  const startTimerButton = document.getElementById('start-timer');
  const resetTimerButton = document.getElementById('reset-timer');
  const alarmSound = document.getElementById('alarm-sound');
  let timerInterval, timeLeft = parseInt(localStorage.getItem('timerTimeLeft')) || 0;
  
  function updateTimerDisplay(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    localStorage.setItem('timerTimeLeft', seconds);
  }
  
  function startCountdown(seconds) {
    clearInterval(timerInterval);
    updateTimerDisplay(seconds);
    timerInterval = setInterval(() => {
      if (seconds <= 0) {
        clearInterval(timerInterval);
        alarmSound.play();
      } else {
        seconds--;
        updateTimerDisplay(seconds);
      }
    }, 1000);
  }
  
  if (timeLeft > 0) startCountdown(timeLeft);
  
  startTimerButton.addEventListener('click', () => {
    const minutesInput = document.getElementById('timer-minutes');
    timeLeft = parseInt(minutesInput.value) * 60;
    startCountdown(timeLeft);
  });
  
  resetTimerButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    timeLeft = 0;
    updateTimerDisplay(0);
    localStorage.removeItem('timerTimeLeft');
  });
  
  // Notepads Logic
  const notepadContainer = document.getElementById('notepad-container');
  const addNotepadButton = document.getElementById('add-notepad-button');
  let notepadIdCounter = 0;
  const savedNotepads = JSON.parse(localStorage.getItem('notepads')) || [];
  savedNotepads.forEach((notepad) => createNotepad(notepad.id, notepad.content, notepad.position, notepad.size));
  
  addNotepadButton.addEventListener('click', () => {
    createNotepad(`notepad-${notepadIdCounter++}`, '', { left: '50%', top: '50%' }, { width: '300px', height: '200px' });
    saveNotepads();
  });
  
  function createNotepad(id, content = '', position = { left: '50%', top: '50%' }, size = { width: '300px', height: '200px' }) {
    const notepad = document.createElement('div');
    notepad.className = 'notepad';
    notepad.id = id;
  
    // Add Close Button
    const closeButton = document.createElement('button');
    closeButton.textContent = 'X';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '5px';
    closeButton.style.right = '5px';
    closeButton.style.background = '#FF4500';
    closeButton.style.color = '#fff';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '50%';
    closeButton.style.width = '25px';
    closeButton.style.height = '25px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
      notepad.remove();
      saveNotepads();
    });
  
    notepad.appendChild(closeButton);
  
    // Add Content Area
    const contentArea = document.createElement('div');
    contentArea.contentEditable = 'true';
    contentArea.style.marginTop = '30px'; // Prevent overlap with the close button
    contentArea.style.height = 'calc(100% - 30px)';
    contentArea.style.overflow = 'auto';
    contentArea.innerHTML = content;
    contentArea.addEventListener('input', saveNotepads);
    notepad.appendChild(contentArea);
  
    notepad.style.left = position.left;
    notepad.style.top = position.top;
    notepad.style.width = size.width;
    notepad.style.height = size.height;
  
    let isDragging = false, offsetX, offsetY;
    notepad.addEventListener('mousedown', (e) => {
      if (e.target === closeButton) return; // Prevent dragging when clicking the close button
      isDragging = true;
      offsetX = e.clientX - notepad.offsetLeft;
      offsetY = e.clientY - notepad.offsetTop;
    });
  
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        notepad.style.left = `${e.clientX - offsetX}px`;
        notepad.style.top = `${e.clientY - offsetY}px`;
      }
    });
  
    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        saveNotepads();
      }
    });
  
    notepadContainer.appendChild(notepad);
  }
  
  function saveNotepads() {
    const notepads = Array.from(document.querySelectorAll('.notepad')).map((notepad) => {
      const contentArea = notepad.querySelector('div[contenteditable="true"]');
      return {
        id: notepad.id,
        content: contentArea.innerHTML,
        position: { left: notepad.style.left, top: notepad.style.top },
        size: { width: notepad.style.width, height: notepad.style.height },
      };
    });
    localStorage.setItem('notepads', JSON.stringify(notepads));
  }