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

    function initializeAttendance() {
        const scheduleData = getCoursesFromHome();
        const uniqueCourses = [...new Set(scheduleData.map(c => c.name))];
        
        const monthDays = getCurrentMonthDays();
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        attState = {};
        uniqueCourses.forEach(courseName => {
            attState[courseName] = {};
    
            const instances = scheduleData.filter(c => c.name === courseName);
            const allDaysForCourse = instances.flatMap(c => c.days);

            monthDays.forEach(d => {
                const date = new Date(year, month, d);
                const dow = date.getDay();   
                const mapped = dow - 1;     

                attState[courseName][d] = allDaysForCourse.includes(mapped) ? 'present' : 'no-class';
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