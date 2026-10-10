const form = document.getElementById("sessionForm");
const scheduleBody = document.getElementById("scheduleBody");
const message = document.getElementById("message");

let sessions = [];

// 1. Listen for real-time updates from Firestore
window.onSnapshot(window.collection(window.db, "sessions"), (snapshot) => {
  sessions = [];
  snapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() });
  });
  renderSchedule();
});

// 2. Handle form submission
if (form) {
  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // Get input elements safely
    const experimentNameInput = document.getElementById("experimentName");
    const studentGroupInput = document.getElementById("studentGroup");
    const laboratoryInput = document.getElementById("laboratory");
    const equipmentInput = document.getElementById("requiredEquipment");
    const instructorInput = document.getElementById("instructor");
    const timeSlotInput = document.getElementById("timeSlot");

    // Validate required fields
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
}

// Render schedule function (keep your existing implementation if you have one)
function renderSchedule() {
  // If your project already defines renderSchedule(), this will use it.
  // Otherwise, ensure it loops through `sessions` and displays them in your table/list.
}