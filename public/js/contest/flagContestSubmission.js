(function ($) {
  let flagButton = $(".submissionFlagButton");

  function flagContestSubmission(e) {
    const submision = $(e.target);
    let requestConfig = {
      method: "POST",
      url: `/contest/submission/flag/${submision.data("id")}`,
    };
    $.ajax(requestConfig)
      .then(() => {
        $(e.target).toggleClass("flagged");
      })
      .fail((xhr, status, e) => {
        if (xhr.status == "406") {
          console.log("here");
          $(e.target).toggleClass("flagged");

          alert("You already flagged this contest submission!");
        }
      });
  }
  if (flagButton.length) {
    flagButton.on("click", (e) => {
      console.log("flag");
      flagContestSubmission(e);
    });
  }
})(window.jQuery);
