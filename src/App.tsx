import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Styles/Main.css';
import wheelImage from './assets/ornaments.jpg'
import emailjs from 'emailjs-com';
import './Styles/App.css';

interface User {
  name: string;
  email: string;
  message: string;
}

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

 

 
// Initialize EmailJS with your user ID


   // Access EmailJS service details from .env
  //  const userName = process.env.REACT_APP_EMAILJS_USER_ID;
  //  const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
  //  const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;

const sendEmail = (user: User) => {
  const templateParams = {
    to_name: user.name,
    to_email: user.email,
    message: `Congratulations ${user.name}! You have been selected as the Secret Santa!`,
  };
  console.log('user name:', user.name);
  console.log('user email:', user.email);

  emailjs.init(process.env.REACT_APP_EMAILJS_USER_ID!);

  emailjs.send(
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
    console.log('EmailJS User ID:', process.env.REACT_APP_EMAILJS_USER_ID);
console.log('EmailJS Service ID:', process.env.REACT_APP_EMAILJS_SERVICE_ID);
console.log('EmailJS Template ID:', process.env.REACT_APP_EMAILJS_TEMPLATE_ID);

};


  // Handle form submission to add a new user
  const handleSubmit = () => {
    if (name && email && message) {
      setUsers([...users, { name, email, message }]);
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  // Handle spinning logic to exclude the current spinner
  const handleSpin = () => {
    if (users.length < 2) return; // Need at least 2 users to spin (so one can be excluded)

    setSpinning(true);

    // Randomize the spin duration and direction
    const randomRotation = Math.floor(Math.random() * 360) + 3600; // At least 3600 degrees (10 full spins)
    const randomDelay = Math.random() * 2 + 3; // Delay in seconds for the spin duration (3 to 5 seconds)

    // Set the rotation angle and duration for the animation
    setRotationAngle(rotationAngle + randomRotation);

    setTimeout(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      setSelectedUser(randomUser.name);
      setSpinning(false);
    }, randomDelay * 1000); // Delay the selection for the same duration as the spinning animation
  };



// Modify handleConfirm to send an email
const handleConfirm = () => {
  if (selectedUser) {
    const user = users.find(user => user.name === selectedUser);
    if (user) {
      sendEmail(user);
    }
    setUsers(users.filter(user => user.name !== selectedUser));
    setSelectedUser(null);
  }
};



  return (
    <div className='form-container'>
    {/* The video background */}
    <div className="video-background">
      <video autoPlay loop muted>
        <source src="/santa_list.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      </div>
      <h1 className="mb-4 text-center ">Holiday Fun</h1>
<div className="container mt-5">
 
  <div className="row">
    {/* Form for adding users (Left column) */}
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

    {/* List of users (Middle column) */}
    <div className="col-md-3">
      <h2 className="text-center mb-4">Secret Santa's</h2>
      <ul className="list-group mb-4">
        {users.map((user, index) => (
          <li
            className="list-group-item d-flex justify-content-between align-items-center"
            key={index}
          >
            {user.name}
          </li>
        ))}
      </ul>
    </div>

    {/* Prize Wheel (Right column) */}
    <div className="col-md-6 center-text">
      <h3 className="text-center mb-4">{spinning ? 'Spinning...' : 'Spin to Select your person!'}</h3>
      <div
  className="spinner-container mx-auto"
  style={{
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    position: 'relative',
    display: 'inline-block',
    border: '5px solid black',
    overflow: 'hidden',
    transform: `rotate(${rotationAngle}deg)`,
    transition: 'transform 3s ease-out',
    background: `url(${wheelImage}) center center/cover no-repeat`,
  }}
>
  {users.map((user, index) => {
    const angle = (360 / users.length) * index; // Calculate the angle for each user (even distribution)
    const radius = 200; // Adjust this value based on the radius of your wheel
    const transformStyle = `rotate(${angle}deg) translateY(-${radius}px) rotate(-${angle}deg)`; // Position each user at a calculated angle

    return (
      <div
        key={index}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transformOrigin: '50% 50%', // Rotate around the center
          transform: transformStyle, // Position the user names around the circle
          textAlign: 'center',
          color: 'red', // Change the text color to stand out
          fontWeight: 'bold',
          fontSize: '16px', // Adjust the font size
        }}
      >
        {user.name}
      </div>
    );
  })}
</div>
      <div className="display-5 mt-3  center-text" style={{ minHeight: '50px', fontWeight: 'bold' }}>
        {selectedUser ? selectedUser : 'No User Selected'}
      </div>
      <div className="mt-4">
        <button
          className="btn btn-danger"
          onClick={handleSpin}
          disabled={spinning || users.length < 2}
        >
          Spin the Wheel
        </button>
      </div>
      {selectedUser && (
        <div className="mt-4">
          <button className="btn btn-success" onClick={handleConfirm}>
            Confirm Selection
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