(function ($) {
  let flagButton = $("#spotFlagButton");
  let spot = $("article");

  function flagSpot() {
    let requestConfig = {
      method: "POST",
      url: `/spots/flag/${spot.data("id")}`,
    };
    $.ajax(requestConfig)
      .then(() => {
        console.log("put flag successful");
        flagButton.toggleClass("flagged");
      })
      .fail((xhr, status, e) => {
        if (xhr.status == "406") {
          alert("You already flagged this spot!");
        }
      });
  }
  if (flagButton.length) {
    flagButton.on("click", (e) => {
      console.log("flag");
      flagSpot();
    });
  }
})(window.jQuery);
