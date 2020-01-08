//
// Eel functions
//////////////////

eel.expose(load_master_json);
function load_master_json(this_json){
  master_json = this_json;
  //renderItems();
  list_surveys();
  first_load = true;
  list_experiments();
  wait_till_exists("list_graphics");
  list_boosts();
  list_trialtypes();
  initiate_actions();
  autoload_boosts();
}

eel.expose(start_online);
function start_online(){
  var github_url =  "https://" +
                    master_json.github.username +
                    ".github.io/" +
                    master_json.github.repository +
                    "/web/" +
                    dev_obj.version +
                    "/";

  window.open(github_url  + "RunStudy.html?platform=github&" +
              "location=" + master_json.exp_mgmt.experiment + "&" +
              "name="     + master_json.exp_mgmt.exp_condition ,"_blank");
}
// this is a hack to deal with asynchronous order of parts of the page loading
function wait_till_exists(this_function){
  if(typeof(window[this_function]) == "undefined"){
    setTimeout(function(){
      wait_till_exists(this_function);
    },100);
  } else {
    window[this_function]();
  }
}

switch(dev_obj.context){
  case "gitpod":
  case "server":
  case "github":
    check_authenticated();   //check dropbox
    break;
  case "localhost":
    eel.load_master_json();  //don't use dropbox
    break;
}
