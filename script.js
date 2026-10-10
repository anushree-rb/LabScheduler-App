const form = document.getElementById("sessionForm");
const scheduleBody = document.getElementById("scheduleBody");
const message = document.getElementById("message");

let sessions = [];

// Safely load sessions from localStorage
// Listen for real-time updates from Firestore
window.onSnapshot(window.collection(window.db, "sessions"), (snapshot) => {
  sessions = [];
  snapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() });
  });
  renderSessions(); // This calls your existing function that draws the table/list on screen
});
form.addEventListener("submit", async function(event) {
  event.preventDefault();

  // 1. Check for empty fields
  if (!nameInput.value || !timeInput.value) {
    message.textContent = "Please fill in all fields.";
    message.style.color = "#b91c1c";
    return;
  }

  // 2. Prepare the new session object
  const newSession = {
    name: nameInput.value,
    time: timeInput.value,
    createdAt: new Date()
  };

  // 3. Save directly to Firebase Firestore
  try {
    await window.addDoc(window.collection(window.db, "sessions"), newSession);

    message.textContent = "Session booked successfully!";
    message.style.color = "#16a34a";
    form.reset();
  } catch (error) {
    console.error("Firestore Error:", error);
    message.textContent = "Could not save session to database.";
    message.style.color = "#b91c1c";
  }
});

renderSchedule();