import { spots } from '';

// Function to get all spots which have number of reports less than 20, to be displayed on the spots list page
const getAllSpots = async () => {
  const spotsCollection = await spots();
  const allSpotsList = await spotsCollection
    .find({ reportCount: { $lt: 20 } })
    .toArray();
  if (!allSpotsList) {
    throw ['Could not get all spots'];
  }
  return allSpotsList;
};

export default { getAllSpots };
