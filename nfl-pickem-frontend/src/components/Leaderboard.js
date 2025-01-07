import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Leaderboard = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scoresCollection = collection(db, 'scores');
        const snapshot = await getDocs(scoresCollection);

        const scoresData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          scoresData.push({
            email: data.email || 'Unknown User',
            totalScore: data.totalScore || 0,
            weeklyScores: {
              WC: data.weeklyScores?.[1] || 0, // Wild Card (Week 1)
              DR: data.weeklyScores?.[2] || 0, // Divisional Round (Week 2)
              CC: data.weeklyScores?.[3] || 0, // Conference Championship (Week 3)
              SB: data.weeklyScores?.[4] || 0, // Super Bowl (Week 4)
            },
          });
        });

        // Sort scores by totalScore in descending order
        scoresData.sort((a, b) => b.totalScore - a.totalScore);

        setScores(scoresData);
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchScores();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Leaderboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b py-2 text-center">Rank</th>
              <th className="border-b py-2">User</th>
              <th className="border-b py-2 text-center">WC</th>
              <th className="border-b py-2 text-center">DR</th>
              <th className="border-b py-2 text-center">CC</th>
              <th className="border-b py-2 text-center">SB</th>
              <th className="border-b py-2 text-center">Total Score</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="py-2 text-center">{index + 1}</td>
                <td className="py-2">{score.email}</td>
                <td className="py-2 text-center">{score.weeklyScores.WC}</td>
                <td className="py-2 text-center">{score.weeklyScores.DR}</td>
                <td className="py-2 text-center">{score.weeklyScores.CC}</td>
                <td className="py-2 text-center">{score.weeklyScores.SB}</td>
                <td className="py-2 text-center font-bold">{score.totalScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
