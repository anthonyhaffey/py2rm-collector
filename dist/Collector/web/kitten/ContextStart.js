//
// Eel functions
//////////////////

eel.expose(load_master_json);
function load_master_json(this_json){
  master_json = this_json;
  //renderItems();
  list_surveys();
  list_boosts();
  list_trialtypes();
	list_graphics();
  list_experiments();
	
}

function dropbox_check(){
  return $("#dropbox_account_email").html() !== "No dropbox account linked yet";
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