(function () {
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const TIMES = ['7:00–8:00', '8:00–9:00', '9:00–10:00', '10:00–11:00', '11:00–12:00', '12:00–1:00', '1:00–2:00', '2:00–3:00', '3:00–4:00', '4:00–5:00', '5:00–6:00', '6:00–7:00'];

    let scheduleData = [];
    let selectedCourseName = '';

    function loadScheduleData() {
        const saved = localStorage.getItem('scheduleData');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (!Array.isArray(parsed)) {
                    scheduleData = Object.keys(parsed).map(key => ({ name: key, ...parsed[key] }));
                } else {
                    scheduleData = parsed;
                }
            } catch (e) {
                scheduleData = [];
            }
        }
    }

    loadScheduleData();

    function getCourseSlotRange(course) {
        const start = TIMES.findIndex(t => course.times.includes(t));
        if (start === -1) return null;
        let end = start;
        while (end < TIMES.length && course.times.includes(TIMES[end])) end++;
        return { start, end };
    }

function buildSchedule() {
    const gridBg = document.getElementById('cal-grid-bg');
    const eventsLayer = document.getElementById('cal-events-layer');
    if (!gridBg || !eventsLayer) return;

    gridBg.innerHTML = '';
    TIMES.forEach(t => {
        const row = document.createElement('div');
        row.className = 'cal-grid-row';
        row.innerHTML = `
            <div class="cal-grid-time">${t}</div>
            <div class="cal-grid-lines">
                <div class="cal-grid-line-col"></div><div class="cal-grid-line-col"></div>
                <div class="cal-grid-line-col"></div><div class="cal-grid-line-col"></div>
                <div class="cal-grid-line-col"></div><div class="cal-grid-line-col"></div>
            </div>
        `;
        gridBg.appendChild(row);
    });

    for(let i=0; i<6; i++) {
        const dayCol = document.getElementById(`day-events-${i}`);
        if (dayCol) dayCol.innerHTML = '';
    }

    const ROW_HEIGHT = 40; 
    const CAL_START_HOUR = 7; 

    DAYS.forEach((day, di) => {
        const dayCourses = scheduleData.filter(c => c.days.includes(di));
        const dayContainer = document.getElementById(`day-events-${di}`);
        if (!dayContainer) return;

        dayCourses.forEach(course => {
            if (course.exactStart === undefined) {
                if (course.times && course.times.length > 0) {
                    const first = course.times[0].split('–')[0].split(':');
                    let h1 = parseInt(first[0], 10);
                    if (h1 >= 1 && h1 <= 6) h1 += 12;
                    course.exactStart = h1 + (parseInt(first[1], 10) || 0)/60;

                    const last = course.times[course.times.length - 1].split('–')[1].split(':');
                    let h2 = parseInt(last[0], 10);
                    if (h2 >= 1 && h2 <= 7) h2 += 12;
                    course.exactEnd = h2 + (parseInt(last[1], 10) || 0)/60;
                } else {
                    course.exactStart = 7; course.exactEnd = 8;
                }
            }
        });

        dayCourses.sort((a, b) => a.exactStart - b.exactStart);

        const groups = [];
        let currentGroup = [];
        let groupEnd = 0;

        dayCourses.forEach(course => {
            if (currentGroup.length === 0) {
                currentGroup.push(course);
                groupEnd = course.exactEnd;
            } else {
                if (course.exactStart < groupEnd) {
                    currentGroup.push(course);
                    groupEnd = Math.max(groupEnd, course.exactEnd);
                } else {
                    groups.push(currentGroup);
                    currentGroup = [course];
                    groupEnd = course.exactEnd;
                }
            }
        });
        if (currentGroup.length > 0) groups.push(currentGroup);

        groups.forEach(group => {
            const columns = [];
            
            group.forEach(course => {
                let placed = false;
                for (let i = 0; i < columns.length; i++) {
                    const lastCourse = columns[i][columns[i].length - 1];
                    if (course.exactStart >= lastCourse.exactEnd) {
                        columns[i].push(course);
                        course.colIndex = i;
                        placed = true;
                        break;
                    }
                }
                if (!placed) {
                    columns.push([course]);
                    course.colIndex = columns.length - 1;
                }
            });

            const numCols = columns.length;

            group.forEach(course => {
                const topOffset = (course.exactStart - CAL_START_HOUR) * ROW_HEIGHT;
                const height = (course.exactEnd - course.exactStart) * ROW_HEIGHT;
                const widthPercent = 100 / numCols;
                const leftPercent = course.colIndex * widthPercent;

                const eventDiv = document.createElement('div');
                eventDiv.className = `calendar-event ${course.color || ''}`;
                eventDiv.style.top = `${topOffset}px`;
                eventDiv.style.height = `${height}px`;
                eventDiv.style.left = `${leftPercent}%`;
                eventDiv.style.width = `calc(${widthPercent}% - 2px)`;

                const formatTime = (timeNum) => {
                    let h = Math.floor(timeNum);
                    let m = Math.round((timeNum - h) * 60);
                    const ampm = h >= 12 ? 'PM' : 'AM';
                    if (h > 12) h -= 12;
                    if (h === 0) h = 12;
                    return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
                };

                eventDiv.innerHTML = `
                    <div class="event-title" style="font-size: 18px; text-align: center; padding: 10px 5px; margin-top: 15px;">${course.name}</div>
                `;
                eventDiv.onclick = () => openCourseDetailModal(course.name.replace(/'/g, "\\'"));
                dayContainer.appendChild(eventDiv);
            });
        });
    });
}

    window.openAddModal = function () {
        document.getElementById('addModal').classList.add('show');
    };

    window.closeAddModal = function () {
        document.getElementById('addModal').classList.remove('show');
        document.getElementById('courseName').value = '';
        document.getElementById('courseTimeStart').value = '';
        document.getElementById('courseTimeEnd').value = '';
        Array.from(document.getElementById('courseDays').options).forEach(opt => opt.selected = false);
        document.getElementById('courseSemester').value = '1-1';
        document.getElementById('courseUnits').value = '';
        document.getElementById('courseRoom').value = '';
        document.querySelectorAll('input[name="courseType"]').forEach(radio => radio.checked = false);
    };

    window.saveAddCourse = function () {
        const courseName = document.getElementById('courseName').value.trim();
        const startTimeValue = document.getElementById('courseTimeStart').value;
        const endTimeValue = document.getElementById('courseTimeEnd').value;
        const courseDaysSelect = document.getElementById('courseDays');
        const selectedDays = Array.from(courseDaysSelect.selectedOptions).map(opt => parseInt(opt.value, 10));
        const courseType = document.querySelector('input[name="courseType"]:checked')?.value;
        const courseRoom = document.getElementById('courseRoom').value.trim();
        const semesterValue = document.getElementById('courseSemester').value;
        const courseUnits = Number(document.getElementById('courseUnits').value) || 3;

        if (!courseName || selectedDays.length === 0) {
            alert('Please enter a course name and select at least one day.');
            return;
        }

        if (!startTimeValue || !endTimeValue) {
            alert('Please select both start and end times.');
            return;
        }

        const parseInputTime = (timeStr) => {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return hours + (minutes / 60);
        };

        const inputStart = parseInputTime(startTimeValue);
        const inputEnd = parseInputTime(endTimeValue);

        if (inputEnd <= inputStart) {
            alert('End time must be after start time.');
            return;
        }

        const matchedSlots = [];
        for (const timeSlot of TIMES) {
            const [startPart, endPart] = timeSlot.split('\u2013').map(t => t.trim());
            let slotStart = parseInt(startPart.split(':')[0], 10);
            let slotEnd = parseInt(endPart.split(':')[0], 10);
            if (slotStart >= 1 && slotStart <= 6) slotStart += 12;
            if (slotEnd >= 1 && slotEnd <= 7) slotEnd += 12;
            if (slotStart < inputEnd && slotEnd > inputStart) {
                matchedSlots.push(timeSlot);
            }
        }

        if (matchedSlots.length === 0) {
            alert('No matching time slots found. Please select from the available slots (7:00 AM - 7:00 PM).');
            return;
        }

        scheduleData.push({
            name: courseName,
            days: selectedDays,
            times: matchedSlots,
            exactStart: inputStart,
            exactEnd: inputEnd,
            type: courseType,
            room: courseRoom,
            semester: semesterValue,
            units: courseUnits,
            color: Math.random() > 0.5 ? 'light' : ''
        });

        localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
        buildSchedule();
        window.closeAddModal();
    };

window.openCourseDetailModal = function (courseName) {
        selectedCourseName = courseName;
        const course = scheduleData.find(c => c.name === courseName);
        if (!course) return;

        document.getElementById('courseDetailName').textContent = courseName;
        document.getElementById('courseDetailType').textContent = course.type ? course.type.toUpperCase() : 'N/A';
        document.getElementById('courseDetailRoom').textContent = course.room || '—';

        const dayNames = course.days.map(d => DAYS[d]).join(', ');
        document.getElementById('courseDetailDays').textContent = dayNames;

        let formattedTime = '';
        
        if (course.exactStart !== undefined && course.exactEnd !== undefined) {
            const formatTime = (timeNum) => {
                let h = Math.floor(timeNum);
                let m = Math.round((timeNum - h) * 60);
                const ampm = h >= 12 ? 'PM' : 'AM';
                if (h > 12) h -= 12;
                if (h === 0) h = 12;
                return `${h}:${m.toString().padStart(2, '0')} ${ampm}`;
            };
            formattedTime = `${formatTime(course.exactStart)} – ${formatTime(course.exactEnd)}`;
        
        } else if (course.times && course.times.length > 0) {
            const firstSlot = course.times[0];
            const lastSlot = course.times[course.times.length - 1];
            const formatWithAMPM = (timeStr) => {
                const hour = parseInt(timeStr.split(':')[0], 10);
                if (hour >= 7 && hour <= 11) return `${timeStr} AM`;
                if (hour === 12) return `${timeStr} PM`;
                return `${timeStr} PM`;
            };
            const startTime = formatWithAMPM(firstSlot.split('\u2013')[0].trim());
            const endTime = formatWithAMPM(lastSlot.split('\u2013')[1].trim());
            formattedTime = `${startTime} – ${endTime}`;
        }

        document.getElementById('courseDetailTimes').textContent = formattedTime;
        document.getElementById('courseDetailModal').classList.add('show');
    };

    window.closeCourseDetailModal = function () {
        document.getElementById('courseDetailModal').classList.remove('show');
        selectedCourseName = '';
    };

    window.deleteCourse = function () {
        if (confirm(`Delete course "${selectedCourseName}"?`)) {
            scheduleData = scheduleData.filter(c => c.name !== selectedCourseName);
            localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
            buildSchedule();
            window.closeCourseDetailModal();
        }
    };

    window.clearAllCourses = function () {
        if (confirm('Are you sure you want to delete ALL courses? This cannot be undone.')) {
            scheduleData = [];
            localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
            buildSchedule();
        }
    };

    window.onclick = function (event) {
        const modal = document.getElementById('addModal');
        const detailModal = document.getElementById('courseDetailModal');
        if (modal && event.target === modal) window.closeAddModal();
        if (detailModal && event.target === detailModal) window.closeCourseDetailModal();
    };

    buildSchedule();
})();
