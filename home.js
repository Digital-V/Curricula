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
                    scheduleData = Object.keys(parsed).map(key => ({
                        name: key,
                        ...parsed[key]
                    }));
                } else {
                    scheduleData = parsed;
                }
            } catch (e) { 
                scheduleData = []; 
            }
        }
    }

    loadScheduleData();

    function buildSchedule() {
        const tbody = document.getElementById('sched-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        const coveredCells = {};

        TIMES.forEach((t, timeIndex) => {
            const tr = document.createElement('tr');

            const timeCell = document.createElement('td');
            timeCell.textContent = t;
            tr.appendChild(timeCell);

            DAYS.forEach((day, di) => {
                const cellKey = `${di}-${timeIndex}`;
                if (coveredCells[cellKey]) return;

                let found = null;
                for (const course of scheduleData) {
                    if (course.times.includes(t) && course.days.includes(di)) {
                        found = { name: course.name, info: course };
                        break;
                    }
                }

                const td = document.createElement('td');

                if (found) {
                    let rowspan = 1;
                    for (let i = timeIndex + 1; i < TIMES.length; i++) {
                        if (found.info.times.includes(TIMES[i])) rowspan++;
                        else break;
                    }
                    for (let i = 0; i < rowspan; i++) coveredCells[`${di}-${timeIndex + i}`] = true;
                    td.innerHTML = `<span class="cell-block ${found.info.color}" onclick="openCourseDetailModal('${found.name}')" style="cursor: pointer;">${found.name}</span>`;
                    td.rowSpan = rowspan;
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
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

        if (!courseName || selectedDays.length === 0) {
            alert('Please enter a course name and select at least one day.');
            return;
        }

        const existingCourses = scheduleData.filter(c => c.name === courseName);
        if (existingCourses.length > 0) {
            const existingDays = existingCourses.flatMap(c => c.days);
            const conflictingDays = selectedDays.filter(d => existingDays.includes(d));
            if (conflictingDays.length > 0) {
                const uniqueConflictingDays = [...new Set(conflictingDays)];
                const dayNames = uniqueConflictingDays.map(d => DAYS[d]).join(', ');
                if (!confirm(`"${courseName}" already exists on ${dayNames}. Add anyway?`)) return;
            }
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
            type: courseType,
            room: courseRoom,
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
        if (course.times && course.times.length > 0) {
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