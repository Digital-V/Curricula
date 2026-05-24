(function() {
    let attState = {};

    function getCurrentMonthDays() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return Array.from({length: daysInMonth}, (_,i) => i+1);
    }

    function getCoursesFromHome() {
        const stored = localStorage.getItem('scheduleData');
        if (stored) {
            try { 
                const parsed = JSON.parse(stored);
                if (!Array.isArray(parsed)) {
                    return Object.keys(parsed).map(key => ({ name: key, ...parsed[key] }));
                }
                return parsed;
            } catch(e) { return []; }
        }
        return [];
    }

    let selectedSemester = 'all';

    function formatSemesterLabel(code) {
        if (!code || typeof code !== 'string') return code;
        const parts = code.split('-');
        if (parts.length !== 2) return code;
        
        const year = parts[0];
        const sem = parts[1];
        const ord = n => {
            if (n === '1') return '1st';
            if (n === '2') return '2nd';
            if (n === '3') return '3rd';
            return `${n}th`;
        };
        return `${ord(year)} Year - ${ord(sem)} Semester`;
    }

    function populateSemesterSelector() {
        const sel = document.getElementById('att-semester');
        if (!sel) return;
        const scheduleData = getCoursesFromHome();
        const semesters = [...new Set(scheduleData.map(c => c.semester).filter(Boolean))];
        sel.innerHTML = '';
        const allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.textContent = 'All Semesters';
        sel.appendChild(allOpt);
        semesters.forEach(s => {
            const o = document.createElement('option');
            o.value = s;
            o.textContent = formatSemesterLabel(s);
            sel.appendChild(o);
        });
        sel.value = selectedSemester;
        sel.addEventListener('change', () => {
            selectedSemester = sel.value;
            init();
        });
    }

    function getAttKey() {
        const now = new Date();
        return `attState_${now.getFullYear()}_${now.getMonth()}`;
    }

    function saveAttState() {
        try {
            localStorage.setItem(getAttKey(), JSON.stringify(attState));
        } catch(e) {
            console.warn('Could not save attendance state', e);
        }
    }

    function loadAttState() {
        try {
            const saved = localStorage.getItem(getAttKey());
            return saved ? JSON.parse(saved) : null;
        } catch(e) {
            return null;
        }
    }

    function initializeAttendance() {
        let scheduleData = getCoursesFromHome();
        if (selectedSemester && selectedSemester !== 'all') {
            scheduleData = scheduleData.filter(c => c.semester === selectedSemester);
        }
        const uniqueCourses = [...new Set(scheduleData.map(c => c.name))];
        
        const monthDays = getCurrentMonthDays();
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const savedState = loadAttState();

        attState = {};
        uniqueCourses.forEach(courseName => {
            attState[courseName] = {};
    
            const instances = scheduleData.filter(c => c.name === courseName);
            const allDaysForCourse = instances.flatMap(c => c.days);

            monthDays.forEach(d => {
                const date = new Date(year, month, d);
                const dow = date.getDay();
                const mapped = dow === 0 ? -1 : dow - 1;

                const isClassDay = allDaysForCourse.includes(mapped);
                const defaultState = isClassDay ? 'present' : 'no-class';

                if (savedState && savedState[courseName] && isClassDay &&
                    (savedState[courseName][d] === 'present' || savedState[courseName][d] === 'absent')) {
                    attState[courseName][d] = savedState[courseName][d];
                } else {
                    attState[courseName][d] = defaultState;
                }
            });
        });
    }

    function buildAttendance() {
        const container = document.getElementById('att-courses');
        if (!container) return; 

        const courses = Object.keys(attState);
        const monthDays = getCurrentMonthDays();
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        if (courses.length === 0) {
            container.innerHTML = '<div style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; color:#5a8a6a; font-size:14px; padding:20px; min-height: 100px;">No courses added yet. Add courses from the Weekly Schedule.</div>';
            return;
        }

        container.innerHTML = '';
        courses.forEach(course => {
            const states = attState[course];
            const classDays = monthDays.filter(d => states[d] !== 'no-class' && states[d] !== 'future');
            const present = classDays.filter(d => states[d] === 'present').length;
            const total = classDays.length;

            const block = document.createElement('div');
            block.className = 'att-course-block';
            block.innerHTML = `
                <div class="att-course-header">
                    <span class="att-course-name">${course}</span>
                    <span class="att-stat">${present}/${total} present (${total ? Math.round(present/total*100) : 0}%)</span>
                </div>
                <div class="att-cal-grid">
                    ${['S','M','T','W','T','F','S'].map(d=>`<div class="att-day-label">${d}</div>`).join('')}
                    ${(() => {
                        const firstDow = new Date(year, month, 1).getDay();
                        let cells = '';
                        for (let i = 0; i < firstDow; i++) cells += `<div class="att-cell no-class"></div>`;
                        monthDays.forEach(d => {
                            const s = states[d];
                            const cls = s === 'no-class' ? 'no-class' : s === 'future' ? '' : s;
                            const clickable = s !== 'no-class' && s !== 'future';
                            cells += `<div class="att-cell ${cls}" ${clickable ? `onclick="toggleAtt('${course}',${d})"` : ''} title="${clickable ? 'Click to toggle' : ''}">
                                <span>${d}</span>
                            </div>`;
                        });
                        return cells;
                    })()}
                </div>`;
            container.appendChild(block);
        });
    }

    window.toggleAtt = function(course, day) {
        const s = attState[course][day];
        attState[course][day] = s === 'present' ? 'absent' : 'present';
        saveAttState();
        buildAttendance();
    };

    window.downloadAttendance = function() {
        try {
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();

            const rows = [];
            rows.push(['Course','Day','Date','Status']);

            Object.keys(attState).forEach(course => {
                Object.keys(attState[course]).forEach(dayStr => {
                    const day = Number(dayStr);
                    const status = attState[course][day];
                    if (status === 'no-class') return;
                    const date = new Date(year, month, day);
                    const shortDate = isNaN(date) ? '' : `${month + 1}/${day}`;
                    rows.push([course, day, shortDate, status]);
                });
            });

            const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_${year}_${String(month+1).padStart(2,'0')}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Failed to generate attendance download', e);
            alert('Could not generate download. See console for details.');
        }
    };

    function init() {
        populateSemesterSelector();
        initializeAttendance();
        buildAttendance();
    }

    init();

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) init();
    });
})();
