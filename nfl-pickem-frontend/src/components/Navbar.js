import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

function Navbar() {
  const [user] = useAuthState(auth); // Tracks login state

  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <div className="bg-gray-800 text-white py-4 px-8 flex justify-between items-center">
      <h1 className="text-2xl font-bold">NFL Pick'em</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-yellow-500">Home</Link>
        {user && <Link to="/pickem" className="hover:text-yellow-500">Make Picks</Link>}
        {user && <Link to="/leaderboard" className="hover:text-yellow-500">Leaderboard</Link>}
        {!user && <Link to="/login" className="hover:text-yellow-500">Login</Link>}
        {!user && <Link to="/signup" className="hover:text-yellow-500">Sign Up</Link>}
        {user && (
          <button onClick={handleLogout} className="hover:text-red-500">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default Navbar;
