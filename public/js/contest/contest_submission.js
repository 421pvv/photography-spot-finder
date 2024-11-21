import validation from "../validation/validation.js";

function errorMessage(msg) {
  return `<p class="formInputError" > ${msg} </p>`;
}
let urls = [];
const discardedImagesIds = [];
const discardedImages = $("#removeImages");
const previewContainer = $("#imageUploadPreviews");
const imageFileUrls = document.getElementById("submissionImage");
const submissionSection = $("#submission-list");

let images = document.getElementsByClassName("previewImageContainer");
for (const image of images) {
  const id = image.getAttribute("id");
  const url = $(`#${id} img`).attr("src");
  urls.push({ public_id: id, url: url });
  $("#submissionImage").val(JSON.stringify(urls[0]));

  $(`#${id} span`).click((event) => {
    console.log("Removing image: ", id);
    discardedImagesIds.push(id);
    urls = urls.filter((image) => image.public_id !== id);

    discardedImages.val(JSON.stringify(discardedImagesIds));
    $("#submissionImage").val("");

    $(`#${id}`).remove();
  });
}

var myWidget = cloudinary.createUploadWidget(
  {
    cloudName: "db7w46lyt",
    uploadPreset: "Spot Images",
    resourceType: "image",
    multiple: false,
  },
  (error, result) => {
    if (!error && result && result.event === "success") {
      urls.push({
        public_id: result.info.public_id,
        url: result.info.secure_url,
      });
      imageFileUrls.value = JSON.stringify(urls[0]);

      console.log("Selected image: ", urls);
      // set up image preview and handle images to be removed at server side
      previewContainer.append(
        `<div id="${result.info.public_id}" class="previewImageContainer">
        <img
          src="${result.info.secure_url}">
        <span class="removeImageIcon">❌</span>
      </div>`
      );

      $(`#${result.info.public_id} span`).click((event) => {
        console.log("Removing image: ", result.info.public_id);
        discardedImagesIds.push(result.info.public_id);
        urls = urls.filter(
          (image) => image.public_id !== result.info.public_id
        );
        imageFileUrls.value = "";
        discardedImages.val(JSON.stringify(discardedImagesIds));

        $(`#${result.info.public_id}`).remove();
      });
    }
  }
);

document.getElementById("upload_widget").addEventListener(
  "click",
  function () {
    if (urls.length == 1) {
      alert("Only one image upload allowed per submission!");
    } else {
      myWidget.open();
    }
  },
  false
);

console.log("contest submisson");

(function ($) {
  let contestSubmissionForm = $("#addSubmissionForm"),
    image = $("#submissionImage"),
    contestSubmissionErrors = $("#contestSubmissionErrors"),
    spot = $("#spotId");

  contestSubmissionForm.submit(function (event) {
    event.preventDefault();
    $(".formInputError").remove();

    let hasError = false;
    let imageObject = image.val();
    let spotId;
    try {
      imageObject = JSON.parse(imageObject);
      spotId = validation.validateString(spot.val());
      validation.validateString(imageObject.url);
      validation.validateString(imageObject.public_id);
    } catch (e) {
      hasError = true;
      contestSubmissionErrors.append(
        errorMessage("Submisison cannot be blank!")
      );
    }
    const data = JSON.stringify({
      url: imageObject.url,
      public_id: imageObject.public_id,
      spotId: spotId,
    });
    console.log("Submitting for contest: ", data);

    if (!hasError && image && spot) {
      let requestConfig = {
        method: "POST",
        url: `/contest/${spotId}`,
        contentType: "application/json",
        data: data,
      };
      $.ajax(requestConfig).then(function (responseMessage) {
        console.log(responseMessage);
        let newElement = $(responseMessage);
        $("#userInteractionsDiv").remove();
        $("#imageUploadPreviews").remove();
        submissionSection.append(newElement);
      });
    }
  });
})(window.jQuery);
