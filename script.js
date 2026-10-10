const form = document.getElementById("sessionForm");
const scheduleBody = document.getElementById("scheduleBody");
const message = document.getElementById("message");
const nameInput = document.getElementById("nameInput");   // Replace "nameInput" with your actual HTML input ID for the name
const timeInput = document.getElementById("timeInput");   // Replace "timeInput" with your actual HTML input ID for the time

let sessions = [];

// Safely load sessions from localStorage
// Listen for real-time updates from Firestore
window.onSchedule(window.collection(window.db, "sessions"), (snapshot) => {
  sessions = [];
  snapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() });
  });
  renderSchedule(); // This calls your existing function that draws the table/list on screen
});
form.addEventListener("submit", async function(event) {
  event.preventDefault();

  // Get input elements from your HTML form
  const experimentNameInput = document.getElementById("experimentName") || document.querySelector("input[placeholder*='Experiment']");
  const studentGroupInput = document.getElementById("studentGroup") || document.querySelector("input[placeholder*='Group']");
  const laboratoryInput = document.getElementById("laboratory") || document.querySelector("input[placeholder*='Lab']");
  const equipmentInput = document.getElementById("requiredEquipment") || document.querySelector("input[placeholder*='Equipment']");
  const instructorInput = document.getElementById("instructor") || document.querySelector("input[placeholder*='Instructor']");
  const timeSlotInput = document.getElementById("timeSlot") || document.querySelector("input[type='datetime-local'], select");

  // Validate fields
  if (!experimentNameInput?.value || !timeSlotInput?.value) {
    if (message) {
      message.textContent = "Please fill in the required fields.";
      message.style.color = "#b91c1c";
    }
    return;
  }

  // Build session object for Firestore
  const newSession = {
    experimentName: experimentNameInput.value,
    studentGroup: studentGroupInput?.value || "",
    laboratory: laboratoryInput?.value || "",
    requiredEquipment: equipmentInput?.value || "",
    instructor: instructorInput?.value || "",
    timeSlot: timeSlotInput.value,
    createdAt: new Date()
  };

  try {
    // Save to Firestore
    await window.addDoc(window.collection(window.db, "sessions"), newSession);

    if (message) {
      message.textContent = "Session booked successfully!";
      message.style.color = "#16a34a";
    }
    form.reset();
  } catch (error) {
    console.error("Firestore Error:", error);
    if (message) {
      message.textContent = "Could not save session to database.";
      message.style.color = "#b91c1c";
    }
  }
});
renderSchedule();