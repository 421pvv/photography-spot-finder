// document.addEventListener("DOMContentLoaded", function () {
//   const filterButton = document.getElementById("filterButton");
//   const filterOptions = document.getElementById("filterOptions");
//   const applyFilterButton = document.getElementById("applyFilterButton");
//   const clearFilterButton = document.getElementById("clearFilterButton");
//   const filterForm = document.getElementById("filterForm");

//   filterButton.addEventListener("click", function () {
//     const isHidden = filterOptions.style.display === "none";
//     filterOptions.style.display = isHidden ? "block" : "none";
//     filterButton.textContent = isHidden
//       ? "Hide Filter Options"
//       : "Filter Options";
//   });

//   applyFilterButton.addEventListener("click", function (event) {
//     event.preventDefault();

//     const tags = document.getElementById("tags").value.trim();
//     const minRating = document.getElementById("minRating").value;
//     const fromDate = document.getElementById("fromDate").value;
//     const toDate = document.getElementById("toDate").value;

//     if (!tags && !minRating && !fromDate && !toDate) {
//       alert("Please apply at least one filter.");
//       return;
//     }

//     if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
//       alert("The 'From Date' cannot be later than the 'To Date'.");
//       return;
//     }

//     const searchParams = new URLSearchParams();

//     if (tags) searchParams.append("tags", tags);
//     if (minRating) searchParams.append("minRating", minRating);
//     if (fromDate) searchParams.append("fromDate", fromDate);
//     if (toDate) searchParams.append("toDate", toDate);

//     //filterForm.action = `/spots/search?${searchParams.toString()}`;
//     // console.log("Generated URL:", `/spots/search?${searchParams.toString()}`);
//     filterForm.submit();
//   });

//   clearFilterButton.addEventListener("click", function () {
//     tagsInput.value = '';
//     minRatingInput.value = 0;
//     minRatingValue.textContent = 0;
//     fromDateInput.value = '';
//     toDateInput.value = '';
//   });

//   filterOptions.style.display = "none";
// });


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
  
    // Toggle filter options visibility
    filterButton.addEventListener("click", function () {
      const isHidden = filterOptions.style.display === "none";
      filterOptions.style.display = isHidden ? "block" : "none";
      filterButton.textContent = isHidden
        ? "Hide Filter Options"
        : "Filter Options";
    });
  
    // Apply filters
    applyFilterButton.addEventListener("click", function (event) {
      event.preventDefault();
  
      const tags = tagsInput.value.trim();
      const minRating = minRatingInput.value;
      const fromDate = fromDateInput.value;
      const toDate = toDateInput.value;
  
      // Validation: Ensure at least one filter is applied
      if (!tags && !minRating && !fromDate && !toDate) {
        alert("Please apply at least one filter.");
        return;
      }
  
      // Validation: Ensure "From Date" is not later than "To Date"
      if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        alert("The 'From Date' cannot be later than the 'To Date'.");
        return;
      }
  
      const searchParams = new URLSearchParams();
  
      if (tags) searchParams.append("tags", tags);
      if (minRating) searchParams.append("minRating", minRating);
      if (fromDate) searchParams.append("fromDate", fromDate);
      if (toDate) searchParams.append("toDate");
  
      // Submit the form with filters
      filterForm.action = `/spots/search?${searchParams.toString()}`;
      filterForm.submit();
    });
  
    // Clear filters
    clearFilterButton.addEventListener("click", function () {
      // Reset all form fields
      tagsInput.value = "";
      minRatingInput.value = 0;
      minRatingValue.textContent = 0; // Update the displayed rating value
      fromDateInput.value = "";
      toDateInput.value = "";
  
      // Optionally, reset any backend filters or query parameters
      filterForm.action = "/spots/search";
    });
  
    // Initialize the filter options UI to be hidden
    filterOptions.style.display = "none";
  });
  