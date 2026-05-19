(function() {
    const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
    const TIMES = ['7:00–8:00','8:00–9:00','9:00–10:00','10:00–11:00','11:00–12:00','1:00–2:00','2:00–3:00','3:00–4:00','4:00–5:00','5:00–6:00','6:00–7:00'];

    // Changed from an object {} to an array [] to allow duplicate course names
    let scheduleData = [];

    function loadScheduleData() {
        const saved = localStorage.getItem('scheduleData');
        if (saved) {
            try { 
                const parsed = JSON.parse(saved);
                // Convert old object-based data to the new array format for backward compatibility
                if (!Array.isArray(parsed)) {
                    scheduleData = Object.keys(parsed).map(key => ({
                        name: key,
                        ...parsed[key]
                    }));
                } else {
                    scheduleData = parsed;
                }
            } catch(e) { scheduleData = []; } // Reset to empty array on error
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
                // Changed to iterate over the array instead of using Object.entries
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
                    td.innerHTML = `<span class="cell-block ${found.info.color}">${found.name}</span>`;
                    td.rowSpan = rowspan;
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });
    }

    window.openAddModal = function() {
        document.getElementById('addModal').classList.add('show');
    };

    window.closeAddModal = function() {
        document.getElementById('addModal').classList.remove('show');
        document.getElementById('courseName').value = '';
        document.getElementById('courseTimeStart').value = '';
        document.getElementById('courseTimeEnd').value = '';
        Array.from(document.getElementById('courseDays').options).forEach(opt => opt.selected = false);
    };

    window.saveAddCourse = function() {
        const courseName = document.getElementById('courseName').value.trim();
        const startTimeValue = document.getElementById('courseTimeStart').value;
        const endTimeValue = document.getElementById('courseTimeEnd').value;
        const courseDaysSelect = document.getElementById('courseDays');
        const selectedDays = Array.from(courseDaysSelect.selectedOptions).map(opt => parseInt(opt.value));

        if (!courseName || selectedDays.length === 0) {
            alert('Please enter a course name and select at least one day.');
            return;
        }
        
        // Filter the array to check for naming and day conflicts instead of relying on object keys
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

        const convertTo12Hour = (timeStr) => {
            const [hours] = timeStr.split(':').map(Number);
            return hours % 12 || 12;
        };

        const startHour12 = convertTo12Hour(startTimeValue);
        const endHour12 = convertTo12Hour(endTimeValue);

        const matchedSlots = [];
        for (const timeSlot of TIMES) {
            const [startPart, endPart] = timeSlot.split('\u2013').map(t => t.trim());
            const slotStart = parseInt(startPart.split(':')[0]);
            const slotEnd = parseInt(endPart.split(':')[0]);
            if (slotStart >= startHour12 && slotEnd <= endHour12) matchedSlots.push(timeSlot);
        }

        if (matchedSlots.length === 0) {
            alert('No matching time slots found. Please select from the available slots (7am-7pm).');
            return;
        }

        // Push the new course object into the array rather than assigning it to a key
        scheduleData.push({
            name: courseName,
            days: selectedDays,
            times: matchedSlots,
            color: Math.random() > 0.5 ? 'light' : ''
        });

        localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
        buildSchedule();
        window.closeAddModal();
    };

    window.clearAllCourses = function() {
        if (confirm('Are you sure you want to delete ALL courses? This cannot be undone.')) {
            // Reset to an empty array instead of an empty object
            scheduleData = []; 
            localStorage.setItem('scheduleData', JSON.stringify(scheduleData));
            buildSchedule();
        }
    };

    window.onclick = function(event) {
        const modal = document.getElementById('addModal');
        if (modal && event.target === modal) window.closeAddModal();
    };

    buildSchedule();
})();