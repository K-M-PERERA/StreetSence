
import { urgencyConfig } from './urgencyConfig';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { checkNearbySensitivePlaces } from './placesChecker';

const getRepeatScore = async (location, category) => {
  if (!location) return 0;
  const radius = 0.01;

  const q = query(collection(db, 'issues'), where('category', '==', category));
  const snapshot = await getDocs(q);

  let nearbyCount = 0;
  snapshot.forEach(doc => {
    const data = doc.data();
    if (
      data.location &&
      Math.abs(data.location.lat - location.lat) <= radius &&
      Math.abs(data.location.lng - location.lng) <= radius
    ) {
      nearbyCount += 1;
    }
  });

  if (nearbyCount >= 5) return 10;
  if (nearbyCount >= 3) return 7;
  if (nearbyCount >= 1) return 4;
  return 0;
};

export const calculateUrgencyScore = async ({ category, location, district }) => {
  const severity = urgencyConfig.severityMap[category] || 5;
  const costImpact = urgencyConfig.costImpactMap[category] || 5;
  const popScore = urgencyConfig.populationDensityMap[district] || 5;
  const repeatFactor = await getRepeatScore(location, category);
  const sensitiveLocation = await checkNearbySensitivePlaces(location);

  const urgency =
    (severity * 0.4) +
    (popScore * 0.25) +
    (sensitiveLocation * 0.15) +
    (costImpact * 0.1) +
    (repeatFactor * 0.1);

  return Math.round(urgency * 10) / 10;
};
