import React from 'react';
import { Link } from 'react-router-dom';
import { auth } from '../firebase'; // Adjust path to your Firebase setup
import { useAuthState } from 'react-firebase-hooks/auth';

const Navbar = () => {
  const [user] = useAuthState(auth); // Hook to get the authenticated user
  const adminEmail = 'rzupa88@gmail.com'; // Replace with your admin email

  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-lg font-bold">
          NFL Pickem
        </Link>
        <div className="flex space-x-4">
          <Link to="/pickem" className="text-white hover:underline">
            Pickem
          </Link>
          <Link to="/leaderboard" className="text-white hover:underline">
            Leaderboard
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="text-white hover:underline">
                Login
              </Link>
              <Link to="/signup" className="text-white hover:underline">
                Signup
              </Link>
            </>
          ) : (
            <>
              {user.email === adminEmail && (
                <Link to="/admin" className="text-white hover:underline">
                  Admin
                </Link>
              )}
              <button
                onClick={() => auth.signOut()}
                className="text-white hover:underline"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
