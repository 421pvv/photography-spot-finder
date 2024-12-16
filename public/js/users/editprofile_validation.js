import validation from "../validation/validation.js";
let editForm = document.getElementById("editprofile-form");
let firstNameInput = document.getElementById("first-name");
let lastNameInput = document.getElementById("last-name");
let emailInput = document.getElementById("email");
let bioInput = document.getElementById("bio");
let resetButton = document.getElementById("back-to-profile");
let errorsDiv = document.getElementById("form-errors-div");
let username = document.getElementById("current-username");

// checking the inputs in editprofile form
editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  errorsDiv.innerHTML = "";
  let errors = [];
  try {
    firstNameInput.value = validation.validateString(
      firstNameInput.value,
      "First name",
      false
    );
  } catch (e) {
    errors = errors.concat(e);
  }
  try {
    lastNameInput.value = validation.validateString(
      lastNameInput.value,
      "Last name",
      false
    );
  } catch (e) {
    errors = errors.concat(e);
  }

  try {
    emailInput.value = validation.validateUpdateEmail(emailInput.value);
  } catch (e) {
    errors = errors.concat(e);
  }

  try {
    bioInput.value = validation.validateUpdateString(
      bioInput.value,
      "bio",
      false
    );
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
    editForm.submit();
  }
});

resetButton.addEventListener("click", () => {
  window.location.href = `/users/profile/${username.value}`;
});
