// Import Firebase SDK modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration for LabScheduler
const firebaseConfig = {
  apiKey: "AIzaSy...", // Your API Key
  authDomain: "labscheduler-89a54.firebaseapp.com",
  projectId: "labscheduler-89a54",
  storageBucket: "labscheduler-89a54.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get DOM Elements
const sessionForm = document.getElementById("sessionForm");
const scheduleBody = document.getElementById("scheduleBody");

// 1. Real-time Listener (Updates automatically on all devices)
onSnapshot(collection(db, "sessions"), (snapshot) => {
  const sessions = [];
  snapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() });
  });
  renderSchedule(sessions);
}, (error) => {
  console.error("Firestore sync error:", error);
  if (scheduleBody) {
    scheduleBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Error loading data: ${error.message}</td></tr>`;
  }
});

// 2. Form Submission Handler
if (sessionForm) {
  sessionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const facultyName = document.getElementById("facultyName").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const labName = document.getElementById("labName").value.trim();
    const date = document.getElementById("date").value;
    const timeSlot = document.getElementById("timeSlot").value;

    try {
      await addDoc(collection(db, "sessions"), {
        facultyName,
        subject,
        labName,
        date,
        timeSlot,
        createdAt: new Date()
      });

      alert("Session added successfully!");
      sessionForm.reset();
    } catch (error) {
      console.error("Error adding session:", error);
      alert("Failed to add session: " + error.message);
    }
  });
}

// 3. Render Table Rows
function renderSchedule(sessions) {
  if (!scheduleBody) return;
  scheduleBody.innerHTML = "";

  if (sessions.length === 0) {
    scheduleBody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No scheduled sessions found.</td></tr>`;
    return;
  }

  sessions.forEach((session) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${session.facultyName || 'N/A'}</td>
      <td>${session.subject || 'N/A'}</td>
      <td>${session.labName || 'N/A'}</td>
      <td>${session.date || 'N/A'}</td>
      <td>${session.timeSlot || 'N/A'}</td>
    `;
    scheduleBody.appendChild(row);
  });
}