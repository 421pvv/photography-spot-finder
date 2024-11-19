document.addEventListener("DOMContentLoaded", function () {
  const filterButton = document.getElementById("filterButton");
  const filterOptions = document.getElementById("filterOptions");
  const searchButton = document.getElementById("spotsSearchButton");
  const clearFilterButton = document.getElementById("clearFilterButton");
  const filterForm = document.getElementById("filterForm");

  filterButton.addEventListener("click", toggleFilter);

  function toggleFilter() {
    const filterOptions = document.getElementById("filterOptions");

    if (filterOptions.hasAttribute("hidden")) {
      filterOptions.removeAttribute("hidden");
      searchButton.value = "Apply Filters";
    } else {
      filterOptions.setAttribute("hidden", true);
      searchButton.value = "Search";
    }
  }

  searchButton.addEventListener("click", function (event) {
    event.preventDefault();

    const tags = document.getElementById("tags").value.trim();
    const minRating = document.getElementById("minRating").value;
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

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
    if (toDate) searchParams.append("toDate", toDate);

    //filterForm.action = `/spots/search?${searchParams.toString()}`;
    console.log("Generated URL:", `/spots/search?${searchParams.toString()}`);
    filterForm.submit();
  });

  filterOptions.style.display = "none";
});
