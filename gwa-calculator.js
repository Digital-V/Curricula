// function: read subject, render them, compute GWA, show/hide empty state.

// 1. grab gthe key elements
const semesterList = document.getElementById("semester-list");// empty list later render it using js
const overallGWA = document.getElementById("overall-gwa-value");
// div with -- to replace later
const honorDescription = document.getElementById("honor-description"); // div message to replace when commulatative gwa is computed
const emptyGwa = document.getElementById("gwa-empty"); // div message "No subject yet" replace if add subject

// 2. need a function to load saved data from localStorage then convert it back into an array with error handling to prevent crash if the data is broken or missing
function loadSubjectFromSchedule() {
    const rawData = localStorage.getItem("scheduleData"); // get raw data from local storage\
    // check if data exist
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
        return []; // if broken data return empty array.
    }


}
const schedule = loadSubjectFromSchedule(); // scheduleArray

// 4. convert scheduleData into subjects array
function scheduleToSubjects(scheduleArray) {
    return scheduleArray.map((course) => ({
        subjectCode: course.name,
        subjectName: course.name,
        units: course.units ?? 3,
        grade: null,
        semester: course.semester || "1-1"
    }));
}
// use then create subject array variable
const subjects = scheduleToSubjects(schedule);
// subject: {subjectCode: courseName, subjectName: courseName, units: 3, grade: null, semester: courseInfo.semester}

// additional: filter out duplicate courses (same subject code and semester)
function removeDuplicateCourses(subjectsArray) {
    const seen = new Set();
    return subjectsArray.filter((subject) => {
        const key = `${subject.subjectCode}-${subject.semester}`;
        if (seen.has(key)) {
            return false; // skip duplicate
        }
        seen.add(key);
        return true;
    });
}
const uniqueSubjects = removeDuplicateCourses(subjects);

// additional: merge saved units and grades before rendering:
const savedUnits = loadUnitsFromStorage();
savedUnits.forEach((saved) => {
    const subj = uniqueSubjects.find(
        (s) => s.subjectCode === saved.subjectCode && s.semester === saved.semester
    );
    if (subj && saved.units) subj.units = saved.units;
    if (subj && saved.grade !== undefined && saved.grade !== null) {
        subj.grade = saved.grade;
    }
});

// 5. a function for hide/show the empty state
function updateEmptyState(subjects) {
    if (subjects.length === 0) { // if subject array length is 0 then it's still empty
        emptyGwa.style.display = "block"; // this is how you update the inline style attribut value 
        semesterList.innerHTML = ""; // removes the message in the <div>

    } else { // else may laman
        emptyGwa.style.display = "none" // hides the empty message
    }

}
updateEmptyState(uniqueSubjects);

// 6. group subjects per sem
function groupBySemester(subjects) {
    const groups = {}; // object that will store the grouped subjects
    // loop through every subject
    for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];

        const semesterKey = subject.semester || "Unsorted";

        // create a semester array if, check first if it doesn't exist
        if (!groups[semesterKey]) {
            groups[semesterKey] = [];
        }
        // add subject
        groups[semesterKey].push(subject);
    }
    return groups;


}
let groupedSubjects = groupBySemester(uniqueSubjects); // includes all the subject in all sem

//  additional function to exclude nstp and cvsu101 subject in the gwa computation
function isExcludedCourse(subject) {
    const code = String(subject.subjectCode || "").toLowerCase().replace(/\s+/g, "");
    const name = String(subject.subjectName || "").toLowerCase().replace(/\s+/g, "");
    return code === "nstp" || code === "cvsu101" || name === "nstp" || name === "cvsu101";
}

// additional:  Add save/load helpers:
function saveUnitsToStorage(subjects) {
    localStorage.setItem("gwaUnits", JSON.stringify(subjects));
}

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

        if (isExcludedCourse(subject)) {// if the subject is === to the excludedCourses then continue(skips the rest of the loop)
            continue;
        }

        // Guard: skip if no grade entered
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

// i need a function to translate the key from input to readable string of semester per year.
function getSemesterLabel(semId) {
    for (let i = 0; i < SEMESTERS.length; i++) {
        const semester = SEMESTERS[i];

        // find match
        if (semester.id === semId) {
            // return the label if found
            return semester.label
        }
    }
    //else return asis
    return semId;
}

// 7. Render semester cards. eto hindi ko na alam:
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

        // Create column headers
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
                <div class="gwa-subject-units">
                <input
                    type="number"
                    min="1"
                    max="6"
                    step="1"
                    value="${subject.units ?? 3}"
                    data-code="${subject.subjectCode}"
                    data-sem="${subject.semester}"
                    class="unit-input"
                >
                </div>
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
    if (e.target.classList.contains("unit-input")) {
        const code = e.target.dataset.code;
        const sem = e.target.dataset.sem;
        const value = Number(e.target.value);

        const subj = uniqueSubjects.find(
            (s) => s.subjectCode === code && s.semester === sem
        );

        if (subj && !isNaN(value) && value > 0) {
            subj.units = value;
            saveUnitsToStorage(uniqueSubjects);
            renderAll();
        }
    }

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

// 8. compute the overall GWA 
function computeCumulativeGwa(allSubjects) {
    // Step 1: turn grouped subjects into one list
    let subjectsList = allSubjects;
    if (!Array.isArray(allSubjects)) {
        subjectsList = Object.values(allSubjects || {}).flat();
    }

    // Step 2: add up total units and total (units * grade)
    let totalUnits = 0;
    let totalWeightedGrades = 0;

    for (let i = 0; i < subjectsList.length; i++) {
        const subject = subjectsList[i];

        // Skip excluded subjects like NSTP and CvSU 101
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

    // Step 3: divide total grade points by total units
    return totalWeightedGrades / totalUnits;
}
// 9. update the UI with the gwa and honors(if)
function updateGwaDisplay(gwa) {
    if (gwa === null) {// let's check first if gwa is null 
        overallGWA.textContent = "--"; // change the textContent of the <div class="overallGWA"
        honorDescription.textContent = "Add grades to see honors status.";
        return;
    }
    overallGWA.textContent = gwa.toFixed(2);

    // latin honors cut off:
    // Summa: 1.00-1.21;
    // Magna: 1.22-1.45;
    // cumlaude: 1.46-1.75;
    const latinHonor = checkMinimumPerGrade(uniqueSubjects);

    const summa = latinHonor.summa;
    const magna = latinHonor.magna;
    const cumlaude = latinHonor.cumlaude;

    if (gwa >= 1.00 && gwa <= 1.21) {
        // if your in summa range it means you surpass magna and cumlaude. However you can be disqualified if even only one subject did not meet the minimum grade requirement. so I allow downgrade in summa range gwa.
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

// I need a function that check the grades in every subject per semester, cause latin honors has a minimum grade requirement per subject return true if it detects a grade below minimum grade
function checkMinimumPerGrade(subjects) {
    let summa = true;
    let magna = true;
    let cumlaude = true;

    // loop through all the subject
    for (let i = 0; i < subjects.length; i++) {
        const subject = subjects[i];

        // Skip excluded subjects like NSTP and CvSU 101
        if (isExcludedCourse(subject)) {
            continue;
        }
        // pass if the grade is missing
        if (subject.grade === null || subject.grade === undefined || subject.grade === "") {
            continue;
        }


        const grade = Number(subject.grade);

        if (!isNaN(grade)) {// verify if a number then proceed to 
            if (grade > 1.75) {// if grade is bellow 1.75 then student is not qualified for summa anymore
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