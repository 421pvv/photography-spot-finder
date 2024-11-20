document.addEventListener("DOMContentLoaded", function () {
  const filterButton = document.getElementById("filterButton");
  const filterOptions = document.getElementById("filterOptions");
  const applyFilterButton = document.getElementById("applyFilterButton");
  const clearFilterButton = document.getElementById("clearFilterButton");
  const filterForm = document.getElementById("filterForm");
  const tagsInput = document.getElementById("tags");
  const minRatingInput = document.getElementById("minRating");
  const minRatingValue = document.getElementById("minRatingValue");
  const fromDateInput = document.getElementById("fromDate");
  const toDateInput = document.getElementById("toDate");

  filterButton.addEventListener("click", toggleFilter);

  function toggleFilter() {
    const filterOptions = document.getElementById('filterOptions');
    const searchButton = document.getElementById('spotsSearchButton');

    if (filterOptions.hasAttribute('hidden')) {
      filterOptions.removeAttribute('hidden');
      searchButton.value = "Apply Filters";
    } else {
      filterOptions.setAttribute('hidden', true);
      searchButton.value = "Search";
    }
  }

  applyFilterButton.addEventListener("click", function (event) {
    event.preventDefault();

    const tags = tagsInput.value.trim();
    const minRating = minRatingInput.value;
    const fromDate = fromDateInput.value;
    const toDate = toDateInput.value;

    if (!tags && !minRating && !fromDate && !toDate) {
      alert("Please apply at least one filter.");
      return;
    }

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      alert("The 'From Date' cannot be later than the 'To Date'.");
      return;
    }

    const searchParams = new URLSearchParams();

    if (tags) searchParams.append("tags", tags);
    if (minRating) searchParams.append("minRating", minRating);
    if (fromDate) searchParams.append("fromDate", fromDate);
    if (toDate) searchParams.append("toDate" , toDate);

    filterForm.action = `/spots/search?${searchParams.toString()}`;
    filterForm.submit();
  });

  clearFilterButton.addEventListener("click", function (event) {
    event.preventDefault();

    tagsInput.value = "";
    minRatingInput.value = 0;
    minRatingValue.textContent = "0";
    fromDateInput.value = "";
    toDateInput.value = "";

    filterForm.action = "/spots/search";
  });

});
