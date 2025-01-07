import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

function Home() {
  const [user] = useAuthState(auth);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">Welcome to NFL Pick'em!</h1>
      {!user ? (
        <p className="text-lg text-gray-700 mb-6">
          Login or Sign Up to start picking your winners!
        </p>
      ) : (
        <p className="text-lg text-gray-700 mb-6">
          Welcome back! Navigate to make your picks or view the leaderboard.
        </p>
      )}
      <div className="space-y-4">
        {!user && (
          <>
            <Link
              to="/login"
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Sign Up
            </Link>
          </>
        )}
        {user && (
          <>
            <Link
              to="/pickem"
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              Make Picks
            </Link>
            <Link
              to="/leaderboard"
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              View Leaderboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
