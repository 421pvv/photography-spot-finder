import validation from "../validation/validation.js";
let editForm = document.getElementById("updatepassword-form");
let currPasswordInput = document.getElementById("currentpassword");
let newPasswordInput = document.getElementById("newpassword");
let resetButton = document.getElementById("back-to-profile");
let errorsDiv = document.getElementById("form-errors-div");
let username = document.getElementById("current-username");

// checking the inputs in editprofile form
editForm.addEventListener("submit", (event) => {
  event.preventDefault();
  errorsDiv.innerHTML = "";
  let errors = [];
  try {
    validation.validateLoginPassword(
      currPasswordInput.value,
      "Current Password"
    );
  } catch (e) {
    errors = errors.concat(e);
  }

  try {
    validation.validatePassword(newPasswordInput.value, "New Password");
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
