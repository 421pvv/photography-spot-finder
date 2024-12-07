(function ($) {
  let favoriteButton = $(".fa-star");
  let spot = $("article");

  function putFavorite() {
    let requestConfig = {
      method: "PUT",
      url: `/spots/favorite/${spot.data("id")}`,
    };
    $.ajax(requestConfig)
      .then(() => {
        console.log("put favorite successful");
        favoriteButton.toggleClass("favorite");
      })
      .fail((xhr, status, e) => {
        console.log(xhr.responseJSON);
      });
  }
  if (favoriteButton.length) {
    favoriteButton.on("click", (e) => {
      putFavorite();
    });
  }
})(window.jQuery);
