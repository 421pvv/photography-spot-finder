import validation from "../validation/validation.js";
const slider = $("#ratingSlider");
const sliderValue = $("#ratingSliderValue");
function errorMessage(msg) {
  return `<p class="formInputError" > ${msg} </p>`;
}
slider.on("change", () => {
  console.log(slider.val());
  sliderValue.text(slider.val());
});

const ratingForm = $("#putRatingForm");
const ratingErrorsDiv = $("#spotRatingErrors");

ratingForm.submit((event) => {
  $("#spotRatingErrors .formInputError").remove();
  let hasErrors = false;

  try {
    console.log("Validating rating input: ", slider.val());

    const rating = validation.validateNumber(
      parseFloat(slider.val()),
      "Rating Value"
    );
    if (rating < 1 || rating > 10) {
      throw "Invalid rating (must be between 1 and 10)!";
    }
  } catch (e) {
    console.log(e);
    hasErrors = true;
    ratingErrorsDiv.append(
      errorMessage("Invalid rating (must be between 1 and 10)!")
    );
  }

  if (hasErrors) {
    event.preventDefault();
  }
});
