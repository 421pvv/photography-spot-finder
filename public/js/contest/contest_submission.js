import validation from "../validation/validation.js";

function errorMessage(msg) {
  return `<p class="fohttp://localhost:3000/users/signuprmInputError" > ${msg} </p>`;
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
    transformation: [{ quality: "auto", fetch_format: "auto" }],
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

try {
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
} catch (e) {
  console.log("Submission already submitted");
}
console.log("contest submisson");

(function ($) {
  let contestSubmissionForm = $("#addSubmissionForm"),
    image = $("#submissionImage"),
    contestSubmissionErrors = $("#contestSubmissionErrors"),
    spot = $("#spotId"),
    contestSpot = $("article");
  updateSubmissionVotesUI();

  function bindVoteEvents(submissionImage) {
    const likeButton = submissionImage.find(`.fa-thumbs-up`);
    const dislikeButton = submissionImage.find(`.fa-thumbs-down`);
    const deleteVoteButton = submissionImage.find(` .fa-trash`);
    const voteDisplay = submissionImage.find(`.user-vote`);

    function putRating(contestSubmissionId, vote) {
      let requestConfig = {
        method: "PUT",
        url: `/contest/${contestSpot.data("id")}/userVotes`,
        contentType: "application/json",
        data: JSON.stringify({
          contestSubmissionId,
          vote,
        }),
      };
      console.log("Sending vote request", requestConfig.data);
      $.ajax(requestConfig)
        .done((vote) => {
          // updateSubmissionVotesUI();
          if (vote.vote == 1) {
            likeButton.addClass("selected");
            dislikeButton.removeClass("selected");
            voteDisplay.text(vote.vote);
          } else if (vote.vote == -1) {
            likeButton.removeClass("selected");
            dislikeButton.addClass("selected");
            voteDisplay.text(vote.vote);
          }
        })
        .fail((xhr, status, e) => {
          console.log(xhr.responseJSON);
        });
    }
    function deleteRating(contestSubmissionId) {
      let requestConfig = {
        method: "DELETE",
        url: `/contest/${contestSpot.data("id")}/userVotes`,
        contentType: "application/json",
        data: JSON.stringify({
          contestSubmissionId,
        }),
      };
      console.log("Sending vote delete request", requestConfig.data);
      $.ajax(requestConfig)
        .then(() => {
          likeButton.removeClass("selected");
          dislikeButton.removeClass("selected");
          voteDisplay.text("-");
        })
        .fail((xhr, status, e) => {
          console.log(xhr.responseJSON);
        });
    }
    likeButton.on("click", (e) => {
      console.log("click on like");
      putRating(submissionImage.data("id"), 1);
    });
    dislikeButton.on("click", (e) => {
      putRating(submissionImage.data("id"), -1);
    });
    deleteVoteButton.on("click", (e) => {
      deleteRating(submissionImage.data("id"));
    });
  }

  async function updateSubmissionVotesUI() {
    console.log("Binding vote button events");
    $("#submission-list")
      .children()
      .each(function (index, element) {
        bindVoteEvents($(element));
      });

    // update ui with current votes
    try {
      const votes = await $.get(`/contest/${contestSpot.data("id")}/userVotes`);
      console.log(votes);
      for (const vote of votes) {
        const likeButton = $(`#${vote.contestSubmissionId} .fa-thumbs-up`);
        const dislikeButton = $(`#${vote.contestSubmissionId} .fa-thumbs-down`);
        const deleteVoteButton = $(`#${vote.contestSubmissionId} .fa-trash`);
        const voteDisplay = $(`#${vote.contestSubmissionId} .user-vote`);
        if (vote.vote == -1) {
          likeButton.removeClass("selected");
          dislikeButton.addClass("selected");
          voteDisplay.text("-1");
        } else if (vote.vote == 1) {
          dislikeButton.removeClass("selected");
          likeButton.addClass("selected");
          voteDisplay.text("1");
        }
      }
    } catch (e) {
      console.log(`Can't fetch user votes: ` + e);
    }
  }

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
      $.ajax(requestConfig)
        .then(function (responseMessage) {
          console.log(responseMessage);
          let newElement = $(responseMessage);
          $("#userInteractionsDiv").remove();
          $("#imageUploadPreviews").remove();
          submissionSection.append(newElement);
          bindVoteEvents(newElement);
        })
        .catch((e) => {
          contestSubmissionErrors.append(errorMessage(e.message));
        });
    }
  });
})(window.jQuery);
