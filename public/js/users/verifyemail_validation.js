import validation from "../validation/validation.js";
let verifyForm = document.getElementById("verify-form");
let otpInput = document.getElementById("otp");
let resetButton = document.getElementById("back-to-profile");
let errorsDiv = document.getElementById("form-errors-div");
let username = document.getElementById("current-username");

// checking the inputs in editprofile form
verifyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  errorsDiv.innerHTML = "";
  let errors = [];

  try {
    otpInput.value = validation.validateString(otpInput.value, "OTP", false);
  } catch (e) {
    errors = errors.concat(e);
  }

  if (errors.length !== 0) {
    for (const error of errors) {
      const pItem = document.createElement("p");
      pItem.textContent = error;
      errorsDiv.appendChild(pItem);
    }
  } else {
    verifyForm.submit();
  }
});

resetButton.addEventListener("click", () => {
  window.location.href = `/users/profile/${username.value}`;
});
