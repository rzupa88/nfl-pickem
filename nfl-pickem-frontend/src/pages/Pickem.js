import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Pickem() {
  const [games, setGames] = useState([]);
  const [picks, setPicks] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const currentWeek = 1;

  const weekLabels = {
    1: 'Wild Card Round',
    2: 'Divisional Round',
    3: 'Conference Championship',
    4: 'Super Bowl',
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gamesCollection = collection(db, 'games');
        const gamesQuery = query(gamesCollection, where('week', '==', currentWeek));
        console.log('Fetching games for week:', currentWeek);

        const querySnapshot = await getDocs(gamesQuery);

        if (querySnapshot.empty) {
          console.warn('No matchups found for the current week.');
          setMessage('No matchups available for this week.');
          return;
        }

        const gamesData = querySnapshot.docs.map((doc) => doc.data());
        setGames(gamesData);
      } catch (error) {
        console.error('Error fetching games:', error);

        if (error.code === 'permission-denied') {
          setMessage('You do not have permission to access the games.');
        } else {
          setMessage('Error loading games. Please try again later.');
        }
      }
    };

    fetchGames();
  }, [currentWeek]);

  const handlePick = (gameId, team) => {
    setPicks({ ...picks, [gameId]: team });
  };

  const handleSubmit = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage('You must be logged in to submit picks.');
        console.error('Error: User not logged in.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (Object.keys(picks).length === 0) {
        setMessage('You must make at least one pick.');
        console.error('Error: No picks made.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      console.log('User ID:', user.uid);
      console.log('Current Picks:', picks);

      const docRef = doc(db, 'picks', `${user.uid}_week_${currentWeek}`);
      const dataToStore = {
        userId: user.uid,
        week: currentWeek,
        picks: picks,
        timestamp: new Date(),
      };

      console.log('Preparing to write data to Firestore:', dataToStore);

      await setDoc(docRef, dataToStore);

      setMessage('Picks submitted successfully!');
      console.log('Picks successfully stored in Firestore:', dataToStore);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting picks:', err);
      setMessage('Error submitting picks. Please try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Pick Your Winners</h1>
      <h2 className="text-center text-lg text-gray-600 mb-4">
        {weekLabels[currentWeek] || `Week ${currentWeek}`}
      </h2>
      {message && (
        <p
          className={`text-center mb-4 ${
            message.toLowerCase().includes('error') || message.toLowerCase().includes('try again')
              ? 'text-red-500'
              : 'text-green-500'
          }`}
        >
          {message}
        </p>
      )}
      <ul className="space-y-6">
        {games.length === 0 && (
          <p className="text-center text-gray-500">No games available for the current week.</p>
        )}
        {games.map((game) => (
          <li
            key={game.id}
            className="flex flex-col bg-white shadow p-4 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <img src={game.teamALogo} alt={game.teamA} className="w-12 h-12 object-contain" />
                <span className="text-lg font-bold text-gray-800">{game.teamA}</span>
              </div>
              <span className="text-sm text-gray-600">vs</span>
              <div className="flex items-center space-x-4">
                <span className="text-lg font-bold text-gray-800">{game.teamB}</span>
                <img src={game.teamBLogo} alt={game.teamB} className="w-12 h-12 object-contain" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-gray-700">
              <span>Spread: {game.spread}</span>
              <span>O/U: {game.overUnder}</span>
            </div>
            <div className="mt-4 flex justify-between space-x-4">
              <button
                onClick={() => handlePick(game.id, game.teamA)}
                className={`px-4 py-2 text-white rounded-lg ${
                  picks[game.id] === game.teamA ? 'bg-blue-500' : 'bg-gray-400'
                } hover:bg-blue-600`}
              >
                Pick {game.teamA}
              </button>
              <button
                onClick={() => handlePick(game.id, game.teamB)}
                className={`px-4 py-2 text-white rounded-lg ${
                  picks[game.id] === game.teamB ? 'bg-blue-500' : 'bg-gray-400'
                } hover:bg-blue-600`}
              >
                Pick {game.teamB}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="text-center mt-8">
        <button
          onClick={handleSubmit}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Submit Picks
        </button>
      </div>
    </div>
  );
}

export default Pickem;
