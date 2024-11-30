import validation from "../validation/validation.js";
function errorMessage(msg) {
  return `<p class="formInputError" > ${msg} </p>`;
}
let urls = [];
const discardedImagesIds = [];
const discardedImages = $("#removeImages");
const previewContainer = $("#imageUploadPreviews");
const imageFileUrls = document.getElementById("commentImage");
const commentForm = $("#addCommentForm");

function removeErrors() {
  $("#spotCommentErrors .formInputError").remove();
}

const commentInput = $("#commentInput");
commentInput.on("input", removeErrors);

commentForm.submit((event) => {
  const commentInput = $("#commentInput");
  const optionalImage = $("#commentImage");

  $("#spotCommentErrors .formInputError").remove();

  let hasErrors = false;
  try {
    validation.validateString(commentInput.val(), "Comment message");
  } catch (e) {
    console.log(e);
    hasErrors = true;
    $("#spotCommentErrors").append(
      errorMessage("Comment message must not be blank or just spaces!")
    );
  }

  let imageObject;
  try {
    imageObject = JSON.parse(optionalImage);
  } catch {
    // no image selected
  }

  if (imageObject) {
    if (!imageObject.public_id || !imageObject.url) {
      hasErrors = true;
      urls = [];
      $("#imageUploadPreviews .previewImageContainer").remove();
      $("#spotCommentErrors").append(
        errorMessage("Image is invalid. Try again.")
      );
    }
  }

  if (hasErrors) {
    event.preventDefault();
  }
});

let images = document.getElementsByClassName("previewImageContainer");
for (const image of images) {
  const id = image.getAttribute("id");
  const url = $(`#${id} img`).attr("src");
  urls.push({ public_id: id, url: url });
  $("#commentImage").val(JSON.stringify(urls[0]));

  $(`#${id} span`).click((event) => {
    console.log("Removing image: ", id);
    discardedImagesIds.push(id);
    urls = urls.filter((image) => image.public_id !== id);

    discardedImages.val(JSON.stringify(discardedImagesIds));
    $("#commentImage").val("");

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
const upload_widget = document.getElementById("upload_widget");
if (upload_widget) {
  upload_widget.addEventListener(
    "click",
    function () {
      if (urls.length == 1) {
        alert("Only one image upload allowed per comment");
      } else {
        myWidget.open();
      }
    },
    false
  );
}
