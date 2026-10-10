const form = document.getElementById("sessionForm");
const scheduleBody = document.getElementById("scheduleBody");
const message = document.getElementById("message");

let sessions = [];

// Safely load sessions from localStorage
try {
    sessions = JSON.parse(localStorage.getItem("labSessions") || "[]");
    if (!Array.isArray(sessions)) sessions = [];
} catch (error) {
    sessions = [];
}

function hasConflict(first, second) {
    // Different time slots never conflict
    if (first.time !== second.time) {
        return false;
    }

    const sameLab = first.lab.toLowerCase() === second.lab.toLowerCase();
    const sameInstructor = first.instructor.toLowerCase() === second.instructor.toLowerCase();
    
    // Optional: Only flag equipment conflict if they are in the same lab, 
    // or keep it strict only if equipment inventory is limited. 
    // Here we restrict conflict to Lab and Instructor double-booking:
    return sameLab || sameInstructor;
}

function saveSessions() {
    localStorage.setItem("labSessions", JSON.stringify(sessions));
}

function renderSchedule() {
    scheduleBody.replaceChildren();

    let conflictCount = 0;

    sessions.forEach((session, index) => {
        const hasClash = sessions.some((other, otherIndex) =>
            index !== otherIndex && hasConflict(session, other)
        );

        if (hasClash) {
            conflictCount++;
        }

        const row = document.createElement("tr");

        [
            session.experiment,
            session.group,
            session.lab,
            session.equipment,
            session.instructor,
            session.time
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.type = "button";
        deleteButton.className = "delete-button";

        // Added deletion confirmation to prevent accidents
        deleteButton.addEventListener("click", () => {
            if (confirm(`Are you sure you want to delete the session for "${session.experiment}"?`)) {
                sessions.splice(index, 1);
                saveSessions();
                renderSchedule();

                message.textContent = "Session deleted successfully.";
                message.style.color = "#047857";
            }
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        if (hasClash) {
            row.style.backgroundColor = "#fee2e2";
            row.title = "Resource conflict: Lab or Instructor is double-booked at this time.";
        }

        scheduleBody.appendChild(row);
    });

    // Update counters safely
    document.getElementById("experimentCount").textContent =
        new Set(sessions.map(s => s.experiment.toLowerCase())).size;

    document.getElementById("sessionCount").textContent = sessions.length;
    document.getElementById("conflictCount").textContent = conflictCount;

    const emptyMsg = document.getElementById("emptyMessage");
    if (emptyMsg) emptyMsg.hidden = sessions.length > 0;
}

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const newSession = {
        experiment: document.getElementById("experiment").value.trim(),
        group: document.getElementById("group").value.trim(),
        lab: document.getElementById("lab").value.trim(),
        equipment: document.getElementById("equipment").value.trim(),
        instructor: document.getElementById("instructor").value.trim(),
        time: document.getElementById("time").value
    };

    if (Object.values(newSession).some(value => !value)) {
        message.textContent = "Please fill in all fields.";
        message.style.color = "#b91c1c";
        return;
    }

    const clashes = sessions.some(session => hasConflict(newSession, session));

    sessions.push(newSession);

    try {
        saveSessions();
    } catch (error) {
        message.textContent = "Could not save sessions in this browser.";
        message.style.color = "#b91c1c";
        return;
    }

    renderSchedule();
    form.reset();

    if (clashes) {
        message.textContent = "Warning: Resource conflict detected (Lab/Instructor double-booked)! Check the red rows.";
        message.style.color = "#b91c1c";
    } else {
        message.textContent = "Session added successfully!";
        message.style.color = "#047857";
    }
});

renderSchedule();