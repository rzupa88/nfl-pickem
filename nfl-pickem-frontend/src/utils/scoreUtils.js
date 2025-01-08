import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Import Firestore instance

/**
 * Calculates scores for all users for a given week.
 *
 * @param {number} week - The week number for which scores need to be calculated.
 */
export const calculateScores = async (week) => {
  try {
    console.log(`Starting score calculation for week: ${week}`);

    // Step 1: Fetch results for the week
    const resultsCollection = collection(db, 'results');
    const resultsQuery = query(resultsCollection, where('week', '==', week));
    const resultsSnapshot = await getDocs(resultsQuery);

    if (resultsSnapshot.empty) {
      console.log(`No results found for week ${week}`);
      return; // Exit if no results are available
    }

    const results = {};
    resultsSnapshot.forEach((doc) => {
      const data = doc.data();
      results[data.gameId] = data.winner; // Map gameId to winner
    });

    console.log('Results fetched:', results);

    // Step 2: Fetch picks for the week
    const picksCollection = collection(db, 'picks');
    const picksQuery = query(picksCollection, where('week', '==', week));
    const picksSnapshot = await getDocs(picksQuery);

    if (picksSnapshot.empty) {
      console.log(`No picks found for week ${week}`);
      return; // Exit if no picks are available
    }

    console.log('Picks fetched:', picksSnapshot.docs.map((doc) => doc.data()));

    // Step 3: Process each user's picks and calculate scores
    for (const pickDoc of picksSnapshot.docs) {
      const pickData = pickDoc.data();
      const userId = pickData.userId;
      const userPicks = pickData.picks;

      console.log(`Processing picks for user: ${userId}`, userPicks);

      // Calculate score for the week
      let weekScore = 0;
      Object.keys(userPicks).forEach((gameId) => {
        if (userPicks[gameId] === results[gameId]) {
          weekScore += 1; // 1 point per correct pick
        }
      });

      console.log(`User: ${userId}, Week ${week} Score: ${weekScore}`);

      // Step 4: Write or update the score in Firestore
      await updateUserScore(userId, week, weekScore);
    }
  } catch (error) {
    console.error('Error in calculateScores:', error);
  }
};

/**
 * Updates the user's score in the Firestore `scores` collection.
 *
 * @param {string} userId - The user ID from the picks document.
 * @param {number} week - The week number for which the score is being updated.
 * @param {number} weekScore - The calculated score for the week.
 */
const updateUserScore = async (userId, week, weekScore) => {
  try {
    console.log(`Updating score for user: ${userId}, Week: ${week}, Score: ${weekScore}`);

    const scoresRef = doc(db, 'scores', userId); // Document ID is the userId
    const docSnapshot = await getDoc(scoresRef);

    if (docSnapshot.exists()) {
      const existingData = docSnapshot.data();
      console.log(`Existing scores for user ${userId}:`, existingData);

      const updatedScores = {
        totalScore: (existingData.totalScore || 0) + weekScore, // Increment total score
        weeklyScores: {
          ...existingData.weeklyScores,
          [week]: weekScore, // Add or update the score for the given week
        },
      };

      await setDoc(scoresRef, updatedScores, { merge: true });
      console.log(`Updated scores for user ${userId}`);
    } else {
      const newScoreData = {
        userId: userId,
        totalScore: weekScore,
        weeklyScores: {
          [week]: weekScore, // Add the score for the given week
        },
      };

      await setDoc(scoresRef, newScoreData);
      console.log(`Created scores for user ${userId}`);
    }
  } catch (error) {
    console.error(`Error updating scores for user ${userId}:`, error);
  }
};