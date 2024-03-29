var AuthData = (function() {
  
    var getName = function() {
      return sessionStorage.getItem("username");   
    };
  
    var setName = function(name) {
      sessionStorage.setItem("username", name);
    };

    var getID = function() {
      return sessionStorage.getItem("userID");   
    };
  
    var setID = function(id) {
      sessionStorage.setItem("userID", id);
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
      return sessionStorage.getItem("sessionString"); 
    };
  
    var setSessionString = function(ssn) {
      sessionStorage.setItem("sessionString", ssn);     
    };

  
    return {
      getName: getName,
      setName: setName,
      getID: getID,
      setID: setID,
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