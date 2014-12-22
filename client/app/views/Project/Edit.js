/**
 * VIEW: Project
 * 
 */
 
var template = require('./templates/edit.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "span6 span-center",
  template: template,

  ui: {
    "title": "input[name=title]",
    "description": "textarea[name=description]",
    "link": "input[name=link]",
    "tags": "input[name=tags]",
    "status": "select[name=status]",
  },

  events: {
    "click #ghImportBtn": "showGhImport",
    "click #searchGh": "searchRepo",

    "click #save": "save",
    "click #cancel": "cancel"
  },

  templateHelpers: {
    typeForm: function(){
      return (this._id ? "Edit Project" : "Create Project" );
    },
    getTags: function(){
      if (this.tags){
        return this.tags.join(',');
      }
    },
    statuses: function(){
      return window.hackdash.statuses.split(",");
    }
  },

  modelEvents: {
    "change": "render"
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  onDomRefresh: function(){
    this.initSelect2();
    this.initImageDrop();
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  showGhImport: function(e){
    $(".gh-import", this.$el).removeClass('hidden');
    $(e.currentTarget).remove();

    e.preventDefault();
  },

  searchRepo: function(e){
    var repo = $("#txt-repo", this.$el).val();

    if(repo.length) {
      $.ajax({
        url: 'https://api.github.com/repos/' + repo,
        dataType: 'json',
        contentType: 'json',
        context: this
      }).done(this.fillGhProjectForm);
    }

    e.preventDefault();
  },

  save: function(){

    var toSave = {
      title: this.ui.title.val(),
      description: this.ui.description.val(),
      link: this.ui.link.val(),
      tags: this.ui.tags.val().split(','),
      status: this.ui.status.val(),
      cover: this.model.get('cover')
    };

    this.cleanErrors();

    $("#save", this.$el).button('loading');

    this.model
      .save(toSave, { patch: true, silent: true })
      .success(this.redirect.bind(this))
      .error(this.showError.bind(this));
  },

  cancel: function(){
    this.redirect();
  },

  redirect: function(){
    hackdash.app.router.navigate("/", { trigger: true, replace: true });
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  //TODO: move to i18n
  errors: {
    "title_required": "Title is required",
    "description_required": "Description is required"
  },

  showError: function(err){
    $("#save", this.$el).button('reset');

    if (err.responseText === "OK"){
      this.redirect();
      return;
    }

    var error = JSON.parse(err.responseText).error;

    var ctrl = error.split("_")[0];
    this.ui[ctrl].parents('.control-group').addClass('error');
    this.ui[ctrl].after('<span class="help-inline">' + this.errors[error] + '</span>');
  },

  cleanErrors: function(){
    $(".error", this.$el).removeClass("error");
    $("span.help-inline", this.$el).remove();
  },

  initSelect2: function(){
    if (this.model.get('status')){
      this.ui.status.val(this.model.get('status'));
    }
    
    this.ui.status.select2({
      minimumResultsForSearch: 10
    });


    $('a.select2-choice').attr('href', null);

    this.ui.tags.select2({
      tags:[],
      formatNoMatches: function(){ return ''; },
      maximumInputLength: 20,
      tokenSeparators: [","]
    });
  },

  initImageDrop: function(){
    var self = this;
    var $dragdrop = $('#dragdrop', this.$el);
    var input = $('#cover_fall', $dragdrop);

    input.on('click', function(e){
      e.stopPropagation();
    });

    $dragdrop.on('click', function(e){
      input.click();
      e.preventDefault();
      return false;
    });

    $dragdrop.filedrop({
      fallback_id: 'cover_fall',
      url: hackdash.apiURL + '/projects/cover',
      paramname: 'cover',
      allowedfiletypes: ['image/jpeg','image/png','image/gif'],
      maxfiles: 1,
      maxfilesize: 3,
      dragOver: function () {
        $dragdrop.css('background', 'rgb(226, 255, 226)');
      },
      dragLeave: function () {
        $dragdrop.css('background', 'rgb(241, 241, 241)');
      },
      drop: function () {
        $dragdrop.css('background', 'rgb(241, 241, 241)');
      },
      uploadFinished: function(i, file, res) {
        self.model.set({ "cover": res.href }, { silent: true });

        $dragdrop
          .css('background', 'url(' + res.href + ')')
          .addClass("project-image")
          .children('p').hide();
      }
    });
  },

  fillGhProjectForm: function(project) {
    this.ui.title.val(project.name);
    this.ui.description.text(project.description);
    this.ui.link.val(project.html_url);
    this.ui.tags.select2("data", [{id: project.language, text:project.language}]);
    this.ui.status.select2("val", "building");
  }

});