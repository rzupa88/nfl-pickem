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
            userId: data.userId || 'Unknown User',
            totalScore: data.totalScore || 0,
            weeklyScores: data.weeklyScores || {}
          });
        });

        // Sort by totalScore descending
        scoresData.sort((a, b) => b.totalScore - a.totalScore);
        setScores(scoresData);
      } catch (error) {
        console.error('Error fetching scores:', error);
      }
    };

    fetchScores();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-6 text-blue-600">
        Leaderboard
      </h1>
      <div className="overflow-x-auto">
        <table className="table-auto w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="border border-gray-300 px-4 py-3 text-left">Rank</th>
              <th className="border border-gray-300 px-4 py-3 text-left">User (Email)</th>
              <th className="border border-gray-300 px-4 py-3 text-center">WC</th>
              <th className="border border-gray-300 px-4 py-3 text-center">DR</th>
              <th className="border border-gray-300 px-4 py-3 text-center">CC</th>
              <th className="border border-gray-300 px-4 py-3 text-center">SB</th>
              <th className="border border-gray-300 px-4 py-3 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((score, index) => {
              const { weeklyScores, totalScore, userId } = score;

              return (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-gray-100 transition`}
                >
                  <td className="border border-gray-300 px-4 py-3 text-left font-semibold">
                    {index + 1}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-left">
                    {userId}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {weeklyScores['1'] || 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {weeklyScores['2'] || 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {weeklyScores['3'] || 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    {weeklyScores['4'] || 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center font-bold text-blue-600">
                    {totalScore}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
