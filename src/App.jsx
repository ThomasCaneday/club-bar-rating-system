import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import database from '../firebase';
import './index.css';

const clubsAndBars = [
  'The Owl San Diego',
  'Mavericks Beach Club',
  'Nova SD',
  'PB Shore Club',
  'Parq Nightclub',
  'The Duck Dive',
];

const App = () => {
  const [ratings, setRatings] = useState({});
  const [ratedLocations, setRatedLocations] = useState(new Set());

  useEffect(() => {
    // Listen for real-time updates from Firebase
    const ratingsRef = ref(database, 'ratings');
    onValue(ratingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRatings(data);
      }
    });
  }, []);

  const handleRatingChange = (club, newRating) => {
    if (ratedLocations.has(club)) {
      alert('You have already rated this location.');
      return;
    }

    const clubRef = ref(database, `ratings/${club}`);
    const currentRating = ratings[club] || { total: 0, count: 0 };

    // Update Firebase with the new rating
    update(clubRef, {
      total: currentRating.total + newRating,
      count: currentRating.count + 1,
    });

    setRatedLocations((prev) => new Set(prev).add(club));
  };

  const renderAverage = (club) => {
    const clubRatings = ratings[club];
    if (!clubRatings || clubRatings.count === 0) return 'No ratings yet';
    return (clubRatings.total / clubRatings.count).toFixed(1);
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center bg-black p-4 sm:p-6 lg:p-8">
      <h1 className="text-4xl font-bold text-neon-purple mb-6 text-center">
        Downtown San Diego & Pacific Beach Clubs/Bars Rating
      </h1>
      <div className="w-screen max-w-2xl bg-gray-900 shadow-lg rounded-lg p-4 sm:p-6 md:p-8">
        {clubsAndBars.map((club) => (
          <div key={club} className="border-b border-neon-purple py-4">
            <h2 className="text-2xl font-semibold text-white mb-2">{club}</h2>
            <p className="text-gray-400 mb-2">
              Average Rating: {renderAverage(club)}
            </p>
            <div className="flex flex-wrap space-x-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(club, rating)}
                  className="px-2 py-0.5 bg-neon-purple text-black rounded hover:bg-purple-800 disabled:opacity-50"
                  disabled={ratedLocations.has(club)}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <footer className="mt-6 text-gray-400 text-sm text-center">
        Ratings reset daily at 6:00 AM PST
      </footer>
    </div>
  );  
};

export default App;