export const usernamePolicies = [
  { regex: /^[^ ]{6,}$/, error: "Username must have at least six characters!" },
];

export const passwordPolicies = [
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

const validateString = (str, varName, checkObjectId) => {
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
  if (
    checkObjectId &&
    checkObjectId === true &&
    !ObjectId.isValid(trimmedStr)
  ) {
    throw [`String (${trimmedStr}) is not a valid ObjectId!`];
  }
  return trimmedStr;
};

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
    throw [`String ${varName ? varName : ""} is empty or has only spaces!`];
  }
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

function validateBoolean(bool, varname) {
  if (typeof bool !== "boolean") {
    throw [`Variable (${varname || ""}) is not of type boolean!`];
  }
}

// function to validate rating. A whole number in the range 1-10 (inclusive)
function validateRating(rating) {
  if (rating === undefined) {
    throw ["rating is missing"];
  }
  if (typeof rating !== "number") {
    throw ["rating is not of type number"];
  }

  if (isNaN(rating)) {
    throw ["rating is NaN"];
  }

  if (!isFinite(rating)) {
    throw ["rating is missing"];
  }

  if (!Number.isInteger(rating)) {
    throw ["Rating is not an integer"];
  }

  if (rating < 1 || rating > 10) {
    throw ["Rating must be between 1 to 10 (inclusive)"];
  }
}

export default {
  validateString,
  validateUsername,
  validatePassword,
  validateLoginPassword,
  validateBoolean,
  validateRating,
};
