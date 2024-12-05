import validation from "../validation/validation.js";
let filterForm = document.getElementById("filterForm");
let keywordInput = document.getElementById("keyword");
let errorsDiv = document.getElementById("form-errors-div");

filterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  errorsDiv.innerHTML = "";
  let errors = [];
  try {
    keywordInput.value = validation.validateString(
      keywordInput.value,
      "Search Term",
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
