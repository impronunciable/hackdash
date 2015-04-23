/**
 * VIEW: Login Modal
 *
 */

var template = require('./templates/share.hbs');

module.exports = Backbone.Marionette.ItemView.extend({

  //--------------------------------------
  //+ PUBLIC PROPERTIES / CONSTANTS
  //--------------------------------------

  className: "share",
  template: template,

  ui: {
    'prg': '#prg',
    'pic': '#pic',
    'title': '#title',
    'desc': '#desc',
    'logo': '#logo',
    'contrib': '#contrib',
    'acnbar': '#acnbar',
    'searchbox': '#keywords',

    'status': 'select[name=status]',
    'preview': '.preview iframe',
    'code': '#embed-code'
  },

  events: {
    "click .close": "destroy",
    "click .checkbox": "onClickSetting",
    "keyup @ui.searchbox": "onKeyword",
    "click .btn-group>.btn": "sortClicked",
    "change @ui.status": "onChangeStatus",
  },

  //--------------------------------------
  //+ INHERITED / OVERRIDES
  //--------------------------------------

  initialize: function(){
    this.embedTmpl = _.template('<iframe src="<%= url %>" width="100%" height="450" frameborder="0" allowtransparency="true" title="Hackdash"></iframe>');
  },

  onRender: function(){
    this.reloadPreview();
    $('.modal > .modal-dialog').addClass('big-modal');
  },

  serializeData: function(){
    return _.extend({
      settings: this.settings,
      pSettings: this.projectSettings,
      statuses: this.getStatuses()
    }, this.model.toJSON());
  },

  onDestroy: function(){
    $('.modal > .modal-dialog').removeClass('big-modal');
  },

  //--------------------------------------
  //+ PUBLIC METHODS / GETTERS / SETTERS
  //--------------------------------------

  //--------------------------------------
  //+ EVENT HANDLERS
  //--------------------------------------

  hiddenSettings: [],
  keywords: '',
  sorting: '',
  status: '',

  onClickSetting: function(e){
    var ele = $('input', e.currentTarget);
    var id = ele.attr('id');
    var checked = $(ele).is(':checked');
    var idx = this.hiddenSettings.indexOf(id);

    if (ele.attr('disabled')){
      return;
    }

    function toggleLogo(){
      if (id === "title" && !this.ui.title.is(':checked')){
        this.ui.logo
          .attr('disabled', 'disabled')
          .parents('.checkbox').addClass('disabled');
      }
      else {
        this.ui.logo
          .attr('disabled', false)
          .parents('.checkbox').removeClass('disabled');
      }
    }

    if (checked){
      if(idx > -1){
        this.hiddenSettings.splice(idx, 1);
        this.reloadPreview();
      }

      toggleLogo.call(this);
      return;
    }

    if (idx === -1){
      this.hiddenSettings.push(id);
      this.reloadPreview();
      toggleLogo.call(this);
    }
  },

  onChangeStatus: function(){
    this.status = this.ui.status.val();

    if (this.status.toLowerCase() === 'all'){
      this.status = null;
    }

    this.reloadPreview();
  },

  onKeyword: function(){
    this.keywords = this.ui.searchbox.val();
    this.reloadPreview();
  },

  sortClicked: function(e){
    e.preventDefault();
    this.sorting = $('input[type=radio]', e.currentTarget)[0].id;
    this.reloadPreview();
  },

  //--------------------------------------
  //+ PRIVATE AND PROTECTED METHODS
  //--------------------------------------

  getStatuses: function(){
    var counts = hackdash.app.projects.getStatusCount();
    return _.map(counts, function(item, key){
      return { name: key, count: item };
    });
  },

  reloadPreview: function(){
    var embedUrl = window.location.protocol + "//" + window.location.host;
    var fragment = '/embed/dashboards/' + this.model.get('domain');
    var hide = 'hide=';
    var query = (this.keywords ? '&query=' + this.keywords : '');
    var sort = (this.sorting ? '&sort=' + this.sorting : '');
    var status = (this.status ? '&status=' + this.status : '');

    _.each(this.hiddenSettings, function(id){
      hide += id + ',';
    }, this);

    var url = embedUrl + fragment + '?' +
      (this.hiddenSettings.length ? hide : '') + query + sort + status;

    this.ui.preview.attr('src', url);
    this.ui.code.val(this.embedTmpl({ url: url }));
  },

  settings: [{
    code: 'title',
    name: 'Title'
  }, {
    code: 'desc',
    name: 'Description'
  }, {
    code: 'logo',
    name: 'Hackdash Logo'
  }],

  projectSettings: [{
    code: 'pprg',
    name: 'Progress',
    project: true
  }, {
    code: 'ptitle',
    name: 'Title',
    project: true
  }, {
    code: 'pcontrib',
    name: 'Contributors',
    project: true
  }, {
    code: 'pacnbar',
    name: 'Action Bar',
    project: true
  }]

});