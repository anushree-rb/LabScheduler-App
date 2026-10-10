// Import Firebase SDK modules (Auth + Firestore)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const authSection = document.getElementById("authSection");
const dashboardSection = document.getElementById("dashboardSection");
const authForm = document.getElementById("authForm");
const authTitle = document.getElementById("authTitle");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const toggleAuthMode = document.getElementById("toggleAuthMode");
const userEmailDisplay = document.getElementById("userEmailDisplay");
const logoutBtn = document.getElementById("logoutBtn");

const sessionForm = document.getElementById("sessionForm");
const scheduleBody = document.getElementById("scheduleBody");

let isSignUp = false;

// 1. Toggle between Login and Sign Up mode
toggleAuthMode.addEventListener("click", () => {
  isSignUp = !isSignUp;
  if (isSignUp) {
    authTitle.innerText = "Faculty Sign Up";
    authSubmitBtn.innerText = "Register";
    toggleAuthMode.innerText = "Already have an account? Login";
  } else {
    authTitle.innerText = "Faculty Login";
    authSubmitBtn.innerText = "Login";
    toggleAuthMode.innerText = "Don't have an account? Sign Up";
  }
});

// 2. Handle Login / Sign Up Submission
authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();

  try {
    if (isSignUp) {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Account created successfully!");
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
  } catch (error) {
    console.error("Authentication error:", error);
    alert("Authentication failed: " + error.message);
  }
});

// 3. Handle Logout
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
  }
});

// 4. Monitor Auth State (Switch UI based on login status)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is logged in -> Show dashboard, hide login
    authSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");
    userEmailDisplay.innerText = `Logged in as: ${user.email}`;
    loadSessions();
  } else {
    // User is logged out -> Show login, hide dashboard
    authSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");
  }
});

// 5. Real-time Firestore Sync (Only runs when logged in)
let unsubscribe = null;
function loadSessions() {
  if (unsubscribe) unsubscribe(); // Prevent duplicate listeners

  unsubscribe = onSnapshot(collection(db, "sessions"), (snapshot) => {
    const sessions = [];
    snapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    renderSchedule(sessions);
  }, (error) => {
    console.error("Firestore sync error:", error);
  });
}

// 6. Form Submission Handler for New Sessions
if (sessionForm) {
  sessionForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const facultyName = document.getElementById("facultyName").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const experiment = document.getElementById("experiment").value.trim();
    const equipment = document.getElementById("equipment").value.trim();
    const labName = document.getElementById("labName").value.trim();
    const date = document.getElementById("date").value;
    const timeSlot = document.getElementById("timeSlot").value;

    try {
      await addDoc(collection(db, "sessions"), {
        facultyName,
        subject,
        experiment,
        equipment,
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

// 7. Render Table Rows
function renderSchedule(sessions) {
  if (!scheduleBody) return;
  scheduleBody.innerHTML = "";

  if (sessions.length === 0) {
    scheduleBody.insurance = "";
    scheduleBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No scheduled sessions found.</td></tr>`;
    return;
  }

  sessions.forEach((session) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${session.facultyName || 'N/A'}</td>
      <td>${session.subject || 'N/A'}</td>
      <td>${session.experiment || 'N/A'}</td>
      <td>${session.equipment || 'N/A'}</td>
      <td>${session.labName || 'N/A'}</td>
      <td>${session.date || 'N/A'}</td>
      <td>${session.timeSlot || 'N/A'}</td>
    `;
    scheduleBody.appendChild(row);
  });
}