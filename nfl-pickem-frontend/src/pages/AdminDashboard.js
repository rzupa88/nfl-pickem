import React, { useState } from 'react';
import { calculateScores } from '../utils/scoreUtils'; // Adjust path if necessary

const AdminDashboard = () => {
  const [week, setWeek] = useState('');
  const [message, setMessage] = useState('');

  const handleScoreCalculation = async () => {
    if (!week) {
      setMessage('Please enter a valid week number.');
      return;
    }

    try {
      await calculateScores(parseInt(week));
      setMessage(`Scores for week ${week} calculated successfully!`);
    } catch (error) {
      console.error('Error calculating scores:', error);
      setMessage('Error calculating scores. Check the console for details.');
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>
      <div className="max-w-md mx-auto bg-white p-6 rounded shadow-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Week Number:
        </label>
        <input
          type="number"
          value={week}
          onChange={(e) => setWeek(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., 1"
        />
        <button
          onClick={handleScoreCalculation}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
          Calculate Scores
        </button>
        {message && (
          <div
            className={`mt-4 px-4 py-2 rounded ${
              message.includes('successfully')
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
