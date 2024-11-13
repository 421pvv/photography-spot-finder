// document.addEventListener('DOMContentLoaded', function () {
//     const filterForm = document.getElementById('filterForm');
//     const filterButton = document.getElementById('filterButton');
//     const filterOptions = document.getElementById('filterOptions');
//     console.log("filter javascript")
//     filterButton.addEventListener('click', function () {
//         filterOptions.style.display = filterOptions.style.display === 'none' ? 'block' : 'none';
//     });

//     filterForm.addEventListener('submit', function (event) {
//         event.preventDefault();

//         const tags = document.getElementById('tags').value.trim();
//         const minRating = document.getElementById('minRating').value;
//         const fromDate = document.getElementById('fromDate').value;
//         const toDate = document.getElementById('toDate').value;

//         if (!tags && !minRating && !fromDate && !toDate) {
//             alert("Please apply at least one filter.");
//             return;
//         }

//         const filters = [];
//         let baseUrl = "/spots/allSpots?";

//         if (tags) {
//             filters.push(`tags=${encodeURIComponent(tags)}`);
//         }

//         if (minRating) {
//             filters.push(`minRating=${encodeURIComponent(minRating)}`);
//         }

//         if (fromDate && toDate) {
//             filters.push(`startDate=${encodeURIComponent(fromDate)}&endDate=${encodeURIComponent(toDate)}`);
//         }

//         if (filters.length > 0) {
//             window.location.href = baseUrl + filters.join('&');
//         }
//     });
// });


document.addEventListener('DOMContentLoaded', function () {
    const filterForm = document.getElementById('filterForm');
    const filterButton = document.getElementById('filterButton');
    const filterOptions = document.getElementById('filterOptions');
  
    // Toggle filter options
    filterButton.addEventListener('click', function () {
      const isHidden = filterOptions.hasAttribute('hidden');
      if (isHidden) {
        filterOptions.removeAttribute('hidden');
        filterButton.textContent = "Hide Filter Options";
      } else {
        filterOptions.setAttribute('hidden', 'true');
        filterButton.textContent = "Filter Options";
      }
    });
  
    // Check for at least one filter value before submission
    filterForm.addEventListener('submit', function (event) {
      const tags = document.getElementById('tags').value.trim();
      const minRating = document.getElementById('minRating').value;
      const fromDate = document.getElementById('fromDate').value;
      const toDate = document.getElementById('toDate').value;
  
      if (!tags && !minRating && !fromDate && !toDate) {
        event.preventDefault();
        alert("Please apply at least one filter.");
      }
    });
  });
  