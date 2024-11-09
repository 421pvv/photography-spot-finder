import validation from "../validation/validation.js";
function errorMessage(msg) {
  return `<p class="formInputError" > ${msg} </p>`;
}

$("#addSpotForm").submit((event) => {
  console.log("Starting add spot client side validation");
  $(".formInputError").remove();

  const spotName = $("#spotName");
  const spotDescription = $("#spotDescription");
  const spotAccessibility = $("#spotAccessibility");
  const spotBestTimes = $("#spotBestTimes");
  const spotTags = $("#spotTags");
  const spotLatitude = $("#spotLatitude");
  const spotLongitude = $("#spotLongitude");
  const spotAddress = $("#spotAddress");
  const spotImages = $("#spotImages");

  let hasError = false;
  try {
    spotName.val(validation.validateString(spotName.val()));
  } catch (e) {
    console.log(e);
    $("#spotNameErrors").append(
      errorMessage("Spot Name must not be blank or just spaces!")
    );
    hasError = true;
  }

  try {
    spotDescription.val(validation.validateString(spotDescription.val()));
  } catch (e) {
    console.log(e);

    $("#spotDescriptionErrors").append(
      errorMessage(`Spot Description must not be blank or just spaces!`)
    );
    hasError = true;
  }

  try {
    spotAccessibility.val(validation.validateString(spotAccessibility.val()));
  } catch (e) {
    console.log(e);

    $("#spotAccessibilityErrors").append(
      errorMessage(`Spot Accessibility  must not be blank or just spaces!`)
    );
    hasError = true;
  }

  let bestTimes;
  try {
    bestTimes = validation.validateString(spotBestTimes.val());
    bestTimes = bestTimes.split(",");
    for (const tagI in bestTimes) {
      try {
        bestTimes[tagI] = validation.validateString(bestTimes[tagI]);
      } catch (e) {
        console.log(e);

        $("#spotBestTimesErrors").append(
          errorMessage(
            `Invalid best time #${parseInt(tagI) + 1}: "${
              bestTimes[tagI]
            }". A best time cannot be blank or just spaces.`
          )
        );
        hasError = true;
      }
    }
    spotBestTimes.val(bestTimes.join(","));
  } catch (e) {
    console.log(e);

    $("#spotBestTimesErrors").append(
      errorMessage(`Must provide at least one valid best time!`)
    );
  }

  let tags;
  try {
    tags = validation.validateString(spotTags.val());
    tags = tags.split(",");
    for (const tagI in tags) {
      try {
        tags[tagI] = validation.validateString(tags[tagI]);
      } catch (e) {
        console.log(e);
        $("#spotTagsErrors").append(
          errorMessage(
            `Invalid tag #${parseInt(tagI) + 1}: "${
              tags[tagI]
            }". A tag cannot be blank or just spaces.`
          )
        );
        hasError = true;
      }
    }
    spotTags.val(tags.join(","));
    if (tags.length > 5) {
      console.log("more than five tags present");
      $("#spotTagsErrors").append(
        errorMessage(`A maximum of five tags is allowed!`)
      );
      hasError = true;
    }
  } catch (e) {}

  try {
    validation.validateCoordinates(spotLongitude.val(), spotLatitude.val());
    spotLatitude.val(parseFloat(spotLatitude.val()));
    spotLongitude.val(parseFloat(spotLongitude.val()));
    spotAddress.val(validation.validateString(spotAddress.val()));
  } catch (e) {
    console.log(e);
    $("#spotLocationErrors").append(
      errorMessage(`Please use the map above to select the location!`)
    );
    hasError = true;
  }

  try {
    JSON.parse(spotImages.val());
  } catch (e) {
    if (spotImages.val().trim().length == 0) {
      console.log("No images selected");

      spotImages.val("");
      $("#spotImagesErrors").append(
        errorMessage(`Please upload at least one image of the spot!`)
      );
      hasError = true;
    }
  }

  if (hasError) {
    console.log("Errors present: submission stopped");
    event.preventDefault();
  }
});
