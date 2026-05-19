(function() {
    function getCoursesFromHome() {
        const stored = localStorage.getItem('scheduleData');
        if (stored) {
            try { 
                const parsed = JSON.parse(stored);
                if (!Array.isArray(parsed)) {
                    return Object.keys(parsed); 
                }
                return [...new Set(parsed.map(c => c.name))];
            } catch (e) { return []; }
        }
        return [];
    }

    function populateCourseSelector() {
        const courseSelect = document.getElementById('todo-course');
        if (!courseSelect) return;
        
        courseSelect.innerHTML = '';
        const courses = getCoursesFromHome();
        
        courses.forEach(c => {
            const o = document.createElement('option');
            o.value = c;
            o.textContent = c;
            courseSelect.appendChild(o);
        });
        
        const genOpt = document.createElement('option');
        genOpt.value = 'General';
        genOpt.textContent = 'General';
        courseSelect.appendChild(genOpt);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', populateCourseSelector);
    } else {
        populateCourseSelector();
    }

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) populateCourseSelector();
    });

    let todos = [];
    let todoIdCounter = 1;
    let activeFilter = 'all';

    function formatDue(d) {
        if (!d) return '';
        const [y, m, day] = d.split('-');
        return `${m}/${day}/${y}`;
    }

    function updateCounters() {
        const totalEl = document.getElementById('total-counter');
        if (!totalEl) return; 

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        totalEl.textContent = todos.filter(t => !t.done).length;
        document.getElementById('completed-counter').textContent = todos.filter(t => t.done).length;
        document.getElementById('missed-counter').textContent = todos.filter(t => {
            if (t.done || !t.due) return false;
            return new Date(t.due) < today;
        }).length;
    }

    function renderTodos() {
        const list = document.getElementById('todo-list');
        if (!list) return; 

        let filtered = todos.filter(t => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'pending') return !t.done;
            return t.priority === activeFilter;
        });

        list.innerHTML = '';
        if (!filtered.length) {
            list.innerHTML = '<div style="text-align:center;color:#5a8a6a;font-size:15px;padding:20px">No tasks here.</div>';
            updateCounters();
            return;
        }

        filtered.forEach(t => {
            const el = document.createElement('div');
            el.className = `todo-item ${t.priority}`;
            el.innerHTML = `
                <div class="todo-check ${t.done ? 'done' : ''}" onclick="toggleTodo(${t.id})"></div>
                <div class="todo-info">
                    <span class="todo-text ${t.done ? 'done' : ''}">${t.text}</span>
                    <div class="todo-meta">
                        <span class="todo-badge badge-${t.priority}">${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}</span>
                        <span class="todo-badge badge-course">${t.course}</span>
                        ${t.due ? `<span class="todo-badge badge-due">📅 ${formatDue(t.due)}</span>` : ''}
                    </div>
                </div>
                <button class="todo-delete" onclick="deleteTodo(${t.id})" title="Delete task">✕</button>`;
            list.appendChild(el);
        });
        updateCounters();
    }

    renderTodos();

    window.addTodo = function() {
        const text = document.getElementById('todo-text').value.trim();
        if (!text) return;
        todos.unshift({
            id: todoIdCounter++,
            text,
            priority: document.getElementById('todo-priority').value,
            course: document.getElementById('todo-course').value,
            due: document.getElementById('todo-due').value,
            done: false,
        });
        document.getElementById('todo-text').value = '';
        document.getElementById('todo-due').value = '';
        renderTodos();
    };

    window.toggleTodo = function(id) {
        const t = todos.find(x => x.id === id);
        if (t) t.done = !t.done;
        renderTodos();
    };

    window.deleteTodo = function(id) {
        todos = todos.filter(x => x.id !== id);
        renderTodos();
    };

    window.filterTodo = function(f, btn) {
        activeFilter = f;
        document.querySelectorAll('.todo-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTodos();
    };
})();