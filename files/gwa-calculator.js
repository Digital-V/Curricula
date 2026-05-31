const semesterList = document.getElementById("semester-list");
const overallGWA = document.getElementById("overall-gwa-value");
const honorDescription = document.getElementById("honor-description");
const emptyGwa = document.getElementById("gwa-empty");


function loadSubjectFromSchedule() {
    const rawData = localStorage.getItem("scheduleData"); 
    if (!rawData) {
        return [];
    }
    try {
        const parsedData = JSON.parse(rawData);
        if (Array.isArray(parsedData)) {
            return parsedData;
        } else {
            return [];
        }

    } catch {
        return []; 
    }
}
const schedule = loadSubjectFromSchedule(); 

function scheduleToSubjects(scheduleArray) {
    return scheduleArray.map((course) => ({
        subjectCode: course.name,
        subjectName: course.name,
        units: course.units ?? 3,
        grade: null,
        semester: course.semester || "1-1"
    }));
}

const subjects = scheduleToSubjects(schedule);

function removeDuplicateCourses(subjectsArray) {
    const seen = new Set();
    return subjectsArray.filter((subject) => {
        const key = `${subject.subjectCode}-${subject.semester}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
const uniqueSubjects = removeDuplicateCourses(subjects);

const savedUnits = loadUnitsFromStorage();
savedUnits.forEach((saved) => {
    const subj = uniqueSubjects.find(
        (s) => s.subjectCode === saved.subjectCode && s.semester === saved.semester
    );
    if (subj && saved.grade !== undefined && saved.grade !== null) {
        subj.grade = saved.grade;
    }
});

function updateEmptyState(subjects) {
    if (subjects.length === 0) { 
        emptyGwa.style.display = "block";
        semesterList.innerHTML = "";

    } else {
        emptyGwa.style.display = "none"
    }

}
updateEmptyState(uniqueSubjects);

function groupBySemester(subjects) {
    const groups = {};
    for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];

        const semesterKey = subject.semester || "Unsorted";

        if (!groups[semesterKey]) {
            groups[semesterKey] = [];
        }
        groups[semesterKey].push(subject);
    }
    return groups;


}
let groupedSubjects = groupBySemester(uniqueSubjects);

function isExcludedCourse(subject) {
    const code = String(subject.subjectCode || "").toLowerCase().replace(/\s+/g, "");
    const name = String(subject.subjectName || "").toLowerCase().replace(/\s+/g, "");
    return code === "nstp" || code === "cvsu101" || name === "nstp" || name === "cvsu101";
}

function saveUnitsToStorage(subjects) {
    const gradesOnly = subjects.map((subject) => ({
        subjectCode: subject.subjectCode,
        semester: subject.semester,
        grade: subject.grade
    }));
    localStorage.setItem("gwaUnits", JSON.stringify(gradesOnly));

function loadUnitsFromStorage() {
    const raw = localStorage.getItem("gwaUnits");
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function computeSemGwa(subjects) {
    let totalUnits = 0;
    let totalPoints = 0;

    for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];

        if (isExcludedCourse(subject)) {
            continue;
        }

        if (subject.grade === null || subject.grade === undefined || subject.grade === "") {
            continue;
        }

        const units = Number(subject.units);
        const grade = Number(subject.grade);

        if (!isNaN(units) && units > 0 && !isNaN(grade) && grade >= 1.0) {
            totalUnits += units;
            totalPoints += units * grade;
        }
    }
    if (totalUnits === 0) {
        return null;
    }

    return totalPoints / totalUnits;
}

const SEMESTERS = [
    { id: "1-1", label: "1st Year - 1st Sem" },
    { id: "1-2", label: "1st Year - 2nd Sem" },
    { id: "2-1", label: "2nd Year - 1st Sem" },
    { id: "2-2", label: "2nd Year - 2nd Sem" },
    { id: "3-1", label: "3rd Year - 1st Sem" },
    { id: "3-2", label: "3rd Year - 2nd Sem" },
    { id: "4-1", label: "4th Year - 1st Sem" },
    { id: "4-2", label: "4th Year - 2nd Sem" }
];


function getSemesterLabel(semId) {
    for (let i = 0; i < SEMESTERS.length; i++) {
        const semester = SEMESTERS[i];

        if (semester.id === semId) {
            return semester.label
        }
    }
    return semId;
}

function renderSemesters(groups) {
    semesterList.innerHTML = "";

    Object.keys(groups).forEach((semId) => {
        const semBox = document.createElement("div");
        semBox.className = "gwa-semester";

        const semSubjects = groups[semId];
        const semGwa = computeSemGwa(semSubjects);

        const header = document.createElement("div");
        header.className = "gwa-sem-header";

        const title = document.createElement("div");
        title.className = "gwa-semester-title";
        title.textContent = getSemesterLabel(semId);

        const gwaBox = document.createElement("div");
        gwaBox.className = "gwa-sem-gwa";
        gwaBox.textContent = `Sem GWA: ${semGwa === null ? "--" : semGwa.toFixed(2)}`;

        header.appendChild(title);
        header.appendChild(gwaBox);

        const list = document.createElement("div");
        list.className = "gwa-subject-list";

        const headerRow = document.createElement("div");
        headerRow.className = "gwa-subject-header";
        headerRow.innerHTML = `
            <div class="gwa-header-label">Courses</div>
            <div class="gwa-header-label">Units</div>
            <div class="gwa-header-label">Grade</div>
        `;
        list.appendChild(headerRow);

        semSubjects.forEach((subject) => {
            const row = document.createElement("div");
            row.className = "gwa-subject-row";
            row.innerHTML = `
                <div class="gwa-subject-code">${subject.subjectCode}</div>
                <div class="gwa-subject-units">${subject.units ?? 3}</div>
                <div class="gwa-subject-grade">
                <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.01"
                    value="${subject.grade ?? ""}"
                    data-code="${subject.subjectCode}"
                    data-sem="${subject.semester}"
                    class="grade-input"
                    placeholder="--"
                >
                </div>
                `;
            list.appendChild(row);
        });

        semBox.appendChild(header);
        semBox.appendChild(list);
        semesterList.appendChild(semBox);
    });
}

function renderAll() {
    groupedSubjects = groupBySemester(uniqueSubjects);
    renderSemesters(groupedSubjects);
    const gwa = computeCumulativeGwa(groupedSubjects);
    updateGwaDisplay(gwa);
}

semesterList.addEventListener("change", (e) => {
    if (e.target.classList.contains("grade-input")) {
        const code = e.target.dataset.code;
        const sem = e.target.dataset.sem;
        const value = Number(e.target.value);

        const subj = uniqueSubjects.find(
            (s) => s.subjectCode === code && s.semester === sem
        );

        if (subj && !isNaN(value) && value > 0) {
            subj.grade = value;
            saveUnitsToStorage(uniqueSubjects);
            renderAll();
        }
    }
});

function computeCumulativeGwa(allSubjects) {
    let subjectsList = allSubjects;
    if (!Array.isArray(allSubjects)) {
        subjectsList = Object.values(allSubjects || {}).flat();
    }

    let totalUnits = 0;
    let totalWeightedGrades = 0;

    for (let i = 0; i < subjectsList.length; i++) {
        const subject = subjectsList[i];

        if (isExcludedCourse(subject)) {
            continue;
        }

        if (subject.grade === null || subject.grade === undefined || subject.grade === "") {
            continue;
        }

        const units = Number(subject.units);
        const grade = Number(subject.grade);

        if (!isNaN(units) && units > 0 && !isNaN(grade) && grade >= 1.0) {
            totalUnits += units;
            totalWeightedGrades += units * grade;
        }
    }

    if (totalUnits === 0) {
        return null;
    }
    return totalWeightedGrades / totalUnits;
}
function updateGwaDisplay(gwa) {
    if (gwa === null) {
        overallGWA.textContent = "--";
        honorDescription.textContent = "Add grades to see honors status.";
        return;
    }
    overallGWA.textContent = gwa.toFixed(2);

    const latinHonor = checkMinimumPerGrade(uniqueSubjects);

    const summa = latinHonor.summa;
    const magna = latinHonor.magna;
    const cumlaude = latinHonor.cumlaude;

    if (gwa >= 1.00 && gwa <= 1.21) {
        if (summa) {
            honorDescription.textContent = "Summa Cum Laude";
        } else if (magna) {
            honorDescription.textContent = "Magna Cum Laude";
        } else if (cumlaude) {
            honorDescription.textContent = "Cum Laude";
        } else {
            honorDescription.textContent = "No Latin Honors";
        }
    } else if (gwa >= 1.22 && gwa <= 1.45) {
        if (magna) {
            honorDescription.textContent = "Magna Cum Laude";
        } else if (cumlaude) {
            honorDescription.textContent = "Cum Laude";
        } else {
            honorDescription.textContent = "No Latin Honors";
        }
    } else if (gwa >= 1.46 && gwa <= 1.75) {
        if (cumlaude) {
            honorDescription.textContent = "Cum Laude";
        } else {
            honorDescription.textContent = "No Latin Honors";
        }
    } else {
        honorDescription.textContent = "No Latin Honors";
    }

}
renderAll();

function checkMinimumPerGrade(subjects) {
    let summa = true;
    let magna = true;
    let cumlaude = true;

    for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];
        if (isExcludedCourse(subject)) {
            continue;
        }
        if (subject.grade === null || subject.grade === undefined || subject.grade === "") {
            continue;
        }

        const grade = Number(subject.grade);

        if (!isNaN(grade)) {
            if (grade > 1.75) {
                summa = false;
            }
            if (grade > 2.00) {
                magna = false;
            }
            if (grade > 2.25) {
                cumlaude = false;
            }
        }
    }
    return { summa, magna, cumlaude };
    }
}
