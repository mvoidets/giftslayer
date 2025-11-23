import React, { useState, useEffect } from "react";
import emailjs from "emailjs-com";
import "./Styles/Main.css";

interface User {
  name: string;
  email: string;
  message: string;
  selected?: string;  // Who they got assigned
}

interface Match {
  giver: string;
  receiver: string;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Initialize EmailJS
  useEffect(() => {
    emailjs.init(process.env.REACT_APP_EMAILJS_USER_ID!);
  }, []);

  // ------------------------------
  // Add a new user
  // ------------------------------
  const handleAddUser = () => {
    if (!name || !email || !message) {
      alert("Please fill all fields");
      return;
    }

    setUsers([...users, { name, email, message }]);
    setName("");
    setEmail("");
    setMessage("");
  };

  // ------------------------------
  // Generate ALL Secret Santa matches at once
  // ------------------------------

const handleGenerateAll = () => {
  if (users.length < 2) {
    alert("Need at least 2 users");
    return;
  }

  const givers = users.map((u) => u.name);
  let receivers = [...givers];

  // Shuffle receivers
  receivers = receivers.sort(() => Math.random() - 0.5);

  // Fix self-matches
  for (let i = 0; i < givers.length; i++) {
    if (givers[i] === receivers[i]) {
      const swapIndex = i === 0 ? 1 : i - 1;
      [receivers[i], receivers[swapIndex]] = [
        receivers[swapIndex],
        receivers[i],
      ];
    }
  }

  // Build matches internally
  const fullMatches: Match[] = givers.map((giver, i) => ({
    giver,
    receiver: receivers[i],
  }));

  // ------------------------
  // Save to localStorage with new key names
  // ------------------------
  const storageMatches = fullMatches.map(m => ({
    SecretSanta: m.giver,
    giftee: m.receiver
  }));

  localStorage.setItem("matchSelected", JSON.stringify(storageMatches));

  // ------------------------
  // Update users state
  // ------------------------
  const updatedUsers = users.map((u) => ({
    ...u,
    selected: fullMatches.find((m) => m.giver === u.name)?.receiver || "",
  }));
  setUsers(updatedUsers);

  // ------------------------
  // Auto-send emails to each giver
  // ------------------------
  fullMatches.forEach((match) => {
    handleSendEmail(match.giver);
  });

  alert("All Secret Santa assignments generated and emailed!");
};

  // ------------------------------
  // Send an email to a single participant
  // ------------------------------
  const handleSendEmail = (giverName: string) => {
    const giver = users.find((u) => u.name === giverName);
    if (!giver || !giver.selected) return;

    const receiver = users.find((u) => u.name === giver.selected);

    const params = {
      to_name: giver.name,
      to_email: giver.email,
      message: `Hi ${giver.name}! You are Secret Santa for ${receiver?.name}. Their gift ideas: ${receiver?.message}`,
    };

    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID!,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID!,
        params
      )
      .then(() => alert(`${giver.name}'s email sent!`))
      .catch(() => alert("Email failed"));
  };

  // ------------------------------
  // Admin Master Email
  // ------------------------------
  const handleMasterEmail = () => {
    const matches = JSON.parse(
      localStorage.getItem("matchSelected") || "[]"
    ) as Match[];

    if (matches.length === 0) {
      alert("No matches found");
      return;
    }

    const adminEmail = prompt("Admin Email:");
    if (!adminEmail) return;

    const params = {
      to_name: "Admin",
      to_email: adminEmail,
      message: JSON.stringify(matches, null, 2),
    };

    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID!,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID!,
        params
      )
      .then(() => alert("Master list sent!"))
      .catch(() => alert("Failed to send master email"));
  };

  // ------------------------------
  // View stored master list
  // ------------------------------
  const handleViewMasterList = () => {
   const matches = JSON.parse(
    localStorage.getItem("matchSelected") || "[]"
  ) as { SecretSanta: string; giftee: string }[];

  if (matches.length === 0) {
    alert("No matches stored yet");
    return;
  }

    const output = matches
      .map((m) => `${m.SecretSanta} → ${m.giftee}`)
      .join("\n");

    alert("Secret Santa Master List:\n\n" + output);
  };

  // ------------------------------
  // Reset everything
  // ------------------------------
  const handleReset = () => {
    if (window.confirm("Clear everything?")) {
      localStorage.removeItem("matchSelected");
      setUsers([]);
    }
  };

  // ------------------------------
  // UI Rendering
  // ------------------------------
  return (
    <div className="container mt-5">
      <div className="video-background">
        <video autoPlay loop muted>
          <source src="/santa_list.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <h1 className="text-center mb-4 w-50 text-white">Secret Santa Generator</h1>

      {/* Add User Form */}
      <div className="card p-3 mb-4 w-50 opacity-75">
        <h3>Add User</h3>
        <input
          className="form-control mb-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="form-control mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <textarea
          className="form-control mb-2"
          placeholder="Gift Ideas"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleAddUser}>
          Add User
        </button>
      </div>

      {/* User List */}
      <div className="card p-3 mb-4 w-50 opacity-75">
        <h3>Users</h3>
        {users.length === 0 && <p>No users added</p>}
        {users.map((u) => (
          <div key={u.name}>
            {u.name} – {u.selected ? `Assigned: ${u.selected}` : "Not assigned"}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-column gap-2 w-50">
        <button className="btn btn-success" onClick={handleGenerateAll}>
          Generate All Matches
        </button>

        <button className="btn btn-info" onClick={handleViewMasterList}>
          View Master List
        </button>

        <button className="btn btn-warning" onClick={handleMasterEmail}>
          Email Master List to Admin
        </button>

        {/* <button
          className="btn btn-secondary"
          onClick={() => {
            const giver = prompt("Whose email do you want to send?");
            if (giver) handleSendEmail(giver);
          }}
        >
          Send Individual Email
        </button> */}

        <button className="btn btn-danger" onClick={handleReset}>
          Reset All
        </button>
      </div>
    </div>
  );
};

export default App;
