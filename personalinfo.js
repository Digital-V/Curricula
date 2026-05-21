function openPersonalInfo() {
    const hdr = document.querySelector('header');
    const grid = document.getElementById('grid');
    const sidebar = document.querySelector('.sidebar');
    if (hdr) {
        hdr.classList.toggle('expanded');
        if (grid) grid.classList.toggle('faded');
        if (sidebar) sidebar.classList.toggle('faded');
    }
}

function closePersonalInfo() {
    const hdr = document.querySelector('header');
    const grid = document.getElementById('grid');
    const sidebar = document.querySelector('.sidebar');
    if (hdr) {
        hdr.classList.remove('expanded');
        if (grid) grid.classList.remove('faded');
        if (sidebar) sidebar.classList.remove('faded');
    }
}

function capitalizeFirst(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function updateIDCardFields(info) {
    try {
        const idName = document.getElementById('idCardName');
        const idStudent = document.getElementById('idCardStudentNumber');
        const idProgram = document.getElementById('idCardProgram');
        const idContact = document.getElementById('idCardContact');
        const idYear = document.getElementById('idCardYear');
        const idSection = document.getElementById('idCardSection');
        const idStatus = document.getElementById('idCardStatus');
        const idImg = document.getElementById('idPersonalImg');

        if (idName) idName.textContent = info.name ? capitalizeFirst(info.name) : '—';
        if (idStudent) idStudent.textContent = info.studentId || '—';
        if (idProgram) idProgram.textContent = info.course || '—';
        if (idContact) idContact.textContent = info.contact || '—';
        if (idYear) idYear.textContent = info.yearLevel || '—';
        if (idSection) idSection.textContent = info.section || '—';
        if (idStatus) idStatus.textContent = info.status === 'enrolled' ? 'Regular' : (info.status === 'irregular' ? 'Irregular' : (info.status || '—'));
        if (idImg && info.profileImage) idImg.src = info.profileImage;
    } catch (e) {
        console.warn('Unable to update ID card fields', e);
    }
}

function savePersonalInfo() {
    const yearInput = document.getElementById('personalYearLevel');
    let yearRaw = yearInput ? yearInput.value.trim() : '';
    let yearNum = parseInt(yearRaw, 10);
    if (!isNaN(yearNum)) {
        yearNum = Math.max(1, Math.min(7, yearNum));
        if (yearInput) yearInput.value = yearNum;
    } else {
        yearNum = '';
    }

    const info = {
        name: document.getElementById('personalName').value.trim(),
        studentId: document.getElementById('personalStudentId').value.trim(),
        email: document.getElementById('personalEmail').value.trim(),
        contact: document.getElementById('personalContact').value.trim(),
        course: document.getElementById('personalCourse').value.trim(),
        yearLevel: yearNum === '' ? '' : String(yearNum),
        section: document.getElementById('personalSection').value.trim(),
        status: document.getElementById('personalStatus').value
    };
    const preview = document.getElementById('personalPreview');
    if (preview && preview.src) {
        info.profileImage = preview.src;
    }

    try {
        localStorage.setItem('personalInfo', JSON.stringify(info));
    } catch (error) {
        console.warn('Unable to save personal info', error);
    }

    const headerName = document.querySelector('header h3');
    const headerStatus = document.querySelector('header h2');

    if (headerName) {
        const displayNameRaw = info.name || '';
        const displayName = displayNameRaw ? capitalizeFirst(displayNameRaw) : 'Unnamed';
        headerName.textContent = info.studentId ? `${displayName} | ${info.studentId}` : displayName;
    }
    if (headerStatus) {
        const statusLabel = info.status == 'enrolled' ? 'regular' : info.status == 'irregular' ? 'Irregular' : 'Enrollment Status';
        headerStatus.textContent = statusLabel;
    }
    try { updateIDCardFields(info); } catch (e) {  }
    closePersonalInfo();
}

function clearPersonalInfo() {
    document.getElementById('personalName').value = '';
    document.getElementById('personalStudentId').value = '';
    document.getElementById('personalEmail').value = '';
    document.getElementById('personalContact').value = '';
    document.getElementById('personalCourse').value = '';
    document.getElementById('personalYearLevel').value = '';
    document.getElementById('personalSection').value = '';
    document.getElementById('personalStatus').value = 'undeclared';
    
    const placeholderSrc = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrKbtCyHhFP45CksSozABS-HHCLJaWFLADRw&s';
    const preview = document.getElementById('personalPreview');
    const headerImg = document.querySelector('.profile-img');
    if (preview) preview.src = placeholderSrc;
    if (headerImg) headerImg.src = placeholderSrc;
}

function loadPersonalInfo() {
    const headerName = document.querySelector('header h3');
    const headerStatus = document.querySelector('header h2');

    if (headerName) {
        headerName.textContent = 'Unnamed';
    }

    if (headerStatus) {
        headerStatus.textContent = 'Enrollment Status';
    }

    const stored = localStorage.getItem('personalInfo');
    const placeholderSrc = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrKbtCyHhFP45CksSozABS-HHCLJaWFLADRw&s';
    if (!stored) {
        const preview = document.getElementById('personalPreview');
        const headerImg = document.querySelector('.profile-img');
        if (preview) preview.src = placeholderSrc;
        if (headerImg) headerImg.src = placeholderSrc;
        return;
    }

    try {
        const info = JSON.parse(stored);
        document.getElementById('personalName').value = info.name || '';
        document.getElementById('personalStudentId').value = info.studentId || '';
        document.getElementById('personalEmail').value = info.email || '';
        document.getElementById('personalContact').value = info.contact || '';
        document.getElementById('personalCourse').value = info.course || '';
        let storedYear = info.yearLevel || '';
        let storedYearNum = parseInt(storedYear, 10);
        if (!isNaN(storedYearNum)) {
            storedYearNum = Math.max(1, Math.min(7, storedYearNum));
            document.getElementById('personalYearLevel').value = storedYearNum;
        } else {
            document.getElementById('personalYearLevel').value = '';
        }
        document.getElementById('personalSection').value = info.section || '';
        document.getElementById('personalStatus').value = info.status || 'enrolled';

        const preview = document.getElementById('personalPreview');
        const headerImg = document.querySelector('.profile-img');
        if (info.profileImage) {
            if (preview) preview.src = info.profileImage;
            if (headerImg) headerImg.src = info.profileImage;
        } else {
            if (preview) preview.src = placeholderSrc;
            if (headerImg) headerImg.src = placeholderSrc;
        }

        if (headerName) {
            const displayNameRaw = info.name || '';
            const displayName = displayNameRaw ? capitalizeFirst(displayNameRaw) : 'Unnamed';
            headerName.textContent = info.studentId ? `${displayName} | ${info.studentId}` : displayName;
        }

    if (headerStatus) {
        const statusLabel = info.status === 'enrolled' ? 'Regular' : info.status === 'irregular' ? 'Irregular' : 'Enrollment Status';
        headerStatus.textContent = statusLabel;
    }  try { updateIDCardFields(info); } catch (e) { console.warn('Unable to populate ID preview fields', e); }
    } catch (error) {
        console.warn('Unable to load personal info', error);
    }
}

window.generateIDCard = function () {
    if (typeof html2canvas !== 'function') {
        alert('ID generation requires html2canvas. Check your internet connection.');
        return;
    }

    const card = document.querySelector('.id-card');
    if (!card) {
        alert('ID card element not found.');
        return;
    }
    html2canvas(card, { backgroundColor: null, scale: 2, useCORS: true })
        .then(canvas => {
            canvas.toBlob(function (blob) {
                if (!blob) {
                    alert('Failed to generate image.');
                    return;
                }
                const filenameBase = (document.getElementById('personalStudentId') && document.getElementById('personalStudentId').value.trim()) || 'student-id';
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${filenameBase}.png`;
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    URL.revokeObjectURL(link.href);
                    link.remove();
                }, 1000);
            }, 'image/png');
        })
        .catch(err => {
            console.error('html2canvas error', err);
            alert('Unable to generate ID image. If you are using an external profile image, upload a local image first.');
        });
};

document.addEventListener('DOMContentLoaded', loadPersonalInfo);

document.addEventListener('DOMContentLoaded', function () {
    const profile = document.querySelector('.profile-img');
    if (profile) profile.addEventListener('click', openPersonalInfo);

    const personalPanel = document.getElementById('personalInfoPanel');
    if (personalPanel) {
        const closeBtn = personalPanel.querySelector('.modal-close');
        if (closeBtn) closeBtn.addEventListener('click', closePersonalInfo);

        const saveBtn = personalPanel.querySelector('.personalinfo-btn');
        if (saveBtn) saveBtn.addEventListener('click', savePersonalInfo);
    }

    const profileInput = document.getElementById('profileImageInput');
    const previewImg = document.getElementById('personalPreview');
    const headerImg = document.querySelector('.profile-img');
    if (profileInput) {
        profileInput.addEventListener('change', function (e) {
            const file = (e.target.files && e.target.files[0]);
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function (ev) {
                const dataUrl = ev.target.result;
                if (previewImg) previewImg.src = dataUrl;
                if (headerImg) headerImg.src = dataUrl;
                const idImg = document.getElementById('idPersonalImg');
                if (idImg) idImg.src = dataUrl;
                try {
                    const stored = JSON.parse(localStorage.getItem('personalInfo') || '{}');
                    stored.profileImage = dataUrl;
                    localStorage.setItem('personalInfo', JSON.stringify(stored));
                } catch (err) {
                    console.warn('Unable to persist profile image', err);
                }
            };
            reader.readAsDataURL(file);
        });
    }
});
