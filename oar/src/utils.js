  String.prototype.interpolate = function(params) {
    const names = Object.keys(params);
    for(let n of names){
      params[n] ||= ""; // MISSING VALUES DO NOT ERROR
    };
    const vals =  Object.values(params);
    return new Function(...names, `return \`${this}\`;`)(...vals);
  }   

