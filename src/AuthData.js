var AuthData = (function() {
  
    var getName = function() {
      return sessionStorage.getItem("username");   
    };
  
    var setName = function(name) {
      sessionStorage.setItem("username", name);
    };

    var getAdmin = function() {
      return sessionStorage.getItem("admin"); 
    };
  
    var setAdmin = function(admintype) {
      sessionStorage.setItem("admin", JSON.stringify(admintype));     
    };

    var getAuth = function() {
      return sessionStorage.getItem("auth"); 
    };
  
    var setAuth = function(auth) {
      sessionStorage.setItem("auth", auth);     
    };

    var getLastThread = function() {
      return sessionStorage.getItem("lastthread"); 
    };
  
    var setLastThread = function(thread) {
      sessionStorage.setItem("lastthread", thread);     
    };

    var getSessionString = function() {
      return sessionStorage.getItem("sessionstring"); 
    };
  
    var setSessionString = function(ssn) {
      sessionStorage.setItem("sessionstring", ssn);     
    };

  
    return {
      getName: getName,
      setName: setName,
      getAdmin: getAdmin,
      setAdmin: setAdmin,
      getAuth: getAuth,
      setAuth: setAuth,
      getLastThread: getLastThread,
      setLastThread: setLastThread,
      getSessionString: getSessionString,
      setSessionString: setSessionString
    }
  
  })();

export default AuthData;