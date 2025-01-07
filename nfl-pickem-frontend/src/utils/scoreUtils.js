import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust based on your Firebase setup

/**
 * Calculate scores for all users for a given week.
 *
 * @param {number} week - The week number for which scores should be calculated.
 */
export const calculateScores = async (week) => {
  try {
    // Step 1: Fetch game results for the given week
    const resultsCollection = collection(db, 'results');
    const resultsQuery = query(resultsCollection, where('week', '==', week));
    const resultsSnapshot = await getDocs(resultsQuery);

    if (resultsSnapshot.empty) {
      console.log(`No results found for week ${week}. Skipping scoring.`);
      return;
    }

    // Map results by gameId
    const results = {};
    resultsSnapshot.forEach((doc) => {
      const data = doc.data();
      results[data.gameId] = data.winner;
    });

    console.log('Game Results:', results);

    // Step 2: Fetch user picks for the given week
    const picksCollection = collection(db, 'picks');
    const picksQuery = query(picksCollection, where('week', '==', week));
    const picksSnapshot = await getDocs(picksQuery);

    if (picksSnapshot.empty) {
      console.log(`No picks found for week ${week}. Skipping scoring.`);
      return;
    }

    // Step 3: Process each user's picks and calculate scores
    picksSnapshot.forEach(async (doc) => {
      const pickData = doc.data();
      const userId = pickData.userId;
      const userPicks = pickData.picks;

      let weekScore = 0;

      // Compare user picks to game results
      Object.keys(userPicks).forEach((gameId) => {
        if (userPicks[gameId] === results[gameId]) {
          weekScore += 1; // Award 1 point for each correct pick
        }
      });

      console.log(`User: ${userId}, Week ${week} Score: ${weekScore}`);

      // Step 4: Update or create the user's score in the scores collection
      await updateUserScore(userId, week, weekScore);
    });
  } catch (error) {
    console.error('Error calculating scores:', error);
  }
};

/**
 * Update a user's score in Firestore.
 *
 * @param {string} userId - The user ID from the picks collection.
 * @param {number} week - The week number for which the score is being updated.
 * @param {number} weekScore - The score the user earned for the week.
 */
const updateUserScore = async (userId, week, weekScore) => {
  try {
    const scoresRef = doc(db, 'scores', userId); // Use userId as the document ID in scores
    const docSnapshot = await getDoc(scoresRef);

    if (docSnapshot.exists()) {
      // Document exists, update totalScore and weeklyScores
      const existingData = docSnapshot.data();
      const updatedScores = {
        totalScore: (existingData.totalScore || 0) + weekScore,
        weeklyScores: {
          ...existingData.weeklyScores,
          [week]: weekScore, // Add or update this week's score
        },
      };

      await setDoc(scoresRef, updatedScores, { merge: true });
      console.log(`Updated scores for user ${userId}`);
    } else {
      // Document does not exist, create a new one
      const newScoreData = {
        userId,
        totalScore: weekScore,
        weeklyScores: {
          [week]: weekScore,
        },
      };

      await setDoc(scoresRef, newScoreData);
      console.log(`Created scores for user ${userId}`);
    }
  } catch (error) {
    console.error('Error updating user score:', error);
  }
};
