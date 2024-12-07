(function ($) {
  let flagButton = $(".commentFlagButton");
  let spot = $("article");

  function flagComment(e) {
    const comment = $(e.target);
    let requestConfig = {
      method: "POST",
      url: `/spots/comment/flag/${comment.data("id")}`,
    };
    $.ajax(requestConfig)
      .then(() => {
        $(e.target).toggleClass("flagged");
      })
      .fail((xhr, status, e) => {
        if (xhr.status == "406") {
          alert("You already flagged this comment!");
        }
      });
  }
  if (flagButton.length) {
    flagButton.on("click", (e) => {
      console.log("flag");
      flagComment(e);
    });
  }
})(window.jQuery);
