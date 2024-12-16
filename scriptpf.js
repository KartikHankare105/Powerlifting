let lifters = [];
let currentRound = 1;
let currentLift = 'squat';

function addLifter() {
    const name = document.getElementById('lifterName').value.trim();
    const squatFirst = parseFloat(document.getElementById('squatFirst').value);
    const benchFirst = parseFloat(document.getElementById('benchFirst').value);
    const deadliftFirst = parseFloat(document.getElementById('deadliftFirst').value);

    if (name && squatFirst && benchFirst && deadliftFirst) {
        lifters.push({
            name,
            squat: [{ weight: squatFirst, success: null }, {}, {}],
            bench: [{ weight: benchFirst, success: null }, {}, {}],
            deadlift: [{ weight: deadliftFirst, success: null }, {}, {}],
            bestSquat: 0,
            bestBench: 0,
            bestDeadlift: 0,
            washout: false
        });
        updateLifterList();
        clearForm();
    }
}

function updateLifterList() {
    const list = document.getElementById('liftersList');
    list.innerHTML = '';
    lifters.forEach(lifter => {
        const li = document.createElement('li');
        li.textContent = `${lifter.name} - Squat: ${lifter.squat[0].weight}kg, Bench: ${lifter.bench[0].weight}kg, Deadlift: ${lifter.deadlift[0].weight}kg`;
        list.appendChild(li);
    });
}

function clearForm() {
    document.getElementById('lifterName').value = '';
    document.getElementById('squatFirst').value = '';
    document.getElementById('benchFirst').value = '';
    document.getElementById('deadliftFirst').value = '';
}

function startRounds() {
    document.getElementById('registration').style.display = 'none';
    document.getElementById('rounds').style.display = 'block';
    updateRoundTable();
}

function updateRoundTable() {
    const tableBody = document.querySelector('#roundTable tbody');
    tableBody.innerHTML = '';
    lifters.forEach((lifter, index) => {
        if (lifter.washout) return;

        const attempts = lifter[currentLift];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${lifter.name}</td>
            ${attempts.map((attempt, i) => `
                <td>
                    <input type="number" step="0.1" value="${attempt.weight || ''}" id="weight${index}-${i}">
                    <button onclick="recordAttempt(${index}, ${i}, true)">Lift</button>
                    <button onclick="recordAttempt(${index}, ${i}, false)">No Lift</button>
                </td>
            `).join('')}
            <td>${lifter[`best${capitalize(currentLift)}`]}kg</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('roundTitle').textContent = `${capitalize(currentLift)} Round ${currentRound}`;
}

function recordAttempt(index, attempt, success) {
    const weightInput = document.getElementById(`weight${index}-${attempt}`);
    const weight = parseFloat(weightInput.value);

    if (weight) {
        const lifter = lifters[index];
        lifter[currentLift][attempt] = { weight, success };

        if (success && weight > lifter[`best${capitalize(currentLift)}`]) {
            lifter[`best${capitalize(currentLift)}`] = weight;
        }

        weightInput.parentNode.classList.add(success ? 'success' : 'failure');
        checkWashout(lifter);
    }
}

function checkWashout(lifter) {
    if (
        lifter.squat.every(attempt => attempt.success === false) ||
        lifter.bench.every(attempt => attempt.success === false) ||
        lifter.deadlift.every(attempt => attempt.success === false)
    ) {
        lifter.washout = true;
    }
}

function nextRound() {
    if (currentRound === 3 && currentLift === 'deadlift') {
        displayResults();
        return;
    }

    if (currentRound === 3) {
        currentRound = 1;
        currentLift = currentLift === 'squat' ? 'bench' : 'deadlift';
    } else {
        currentRound++;
    }
    updateRoundTable();
}

function displayResults() {
    document.getElementById('rounds').style.display = 'none';
    document.getElementById('results').style.display = 'block';

    const resultsTable = document.getElementById('resultsTable');
    resultsTable.innerHTML = '';
    lifters.forEach(lifter => {
        if (!lifter.washout) {
            const total = lifter.bestSquat + lifter.bestBench + lifter.bestDeadlift;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${lifter.name}</td>
                <td>${lifter.bestSquat}kg</td>
                <td>${lifter.bestBench}kg</td>
                <td>${lifter.bestDeadlift}kg</td>
                <td>${total}kg</td>
            `;
            resultsTable.appendChild(row);
        }
    });
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
