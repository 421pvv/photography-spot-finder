document.addEventListener('DOMContentLoaded', function () {
    const filterButton = document.getElementById('filterButton');
    const filterOptions = document.getElementById('filterOptions');
    const filterForm = document.getElementById('filterForm');
    const applyFilterButton = document.getElementById('applyFilterButton');
    
    filterButton.addEventListener('click', function () {
        filterOptions.style.display = filterOptions.style.display === 'none' ? 'block' : 'none';
    });

    applyFilterButton.addEventListener('click', function (event) {
        event.preventDefault(); 

        const tags = document.getElementById('tags').value.trim();
        const minRating = document.getElementById('minRating').value;
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;

        if (!tags && !minRating && !fromDate && !toDate) {
            alert("Please apply at least one filter.");
            return;
        }

        const searchParams = new URLSearchParams();

        if (tags) searchParams.append('tags', tags);
        if (minRating) searchParams.append('minRating', minRating);
        if (fromDate) searchParams.append('fromDate', fromDate);
        if (toDate) searchParams.append('toDate', toDate);

        filterForm.action = `/spots/search?${searchParams.toString()}`;

        filterForm.submit();
    });
});