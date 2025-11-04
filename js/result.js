const DATE_FORMATS = [
    { value: 'full', label: 'Полный формат (1 ноября 2025 - Пятница)' },
    { value: 'short', label: 'Краткий формат (01.11.2025)' },
    { value: 'iso', label: 'ISO формат (2025-11-01)' },
    { value: 'day', label: 'Только дни недели' },
    { value: 'markdown', label: 'Markdown список' }
];

const DAY_NAMES = {
    0: 'Воскресенье',
    1: 'Понедельник',
    2: 'Вторник',
    3: 'Среда',
    4: 'Четверг',
    5: 'Пятница',
    6: 'Суббота'
};

function toggleMainMenu(show = false) {
    const mainMenu = document.getElementById('anchous');
    if (mainMenu) {
        mainMenu.style.display = show ? 'block' : 'none';
        if (show) {
            mainMenu.style.animation = 'fadeIn 0.3s ease-out forwards';
        }
    }
}

function validateDates(startDate, endDate) {
    if (!startDate || !endDate) {
        alert('Пожалуйста, выберите обе даты');
        return false;
    }
    if (startDate > endDate) {
        alert('Дата начала не может быть позже даты окончания');
        return false;
    }
    return true;
}

function getSelectedDays() {
    return {
        1: document.getElementById("mon").checked,
        2: document.getElementById("tue").checked,
        3: document.getElementById("wed").checked,
        4: document.getElementById("thu").checked,
        5: document.getElementById("fri").checked,
        6: document.getElementById("sat").checked,
        0: document.getElementById("sun").checked
    };
}


function findMatchingDates(startDate, endDate, selectedDays) {
    let matchingDates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        if (selectedDays[currentDate.getDay()]) {
            matchingDates.push({
                date: new Date(currentDate),
                dayName: DAY_NAMES[currentDate.getDay()]
            });
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return matchingDates;
}

// Форматирование дат
function formatDates(matchingDates, format) {
    return matchingDates.map(item => {
        switch(format) {
            case 'full':
                return `${item.date.toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })} - ${item.dayName}`;
            case 'short':
                return item.date.toLocaleDateString('ru-RU');
            case 'iso':
                return item.date.toISOString().split('T')[0];
            case 'day':
                return item.dayName;
            case 'markdown':
                return `- ${item.date.toLocaleDateString('ru-RU')} (${item.dayName})`;
            default:
                return `${item.date.toLocaleDateString('ru-RU')} - ${item.dayName}`;
        }
    }).join('\\n');
}


function createFormatSelect() {
    const formatSelect = document.createElement('select');
    formatSelect.className = 'format-select';
    
    DATE_FORMATS.forEach(format => {
        const option = document.createElement('option');
        option.value = format.value;
        option.textContent = format.label;
        formatSelect.appendChild(option);
    });
    
    return formatSelect;
}

function showCopyNotification() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-copy';
    successMessage.textContent = 'Даты скопированы!';
    document.body.appendChild(successMessage);
    
    setTimeout(() => {
        successMessage.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => document.body.removeChild(successMessage), 300);
    }, 2000);
}

function createResultUI(matchingDates) {
    const resultDiv = document.createElement('div');
    resultDiv.className = 'modal-result';

    const header = document.createElement('h3');
    header.textContent = `Найдено дат: ${matchingDates.length}`;
    resultDiv.appendChild(header);

    matchingDates.forEach((item, index) => {
        const dateString = item.date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const dateLine = document.createElement('p');
        dateLine.textContent = `${dateString} - ${item.dayName}`;
        dateLine.style.animationDelay = `${index * 0.05}s`;
        resultDiv.appendChild(dateLine);
    });

    const formatSelect = createFormatSelect();
    resultDiv.appendChild(formatSelect);

    const buttonGroup = createButtonGroup(resultDiv, formatSelect, matchingDates);
    resultDiv.appendChild(buttonGroup);

    return resultDiv;
}

function createButtonGroup(resultDiv, formatSelect, matchingDates) {
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const copyButton = document.createElement('button');
    copyButton.textContent = 'Копировать';
    copyButton.className = 'copy-button';
    copyButton.onclick = () => {
        const formattedDates = formatDates(matchingDates, formatSelect.value);
        navigator.clipboard.writeText(formattedDates).then(() => {
            showCopyNotification();
        });
    };

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Закрыть';
    closeButton.className = 'close-button';
    closeButton.onclick = () => {
        resultDiv.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(resultDiv);
            toggleMainMenu(true);
        }, 300);
    };

    buttonGroup.appendChild(copyButton);
    buttonGroup.appendChild(closeButton);
    return buttonGroup;
}

function calculate() {
    try {
        toggleMainMenu(false);

        if (!window.datepicker1 || !window.datepicker2) {
            alert('Датапикеры ещё не инициализированы. Пожалуйста, обновите страницу и попробуйте снова.');
            toggleMainMenu(true);
            return;
        }

        const startDate = (window.datepicker1.selectedDates || [])[0];
        const endDate = (window.datepicker2.selectedDates || [])[0];

        if (!validateDates(startDate, endDate)) {
            toggleMainMenu(true);
            return;
        }

        const selectedDays = getSelectedDays();
        if (!selectedDays) {
            alert('Ошибка получения выбранных дней недели');
            toggleMainMenu(true);
            return;
        }

        const matchingDates = findMatchingDates(startDate, endDate, selectedDays);
        const resultUI = createResultUI(matchingDates);

        document.body.appendChild(resultUI);
        return matchingDates.length;
    } catch (err) {
        console.error('calculate error:', err);
        alert('Произошла ошибка при расчёте. Посмотрите консоль для деталей.');
        toggleMainMenu(true);
    }
}