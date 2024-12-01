import React, { useState } from 'react';
import './SpinWheel.css'; // Import the CSS file for styling

// Define the SpinWheel component
interface SpinWheelProps {
  users: string[]; // List of users' names
  onSpinFinish: (winner: string) => void; // Callback when spin finishes
}

const SpinWheel: React.FC<SpinWheelProps> = ({ users, onSpinFinish }) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);

  // Assign colors to users
  const colors = [
    '#FF5733', '#33FF57', '#3357FF', '#F1C40F', '#8E44AD', '#E74C3C', '#1ABC9C', '#F39C12', '#9B59B6'
  ];

  // Ensure there are enough colors
  const assignColor = (index: number) => colors[index % colors.length];

  // Generate the rotation for the wheel (randomized)
  const spinWheel = () => {
    const randomDeg = Math.floor(Math.random() * 360) + 3600; // Random rotation with multiple spins
    setRotation(randomDeg); // Apply the rotation
    setSpinning(true); // Indicate spinning is in progress

    // Calculate the winning index after the rotation
    setTimeout(() => {
      const winningIndex = Math.floor(((randomDeg % 360) / 360) * users.length);
      const winner = users[winningIndex];
      onSpinFinish(winner); // Pass the winner back to the parent
      setSpinning(false); // Stop the spinning
    }, 4000); // Wait until the spin animation ends (4 seconds duration)
  };

  return (
    <div className="wheel-container">
      <div
        className="wheel"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 4s ease-out', // Smooth transition for spinning
          width: '300px', // Set fixed width
          height: '300px', // Set fixed height
          borderRadius: '50%', // Make the wheel round
          backgroundColor: 'white', // Ensure the wheel background is white
          position: 'relative',
        }}
      >
        {users.map((user, index) => (
          <div
            key={index}
            className="wheel-segment"
            style={{
              transform: `rotate(${(360 / users.length) * index}deg)`,
              backgroundColor: assignColor(index), // Assign a color to each segment
              position: 'absolute',
              width: '50%',
              height: '50%',
              top: '50%',
              left: '50%',
              transformOrigin: '0% 100%', // Set rotation point to make the segments appear correctly
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderTopLeftRadius: '50%',
              borderTopRightRadius: '50%',
            }}
          >
            <div className="wheel-segment-inner" style={{ textAlign: 'center' }}>
              {user}
            </div>
          </div>
        ))}
      </div>
      <button onClick={spinWheel} disabled={spinning} style={{ marginTop: '20px' }}>
        {spinning ? 'Spinning...' : 'Spin'}
      </button>
    </div>
  );
};

export default SpinWheel;
