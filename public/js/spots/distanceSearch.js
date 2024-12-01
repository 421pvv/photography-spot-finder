import validation from "../validation/validation.js";
function errorMessage(msg) {
  return `<p class="formInputError" > ${msg} </p>`;
}
(function ($) {
  $(document).ready(() => {
    const distanceSearchForm = $("#filterForm");
    distanceSearchForm.submit((event) => {
      event.preventDefault();

      $(".formInputError").remove();
      const distanceInput = distanceSearchForm.find("#distance");

      let errors = [];
      let distance;
      try {
        distance = parseFloat(distanceInput.val());
        validation.validateNumber(distance, "Search Distance");
        if (distance <= 0) {
          throw `Search Distance must be positive!`;
        }
      } catch (e) {
        errors = errors.concat(e);
      }

      try {
        validation.validateCoordinates(distanceLocation[0], userLocation);
      } catch (e) {
        errors = errors.concat(
          "Location not evaludated yet! Please try again."
        );
      }

      if (errors.length > 0) {
        errors.forEach((error) => {
          distanceSearchForm.append(errorMessage(error));
        });
      } else {
        removeCurrentMarkers();
        searchLocationByLocation(distance);
      }
    });

    function removeCurrentMarkers() {
      currentSpots.forEach((marker) => {
        marker.remove();
      });
      currentSpots = [];
    }

    function searchLocationByLocation(distance) {
      const data = {
        longitude: distanceLocation[0],
        latitude: distanceLocation[1],
        distance,
      };
      let requestConfig = {
        method: "GET",
        url: `/spots/byDistanceJSON`,
        data: data,
      };

      $.ajax(requestConfig)
        .then(function (result) {
          let spotsBounds = new mapboxgl.LngLatBounds(
            userLocation,
            userLocation
          );
          console.log("here");
          for (const spot of result.data) {
            const marker = new mapboxgl.Marker({ color: "#b40219" })
              .setLngLat(spot.location.coordinates)
              .setPopup(
                new mapboxgl.Popup({ offset: 25 }).setHTML(
                  `
                    <div class="spotPopup">
            <h2><a href="/spots/details/${spot._id.toString()}">
            ${spot.name}
          </a></h2>
        <img src="${spot.images[0].url.toString()}" alt="${spot.name} top image"
          onerror="this.onerr=null; this.src='/public/images/no_image_avaliable.jpeg" />
  
        <div class="spot-info">
          
          <p>Average Rating: ${spot.averageRating} out of 10</p>
          <p> Posted on ${spot.createdAt.toString()}</p>
        </div>
        </div>
            `
                )
              )
              .addTo(map);

            currentSpots.push(marker);
            spotsBounds.extend(spot.location.coordinates);
          }
          map.fitBounds(spotsBounds);
        })
        .catch((e) => {
          distanceSearchForm.append(errorMessage(e));
        });
    }
  });
})(window.jQuery);
