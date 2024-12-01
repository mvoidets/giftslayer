import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Styles/Main.css'; 
import emailjs from 'emailjs-com';

interface User {
  name: string;
  email: string;
  message: string;
  selected?: string; // Added selected field to store who the user selected
  hasSpun?: boolean; // Added hasSpun field to track if the user has spun
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [spinning, setSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [spinner, setSpinner] = useState<string | null>(null); // The person who is spinning
  const [selectedUser, setSelectedUser] = useState<string | null>(null); // The selected person
  const [gameOver, setGameOver] = useState(false);

  // Initialize EmailJS with your user ID
  emailjs.init(process.env.REACT_APP_EMAILJS_USER_ID!);

  const sendEmail = (user: User, selectedName: string) => {
    const templateParams = {
      to_name: user.name,
      to_email: user.email,
      message: `Congratulations ${user.name}! You have been selected as the Secret Santa for ${selectedName}! They have provided the following gift ideas: ${user.message}`,
    };
    console.log('user name:', user.name);
    console.log('user email:', user.email);

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

  // Add user to the list
  const handleSubmit = () => {
    if (name && email && message) {
      setUsers([...users, { name, email, message }]);
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  // Select a spinner
  const handleSpinnerSelection = (userName: string) => {
    setSpinner(userName);
  };

  // Handle spin logic
 // Handle spin logic
const handleSpin = () => {
  if (!spinner) return; // No spinner selected
  const spinnerUser = users.find(user => user.name === spinner);
  if (!spinnerUser || spinnerUser.hasSpun) return; // Check if the spinner has already spun

  setSpinning(true);

  // Filter out the spinner (they can't pick themselves)
  const otherUsers = users.filter(user => user.name !== spinner);
  if (otherUsers.length === 0) return;

  // Randomly select someone else
  const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
  setSelectedUser(randomUser.name);

  // Rotate the wheel
  const randomRotation = Math.floor(Math.random() * 360) + 3600; // Full rotations
  setRotationAngle(rotationAngle + randomRotation);

  setTimeout(() => {
    setSpinning(false);
    setUsers(users.map(user =>
      user.name === spinner ? { ...user, selected: randomUser.name, hasSpun: true } : user
    ));
  }, 5000); // Simulate the spinning duration
};
  // Confirm the selection and remove the person from the list
  const handleConfirm = () => {
    if (selectedUser) {
      const selected = users.find(user => user.name === selectedUser);
      if (selected) {
        sendEmail(selected, spinner!); // Send email to the selected person
        setUsers(users.filter(user => user.name !== spinner)); // Remove the spinner from the list
        setSpinner(null);
        setSelectedUser(null);
      }
    }
  };

  // Send a master email with all the selections once the game is over
  const handleMasterEmail = () => {
    const selections = users.map(user => ({
      name: user.name,
      selected: user.selected,
    }));
    const templateParams = {
      to_name: 'Michelle', // Or some other name
      to_email: 'mvoidets@yahoo.com', // Admin's email
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

  // Check if the game is over (i.e., all users have selected someone)
  const isGameOver = () => users.every(user => user.selected);

  console.log('users:', users);
  console.log('spinner:', spinner);
  console.log('selectedUser:', selectedUser);


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
          <div className="col-md-4">
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
          <div className="col-md-4">
            <h2 className="text-center mb-4">Select Spinner</h2>
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

          {/* Spin the wheel */}
          <div className="col-md-4">
            <h3 className="text-center mb-4">{spinning ? 'Spinning...' : 'Spin the Wheel!'}</h3>
            <div
              className="spinner-container mx-auto"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: 'transform 5s ease-out',
              }}
            >
              {/* Add wheel graphics and user names here */}
            </div>
            <div className="mt-3">
              <button className="btn btn-danger" onClick={handleSpin} disabled={spinning || !spinner || users.find(user => user.name === spinner)?.hasSpun}>
                Spin the Wheel
              </button>
            </div>
            {selectedUser && (
              <div className="mt-3">
                <h5>Selected: {selectedUser}</h5>
                <button className="btn btn-success" onClick={handleConfirm}>
                  Confirm Selection
                </button>
              </div>
            )}
            {isGameOver() && !gameOver && (
              <div className="mt-3">
                <button className="btn btn-warning" onClick={handleMasterEmail}>
                  Send Master Email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
