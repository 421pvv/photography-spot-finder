let signupForm = document.getElementById("signup-form");
let firstNameInput = document.getElementById("first-name");
let lastNameInput = document.getElementById("last-name");
let usernameInput = document.getElementById("user-name");
let passwordInput = document.getElementById("password");
let resetButton = document.getElementById("clear-signup-form");
let errorsDiv = document.getElementById("form-errors-div");

// checking the inputs in signup form
signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  errorsDiv.innerHTML = "";
  let errors = [];
  try {
    firstNameInput.value = validateString(
      firstNameInput.value,
      "First name",
      false
    );
  } catch (e) {
    errors = errors.concat(e);
  }
  try {
    lastNameInput.value = validateString(
      lastNameInput.value,
      "Last name",
      false
    );
  } catch (e) {
    errors = errors.concat(e);
  }
  try {
    usernameInput.value = validateUsername(usernameInput.value, "Username");
  } catch (e) {
    errors = errors.concat(e);
  }
  try {
    validatePassword(passwordInput.value, "Password");
  } catch (e) {
    errors = errors.concat(e);
  }
  if (errors.length !== 0) {
    const errorsList = document.createElement("ul");
    for (const error of errors) {
      const listItem = document.createElement("li");
      listItem.textContent = error;
      errorsList.appendChild(listItem);
    }
    errorsDiv.appendChild(errorsList);
  } else {
    signupForm.submit();
  }
});

// code to reset the form
if (resetButton) {
  resetButton.addEventListener("click", (event) => {
    event.preventDefault();
    errorsDiv.innerHTML = "";
    firstNameInput.value = "";
    lastNameInput.value = "";
    usernameInput.value = "";
    passwordInput.value = "";
  });
}

// Validation code
const usernamePolicies = [
  { regex: /^[^ ]{6,}$/, error: "Username must have at least six characters!" },
];

const passwordPolicies = [
  { regex: /.{8}/, error: "Password must have at least eight characters!" },
  {
    regex: /[a-z]{1}/,
    error: "Password must have at least one lowercase character!",
  },
  {
    regex: /[A-Z]{1}/,
    error: "Password must have at least one uppercase character!",
  },
  {
    regex: /[0-9]{1}/,
    error: "Password must have at least one numeric character!",
  },
  {
    regex: /[^a-zA-Z0-9]/,
    error: "Password must have at least one special character!",
  },
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

function validatePassword(str, varName) {
  let errors = [];
  try {
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
      throw [`String ${varName ? varName : ""} is empty or has only spaces!`];
    }
  } catch (e) {
    errors = errors.concat(e);
  }

  for (const policy of passwordPolicies) {
    if (typeof str !== "string" || !policy.regex.test(str)) {
      errors = errors.concat(policy.error);
    }
  }

  if (errors.length !== 0) {
    throw errors;
  }
}
