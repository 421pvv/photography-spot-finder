import cloudinary from "../cloudinary/cloudinary.js";
import { spots } from "../config/mongoCollections.js";
import { closeConnection } from "../config/mongoConnection.js";
export const cleanUpCloudinary = async () => {
  let pubicIds = [];
  let next_cursor = null;
  do {
    const data = await cloudinary.api.resources({
      type: "upload",
      max_results: 100,
      next_cursor: next_cursor,
      resource_type: "image",
    });
    pubicIds = pubicIds.concat(data.resources.map((asset) => asset.public_id));
    next_cursor = data.next_cursor;
  } while (next_cursor);

  const spotsCollection = await spots();
  const validIds = await spotsCollection
    .aggregate([
      { $unwind: "$images" },
      {
        $group: {
          _id: null,
          pubicIds: { $addToSet: "$images.public_id" },
        },
      },
    ])
    .toArray();

  console.log(validIds);

  pubicIds = pubicIds.filter((public_id) => !validIds.includes(public_id));

  await closeConnection();
  // delete unattached assets
  for (const pubicIDSet of batchGroupPublicIds(pubicIds)) {
    await cloudinary.api.delete_resources(pubicIDSet);
  }
};

function batchGroupPublicIds(pubicIds) {
  const batches = [];
  while (pubicIds.length > 0) {
    batches.push(pubicIds.splice(0, 100));
  }
  return batches;
}

const deleteImages = async (image_ids) => {
  for (const pubicIDSet of batchGroupPublicIds(image_ids)) {
    await cloudinary.api.delete_resources(pubicIDSet);
  }
};

export default {
  deleteImages,
};
