export const usernamePolicies = [
  {
    regex: /^.{6,20}$/,
    error: "Username must be between 6 to 20 characters long!",
  },
  {
    regex: /^[0-9A-Za-z]+$/,
    error: "Username must contain only alpha numeric characters!",
  },
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

function validateNumber(num, varName) {
  if (typeof num !== "number") {
    throw [`${varName || ""} is not a number`];
  }
  if (isNaN(num)) {
    throw [`${varName || ""} is a not a valid number`];
  }
}

function validateCoordinates(logitude, latitude) {
  logitude = parseFloat(logitude);
  latitude = parseFloat(latitude);
  validateNumber(logitude, "logitude");
  validateNumber(latitude, "latitude");
  if (logitude < -90 || logitude > 90) {
    throw `Longitude must be between -90 and 90`;
  }
  if (latitude < -180 || latitude > 180) {
    throw `Latitude must be between -180 and 180`;
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
    throw ["rating is not finite"];
  }

  if (!Number.isInteger(rating)) {
    throw ["Rating is not an integer"];
  }

  if (rating < 1 || rating > 10) {
    throw ["Rating must be between 1 to 10 (inclusive)"];
  }
}

const validateEmail = (email) => {
  email = validateString(email, "email");
  // got email regex from https://regex101.com/library/SOgUIV
  const emailRegex = /^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/;

  if (!emailRegex.test(email)) {
    throw [`Email (${email}) is not valid!`];
  }
  return email.toLowerCase();
};

const validateOTP = (otp) => {
  otp = validateString(otp, "OTP");

  const otpRegex = /^[0-9]{6}$/;

  if (!otpRegex.test(otp)) {
    throw [`OTP (${otp}) must be six digits!`];
  }
  return otp;
};

export default {
  validateString,
  validateUsername,
  validatePassword,
  validateLoginPassword,
  validateBoolean,
  validateRating,
  validateCoordinates,
  validateNumber,
  validateEmail,
  validateOTP,
};
