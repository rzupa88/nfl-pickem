import React, { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDocs, query, collection, where } from 'firebase/firestore';
import { auth } from '../firebase';

const Pickem = () => {
  const [games, setGames] = useState([]);
  const [picks, setPicks] = useState({});
  const [week] = useState(1); // Week is fixed for now
  const [message, setMessage] = useState('');
  const topRef = useRef(null); // Ref to scroll to the top

  // Map week numbers to round names
  const roundNames = {
    1: 'Wild Card Round',
    2: 'Divisional Round',
    3: 'Conference Championships',
    4: 'Superbowl',
  };

  const fetchGames = useCallback(async () => {
    try {
      const gamesQuery = query(collection(db, 'games'), where('week', '==', week));
      const gamesSnapshot = await getDocs(gamesQuery);

      if (gamesSnapshot.empty) {
        setMessage('No games available for the current round.');
        setGames([]);
      } else {
        const gamesData = [];
        gamesSnapshot.forEach((doc) => gamesData.push(doc.data()));
        setGames(gamesData);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setMessage('Error loading games. Please try again later.');
    }
  }, [week]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handlePick = (gameId, team) => {
    setPicks((prevPicks) => ({
      ...prevPicks,
      [gameId]: team,
    }));
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting picks...');
      console.log('Current User:', auth.currentUser);

      if (!auth.currentUser) {
        throw new Error('User is not authenticated.');
      }

      const picksRef = doc(db, 'picks', auth.currentUser.uid);
      const newPicks = {
        userId: auth.currentUser.uid,
        week: week,
        picks: picks,
      };

      console.log('New picks data:', newPicks);
      await setDoc(picksRef, newPicks, { merge: true });

      console.log('Picks submitted successfully!');
      setMessage('Picks submitted successfully!');
    } catch (error) {
      console.error('Error submitting picks:', error);
      setMessage('Error submitting picks. Please try again.');
    } finally {
      // Scroll back to the top after submission
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Top reference for scrolling */}
      <div ref={topRef}></div>

      <h1 className="text-3xl font-bold text-center mb-6">
        Pickem - {roundNames[week] || `Week ${week}`}
      </h1>

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

      <div className="mt-6">
        {games.length > 0 ? (
          games.map((game) => (
            <div
              key={game.id}
              className="mb-6 p-4 border rounded-lg bg-white flex flex-col items-center text-center"
            >
              {/* Team A Button */}
              <button
                onClick={() => handlePick(game.id, game.teamA)}
                className={`mb-2 p-2 w-full rounded-lg border flex items-center justify-center space-x-2 ${
                  picks[game.id] === game.teamA ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                <img
                  src={game.teamALogo}
                  alt={game.teamA}
                  className="h-8 w-8 object-contain"
                />
                <span className="text-lg font-bold">{game.teamA}</span>
              </button>

              {/* "vs." */}
              <div className="text-sm text-gray-500 mb-2">vs.</div>

              {/* Team B Button */}
              <button
                onClick={() => handlePick(game.id, game.teamB)}
                className={`p-2 w-full rounded-lg border flex items-center justify-center space-x-2 ${
                  picks[game.id] === game.teamB ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}
              >
                <img
                  src={game.teamBLogo}
                  alt={game.teamB}
                  className="h-8 w-8 object-contain"
                />
                <span className="text-lg font-bold">{game.teamB}</span>
              </button>

              {/* Spread and Over/Under */}
              <div className="text-sm text-gray-600 mt-4">
                Spread: {game.spread} | O/U: {game.overUnder}
              </div>
            </div>
          ))
        ) : (
          <p>No games available for this round.</p>
        )}
      </div>

      {games.length > 0 && (
        <button
          onClick={handleSubmit}
          className="mt-6 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Submit Picks
        </button>
      )}
    </div>
  );
};

export default Pickem;