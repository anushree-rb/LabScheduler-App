import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDo168X33WjoRH9g7K1K6XTQQcTQJlmgns",
  authDomain: "labscheduler-3d8dc.firebaseapp.com",
  projectId: "labscheduler-3d8dc",
  storageBucket: "labscheduler-3d8dc.firebasestorage.app",
  messagingSenderId: "711408547383",
  appId: "1:711408547383:web:9b87061be0023a30df31b2",
  measurementId: "G-YS8HZYQ8E5"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get DOM Elements
const sessionForm = document.getElementById("sessionForm");
const scheduleBody = document.getElementById("scheduleBody");

// 1. Real-time Listener
onSnapshot(
  collection(db, "sessions"),
  (snapshot) => {
    const sessions = [];
    snapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    renderSchedule(sessions);
  },
  (error) => {
    console.error("Firestore sync error:", error);
    if (scheduleBody) {
      scheduleBody.innerHTML = `<tr><td colspan="8" class="text-danger text-center">Error loading data: ${error.message}</td></tr>`;
    }
  }
);

// 2. Render Schedule Function
function renderSchedule(sessions) {
  if (!scheduleBody) return;
  scheduleBody.innerHTML = "";

  if (sessions.length === 0) {
    scheduleBody.innerHTML = `<tr><td colspan="8" class="text-center">No sessions scheduled yet.</td></tr>`;
    return;
  }

  sessions.forEach((session) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${session.labRoom || "N/A"}</td>
      <td>${session.experiment || "N/A"}</td>
      <td>${session.equipment || "N/A"}</td>
      <td>${session.faculty || "N/A"}</td>
      <td>${session.group || "N/A"}</td>
      <td>${session.date || "N/A"}</td>
      <td>${session.time || "N/A"}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteSession('${session.id}')">Delete</button>
      </td>
    `;
    scheduleBody.appendChild(row);
  });
}

// 3. Add New Session
if (sessionForm) {
  sessionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const labRoom = document.getElementById("labRoom")?.value;
    const experiment = document.getElementById("experiment")?.value;
    const equipment = document.getElementById("equipment")?.value;
    const faculty = document.getElementById("faculty")?.value;
    const group = document.getElementById("group")?.value;
    const date = document.getElementById("date")?.value;
    const time = document.getElementById("time")?.value;

    try {
      await addDoc(collection(db, "sessions"), {
        labRoom,
        experiment,
        equipment,
        faculty,
        group,
        date,
        time,
        createdAt: new Date()
      });
      sessionForm.reset();
    } catch (error) {
      console.error("Error adding session: ", error);
      alert("Failed to add session: " + error.message);
    }
  });
}

// 4. Delete Session Function
window.deleteSession = async function (id) {
  if (confirm("Are you sure you want to delete this scheduled session?")) {
    try {
      await deleteDoc(doc(db, "sessions", id));
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session: " + error.message);
    }
  }
};