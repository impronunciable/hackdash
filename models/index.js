
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

module.exports = function(){
  
  mongoose.model('User', new Schema(require('./User')) );
  mongoose.model('Project', new Schema(require('./Project')) );
  mongoose.model('Dashboard', new Schema(require('./Dashboard')) );
  mongoose.model('Collection', new Schema(require('./Collection')) );

};
