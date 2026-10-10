// Import Firebase functions directly from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your Firebase Configuration (replace with your config if different)
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "labscheduler-89a54.firebaseapp.com",
  projectId: "labscheduler-89a54",
  storageBucket: "labscheduler-89a54.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get DOM Elements
const sessionForm = document.getElementById("sessionForm");
const scheduleBody = document.getElementById("scheduleBody");

// ==========================================
// 1. Real-Time Sync Listener (onSnapshot)
// ==========================================
onSnapshot(collection(db, "sessions"), (snapshot) => {
  const sessions = [];
  snapshot.forEach((doc) => {
    sessions.push({ id: doc.id, ...doc.data() });
  });
  renderSchedule(sessions);
}, (error) => {
  console.error("Firestore sync error:", error);
});

// ==========================================
// 2. Add Session Form Handler
// ==========================================
if (sessionForm) {
  sessionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const facultyName = document.getElementById("facultyName").value;
    const subject = document.getElementById("subject").value;
    const labName = document.getElementById("labName").value;
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
      console.error("Error adding document: ", error);
      alert("Failed to add session: " + error.message);
    }
  });
}

// ==========================================
// 3. Render Sessions Function
// ==========================================
function renderSchedule(sessions) {
  if (!scheduleBody) return;
  scheduleBody.innerHTML = "";

  if (sessions.length === 0) {
    scheduleBody.innerHTML = `<tr><td colspan="5" style="text-align:center;">No sessions scheduled yet.</td></tr>`;
    return;
  }

  sessions.forEach((session) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${session.facultyName || ''}</td>
      <td>${session.subject || ''}</td>
      <td>${session.labName || ''}</td>
      <td>${session.date || ''}</td>
      <td>${session.timeSlot || ''}</td>
    `;
    scheduleBody.appendChild(row);
  });
}