const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday'];
const TIMES = ['7:00–8:00','8:00–9:00','9:00–10:00','10:00–11:00','11:00–12:00','1:00–2:00','2:00–3:00','3:00–4:00','4:00–5:00','5:00–6:00','6:00–7:00'];

let scheduleData = {};

function buildSchedule() {
    const tbody = document.getElementById('sched-body');
    tbody.innerHTML = '';
    
    const coveredCells = {};
    
    TIMES.forEach((t, timeIndex) => {
        const tr = document.createElement('tr');
        
        const timeCell = document.createElement('td');
        timeCell.textContent = t;
        tr.appendChild(timeCell);
        
        DAYS.forEach((day, di) => {
            const cellKey = `${di}-${timeIndex}`;
            
            if (coveredCells[cellKey]) {
                return;
            }
            
            let found = null;
            for (const [name, info] of Object.entries(scheduleData)) {
                if (info.times.includes(t) && info.days.includes(di)) { 
                    found = { name, info }; 
                    break; 
                }
            }
            
            const td = document.createElement('td');
            
            if (found) {
                let rowspan = 1;
                for (let i = timeIndex + 1; i < TIMES.length; i++) {
                    if (found.info.times.includes(TIMES[i])) {
                        rowspan++;
                    } else {
                        break;
                    }
                }
                
                for (let i = 0; i < rowspan; i++) {
                    const key = `${di}-${timeIndex + i}`;
                    coveredCells[key] = true;
                }
                
                td.innerHTML = `<span class="cell-block ${found.info.color}">${found.name}</span>`;
                td.rowSpan = rowspan;
            }
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
}

function addCourse(time, day) {
    const course = prompt(`Add course for ${day} at ${time} (or leave blank to clear):`);
    if (course !== null) {
        if (course.trim() === '') {
            for (const [name, info] of Object.entries(scheduleData)) {
                if (info.time === time && info.days.includes(DAYS.indexOf(day))) {
                    delete scheduleData[name];
                    break;
                }
            }
        } else {
            for (const [name, info] of Object.entries(scheduleData)) {
                if (info.time === time && info.days.includes(DAYS.indexOf(day))) {
                    delete scheduleData[name];
                    break;
                }
            }
            const uniqueName = course + ' (' + time + ' ' + day + ')';
            scheduleData[course] = {
                days: [DAYS.indexOf(day)],
                time: time,
                color: Math.random() > 0.5 ? 'light' : ''
            };
        }
        buildSchedule();
    }
}

function openAddModal() {
    document.getElementById('addModal').classList.add('show');
}

function closeAddModal() {
    document.getElementById('addModal').classList.remove('show');
    document.getElementById('courseName').value = '';
    document.getElementById('courseTimeStart').value = '';
    document.getElementById('courseTimeEnd').value = '';
    Array.from(document.getElementById('courseDays').options).forEach(opt => opt.selected = false);
}

function saveAddCourse() {
    const courseName = document.getElementById('courseName').value.trim();
    const startTimeValue = document.getElementById('courseTimeStart').value;
    const endTimeValue = document.getElementById('courseTimeEnd').value;
    const courseDaysSelect = document.getElementById('courseDays');
    const selectedDays = Array.from(courseDaysSelect.selectedOptions).map(opt => parseInt(opt.value));

    if (!courseName || selectedDays.length === 0) {
        alert('Please enter a course name and select at least one day.');
        return;
    }

    if (!startTimeValue || !endTimeValue) {
        alert('Please select both start and end times.');
        return;
    }

    const convertTo12Hour = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        let hour12 = hours % 12 || 12;
        return hour12;
    };

    const startHour12 = convertTo12Hour(startTimeValue);
    const endHour12 = convertTo12Hour(endTimeValue);

    const matchedSlots = [];
    for (const timeSlot of TIMES) {
        const [startPart, endPart] = timeSlot.split('\u2013').map(t => t.trim());
        const slotStartHour = parseInt(startPart.split(':')[0]);
        const slotEndHour = parseInt(endPart.split(':')[0]);
        
        if (slotStartHour >= startHour12 && slotEndHour <= endHour12) {
            matchedSlots.push(timeSlot);
        }
    }

    if (matchedSlots.length === 0) {
        alert('No matching time slots found. Please select from the available slots (7am-7pm).');
        return;
    }

    scheduleData[courseName] = {
        days: selectedDays,
        times: matchedSlots,
        color: Math.random() > 0.5 ? 'light' : ''
    };

    buildSchedule();
    closeAddModal();
}

window.onclick = function(event) {
    const modal = document.getElementById('addModal');
    if (event.target === modal) {
        closeAddModal();
    }
}

buildSchedule();