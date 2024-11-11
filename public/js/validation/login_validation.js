let loginForm = document.getElementById("login-form");
let usernameInput = document.getElementById("user-name");
let passwordInput = document.getElementById("password");
let resetButton = document.getElementById("clear-login-form");
let errorsDiv = document.getElementById("form-errors-div");

// checking the inputs in login form
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  errorsDiv.innerHTML = "";
  let errors = [];
  try {
    usernameInput.value = validateUsername(usernameInput.value, "Username");
  } catch (e) {
    errors = errors.concat(e);
  }
  try {
    validateLoginPassword(passwordInput.value, "Password");
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
    loginForm.submit();
  }
});

// code to reset the form
if (resetButton) {
  resetButton.addEventListener("click", (event) => {
    event.preventDefault();
    errorsDiv.innerHTML = "";
    usernameInput.value = "";
    passwordInput.value = "";
  });
}

// Validation code
const usernamePolicies = [
  { regex: /^[^ ]{6,}$/, error: "Username must have at least six characters!" },
];
validateString = (str, varName) => {
  if (str == undefined) {
    throw [
      `Expected ${
        varName ? varName : ""
      } to be of type string, but it is not provided!`,
    ];
  }
  if (str == null) {
    throw [
      `Expected ${
        varName ? varName : ""
      } to be of type string, but it is null!`,
    ];
  }
  if (Array.isArray(str)) {
    throw [
      `Expected ${
        varName ? varName : ""
      } to be of type string, but it is an array!`,
    ];
  }
  if (typeof str !== "string") {
    throw [
      `Expected ${
        varName ? varName : ""
      } to be of type string, but it is of type ${typeof str}!`,
    ];
  }
  const trimmedStr = str.trim();
  if (trimmedStr.length === 0) {
    throw [`String ${varName ? varName : ""} is empty or has only spaces!`];
  }
  return trimmedStr;
};

function validateUsername(str, varName) {
  let errors = [];
  try {
    str = validateString(str, varName);
  } catch (e) {
    errors = errors.concat(e);
  }

  for (const policy of usernamePolicies) {
    if (typeof str !== "string" || !policy.regex.test(str)) {
      errors = errors.concat(policy.error);
    }
  }

  if (errors.length !== 0) {
    throw errors;
  }

  return str.toLowerCase();
}

const validateLoginPassword = (str, varName) => {
  if (str == undefined) {
    throw [
      `Expected ${
        varName ? varName : ""
      } to be of type string, but it is not provided!`,
    ];
  }
  if (str == null) {
    throw [
      `Expected ${
        varName ? varName : ""
      } to be of type string, but it is null!`,
    ];
  }
  if (Array.isArray(str)) {
    throw [
      `Expected ${
        varName ? varName : ""
      } to be of type string, but it is an array!`,
    ];
  }
  if (typeof str !== "string") {
    throw [
      `Expected ${
        varName ? varName : ""
      } to be of type string, but it is of type ${typeof str}!`,
    ];
  }
  if (str.length === 0) {
    throw [`String ${varName ? varName : ""} is empty`];
  }
};
