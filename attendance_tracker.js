(function() {
    const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

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
            try { return JSON.parse(stored); } catch(e) { return {}; }
        }
        return {};
    }

    function initializeAttendance() {
        const scheduleData = getCoursesFromHome();
        const courses = Object.keys(scheduleData);
        const monthDays = getCurrentMonthDays();
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        attState = {};
        courses.forEach(c => {
            attState[c] = {};
            const info = scheduleData[c];
            if (!info || !Array.isArray(info.days)) return;

            monthDays.forEach(d => {
                const date = new Date(year, month, d);
                const dow = date.getDay();   // 0=Sun,1=Mon,...,6=Sat
                const mapped = dow - 1;      // Mon=0, Tue=1, ..., Fri=4, Sun=-1, Sat=5

                attState[c][d] = info.days.includes(mapped) ? 'present' : 'no-class';
            });
        });
    }

    function buildAttendance() {
        const container = document.getElementById('att-courses');
        if (!container) return; // guard: only runs on attendance_tracker.html

        const scheduleData = getCoursesFromHome();
        const courses = Object.keys(scheduleData);
        const monthDays = getCurrentMonthDays();
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        if (courses.length === 0) {
            container.innerHTML = '<div style="grid-column: 1 / -1; display: flex; align-items: center; justify-content: center; color:#5a8a6a; font-size:12px; padding:20px; min-height: 100px;">No courses added yet. Add courses from the Daily Schedule.</div>';
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

    // Expose toggleAtt globally so inline onclick handlers can reach it
    window.toggleAtt = function(course, day) {
        const s = attState[course][day];
        attState[course][day] = s === 'present' ? 'absent' : 'present';
        buildAttendance();
    };

    function init() {
        initializeAttendance();
        buildAttendance();
    }

    init();

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) init();
    });
})();