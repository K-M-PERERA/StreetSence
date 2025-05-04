
export const checkNearbySensitivePlaces = async (location) => {
    const apiKey = "AIzaSyA9ivaZ1fgd737hpRLtqMCLxNVIxZi-a_o"; // Replace with your real key
    const types = ['hospital', 'school', 'police'];
    const radius = 500;
  
    if (!location?.lat || !location?.lng) return 0;
  
    for (const type of types) {
      const url = `https://corsproxy.io/?https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=${type}&key=${apiKey}`;
  
      try {
        const res = await fetch(url);
        const data = await res.json();
  
        if (data.results && data.results.length > 0) {
          return 10; // Found sensitive place nearby
        }
      } catch (err) {
        console.error(`Error checking nearby ${type}:`, err);
      }
    }
  
    return 3; // No sensitive place nearby
  };
  