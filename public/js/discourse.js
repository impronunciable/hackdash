var discourseUrl = window.hackdash && window.hackdash.discourseUrl;
if (discourseUrl) {
  DiscourseEmbed = {
    discourseEmbedUrl: window.location.href,
    discourseUrl: discourseUrl
  };
  // The only way to re-execute Discourse embedding script seems to be to re-insert it.
  $("#discourse-comments").remove();
  $("#discourse-embed-script").remove();
  $(".discourse-ctn").append($("<div>", {
    "id": "discourse-comments"
  }));
  $("head").append($("<script>", {
    "async": true,
    "id": "discourse-embed-script",
    "src": DiscourseEmbed.discourseUrl + 'javascripts/embed.js',
    "type": "text/javascript"
  }));
}
