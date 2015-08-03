
exports.notAllowed = function(req, res){
  res.send(405); //Not Allowd
};

exports.isAuth = function(req, res, next){
  if (!req.isAuthenticated()){
    return res.send(401, "User not authenticated");
  }

  next();
};
