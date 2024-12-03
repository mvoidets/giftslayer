import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Styles/Main.css';
import emailjs from 'emailjs-com';

interface User {
  name: string;
  email: string;
  message: string;
  selected?: string; // The person selected by this user
  hasSpun?: boolean; // Track if the user has spun
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [winners, setWinners] = useState<string[]>([]); // Track winner names here
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [spinner, setSpinner] = useState<string | null>(null); // The person who is spinning
  const [selectedUser, setSelectedUser] = useState<string | null>(null); // The selected person

  // Initialize EmailJS with your user ID
  emailjs.init(process.env.REACT_APP_EMAILJS_USER_ID!);

  const sendEmail = (spinnerUser: User, selectedName: string) => {
    const selectedUser = users.find(user => user.name === selectedName);
    const templateParams = {
      to_name: spinnerUser.name, // Send the email to the spinner
      to_email: spinnerUser.email, // Send to the spinner's email
      message: `Congratulations ${spinnerUser.name}! You have been selected as the Secret Santa for ${selectedName}. The selected user has provided the following gift ideas: ${selectedUser?.message}`,
    };

    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID!,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID!,
        templateParams
      )
      .then((response) => {
        console.log('Email sent successfully!', response.status, response.text);
      })
      .catch((error) => {
        console.error('Failed to send email.', error);
      });
  };

  const handleSubmit = () => {
    if (name && email && message) {
      setUsers([...users, { name, email, message }]);
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  const handleSpinnerSelection = (userName: string) => {
    setSpinner(userName); // Set the selected user as the spinner
  };

  const handleSpin = () => {
    if (!spinner) return; // No spinner selected
    const spinnerUser = users.find(user => user.name === spinner);
    if (!spinnerUser || spinnerUser.hasSpun) return; // Check if the spinner has already spun

    setSpinning(true);

    // Filter out users who have already been selected, are the spinner, or are in the winners list
    const remainingUsers = users.filter(
      user => !user.selected && user.name !== spinner && !winners.includes(user.name)
    );

    if (remainingUsers.length === 0) {
      return; // If no users are left to select, we do nothing
    }

    // Randomly select someone else from remaining users
    const randomUser = remainingUsers[Math.floor(Math.random() * remainingUsers.length)];
    setSelectedUser(randomUser.name); // Show selected user
    console.log(`${spinner} has selected ${randomUser.name}`);
    // Rotate the wheel (visual effect)
    const randomRotation = Math.floor(Math.random() * 360) + 3600; // Full rotations
    setRotationAngle(rotationAngle + randomRotation);

    setTimeout(() => {
      setSpinning(false);
      // After the spin, mark the spinner as having spun
      setUsers(users.map(user =>
        user.name === spinner
          ? { ...user, hasSpun: true } // Mark the spinner as having spun
          : user
      ));
    }, 5000); // Simulate the spinning duration
  };

  const handleConfirm = () => {
    if (selectedUser && spinner) {
      const spinnerUser = users.find(user => user.name === spinner);
      const selected = users.find(user => user.name === selectedUser);

      if (spinnerUser && selected) {
        // Send email to the spinner
        sendEmail(spinnerUser, selected.name);

        // Add the selected user to the winners list
        setWinners([...winners, selected.name]);

        // Mark the selected user as having selected someone
        setUsers(users.map(user =>
          user.name === spinner
            ? { ...user, selected: selected.name } // Mark the spinner as having selected someone
            : user
        ));

        // Reset spinner and selected user
        setSpinner(null);
        setSelectedUser(null);
      }
    }
  };

  const handleMasterEmail = () => {
    const selections = users.map(user => ({
      name: user.name,
      selected: user.selected,
    }));
    const adminEmail = prompt("Please enter the admin's email:");
    const templateParams = {
      to_name: 'Admin', // Or some other name
      to_email: adminEmail || '', // Admin's email
      message: JSON.stringify(selections, null, 2), // Format the selections in the email
    };

    emailjs.send(
      process.env.REACT_APP_EMAILJS_SERVICE_ID!,
      process.env.REACT_APP_EMAILJS_TEMPLATE_ID!,
      templateParams
    )
      .then((response) => {
        console.log('Master email sent successfully!', response.status, response.text);
      })
      .catch((error) => {
        console.error('Failed to send master email.', error);
      });
  };

  // Log the current state of users whenever it changes
  useEffect(() => {
    // console.log("Updated Users:", users);
    // console.log("Current Winners:", winners); // Log winners
  }, [users, winners]); // This will log whenever users or winners state changes

  const isGameOver = () => users.every(user => user.selected);

  return (
    <div className="form-container">
      <div className="video-background">
        <video autoPlay loop muted>
          <source src="/santa_list.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <h1 className="mb-4 text-center">Secret Santa Game</h1>
      <div className="container mt-5">
        <div className="row">
          {/* Form for adding users */}
          <div className="col-md-3">
            <h3 className="text-center mb-4">Add User</h3>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Gift Ideas</label>
              <textarea
                className="form-control"
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              Add User
            </button>
          </div>

          {/* Spinner selection */}
          <div className="col-md-3">
            <h3 className="text-center mb-4">Select Spinner</h3>
            {users.map((user) => (
              <div key={user.name}>
                <input
                  type="radio"
                  id={user.name}
                  name="spinner"
                  checked={spinner === user.name}
                  onChange={() => handleSpinnerSelection(user.name)}
                />
                <label htmlFor={user.name}>
                  {user.name} {user.hasSpun && "(Already Spun)"}
                </label>
              </div>
            ))}
          </div>

          {/* Spinner's turn */}
          <div className="col-md-3">
            <h3 className="text-center mb-4">Spin</h3>
            <div
              className="spinner-container"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: spinning ? 'transform 5s ease-out' : 'none',
              }}
            >
              <div className="spinner"></div>
            </div>
            <button type="button" className="btn btn-primary mt-3" onClick={handleSpin} disabled={!spinner || spinning}>
              Spin
            </button>
          </div>

          {/* Selected user */}
          <div className="col-md-3">
            <h2 className="text-center mb-4">Selected User</h2>
            {users.map((user) => (
              <p key={user.name}>
                {user.name} {winners.includes(user.name) && "(Already Won)"}
              </p>
            ))}
            {selectedUser && <p><strong>Currently Selected:</strong> {selectedUser}</p>}
          </div>
        </div>
      </div>

      {/* Show Final Button */}
      {users.every(user => user.hasSpun) && (
        <div className="mt-3">
          <button type="button" className="btn btn-success" onClick={handleMasterEmail}>
            Send Final Selections Email
          </button>
        </div>
      )}

      {/* Confirm Selection */}
      {selectedUser && (
        <div className="mt-3">
          <button type="button" className="btn btn-success" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
