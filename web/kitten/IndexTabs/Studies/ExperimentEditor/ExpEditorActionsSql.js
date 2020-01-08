/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2020 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>

		Kitten release (2019-2020) author: Dr. Anthony Haffey (a.haffey@reading.ac.uk)
*/
$("#delete_exp_btn").on("click",function(){
	var this_exp = $("#experiment_list").val();
	if(this_exp == null){
		bootbox.alert("You need to select a study to delete it");
	} else {
		bootbox.confirm("Are you sure you want to delete your experiment? <br><br> If you delete it you can go to your <a href='https://www.dropbox.com/home/Apps/Open-Collector' target='blank'>dropbox folder</a> to look up previous versions of your study.", function(result) {
			if(result){
				//delete from master_json
				delete (master_json.exp_mgmt.experiments[this_exp]);


				dbx.filesDelete({path:"/experiments/"+this_exp+".json"})
					.then(function(response) {
						$('#experiment_list option:contains('+ this_exp +')')[0].remove();
						$("#experiment_list").val(document.getElementById('experiment_list').options[0].value);
						master_json.exp_mgmt.experiment = $("#experiment_list").val();
						custom_alert(this_exp +" succesfully deleted");
						update_master_json();
						update_handsontables();
					})
					.catch(function(error) {
						report_error(error);
					});
			}
		});
	}
});
$("#download_experiment_button").on("click",function(){
	var experiment = master_json.exp_mgmt.experiment;
	var exp_json = master_json.exp_mgmt.experiments[experiment];
	var default_filename = experiment + ".json";
	bootbox.prompt({
		title: "What do you want to save this file as?",
		value: default_filename, //"data.csv",
		callback:function(result){
			if(result){
				download_collector_file(result,JSON.stringify(exp_json),"json");
			}
		}
	});
});
$("#new_proc_button").on("click",function(){
  var proc_template = new_experiment_data["Procedure"]["Procedure.csv"];
	bootbox.prompt("What would you like the name of the new procedure sheet to be?",function(new_proc_name){
		var experiment = master_json.exp_mgmt.experiment;
		var this_exp   = master_json.exp_mgmt.experiments[experiment];
		var current_procs = Object.keys(this_exp.all_procs);
		if(current_procs.indexOf(new_proc_name) !== -1){
			bootbox.alert("You already have a procedure sheet with that name");
		} else {
			new_proc_name = new_proc_name.replace(".csv","") + ".csv";

			master_json.exp_mgmt.experiments[experiment].all_procs[new_proc_name] = proc_template;
			$("#proc_select").append($('<option>', {
				text : new_proc_name
			}));
			$("#proc_select").val(new_proc_name);
			createExpEditorHoT(this_exp.all_procs[new_proc_name],"procedure",new_proc_name);	//sheet_name
		}
	});
});
$("#new_stim_button").on("click",function(){
	var stim_template = new_experiment_data["Stimuli"]["Stimuli.csv"];
	bootbox.prompt("What would you like the name of the new <b>Stimuli</b> sheet to be?",function(new_sheet_name){
		var experiment = master_json.exp_mgmt.experiment;
		var this_exp   = master_json.exp_mgmt.experiments[experiment];
		var current_stims = Object.keys(this_exp.all_stims);
		if(current_stims.indexOf(new_sheet_name) !== -1){
			bootbox.alert("You already have a <b>Stimuli</b> sheet with that name");
		} else {
			new_sheet_name = new_sheet_name.replace(".csv","") + ".csv";

			master_json.exp_mgmt.experiments[experiment].all_stims[new_sheet_name] = stim_template;
			$("#stim_select").append($('<option>', {
				text : new_sheet_name
			}));
			$("#stim_select").val(new_sheet_name);
			createExpEditorHoT(this_exp.all_stims[new_sheet_name],"stimuli",new_sheet_name);	//sheet_name
		}
	});
});
$("#new_experiment_button").on("click",function(){
	bootbox.prompt("What would you like to name the new experiment?",function(result){
		if(result !== null){
			if($("#experiment_list").text().indexOf(result) !== -1){
				bootbox.alert("You already have an experiment with this name");
			} else {
				new_experiment(result);
			}
		}
	});
});
$("#proc_select").on("change",function(){
	var experiment = master_json.exp_mgmt.experiment;
	var this_exp   = master_json.exp_mgmt.experiments[experiment];
	createExpEditorHoT(this_exp.all_procs[this.value], "procedure", this.value);
});
$("#rename_exp_btn").on("click",function(){
	bootbox.prompt("What would you like to rename this experiment to?",function(new_name){
		if($("#experiment_list").text().indexOf(new_name) !== -1){
			bootbox.alert("You already have an experiment with this name");
		} else { //proceed
			var original_name = $("#experiment_list").val();
			dbx.filesMove({from_path:"/Experiments/"+original_name+".json",to_path:"/Experiments/"+new_name+".json"})
				.then(function(result){
					master_json.exp_mgmt.experiments[new_name] =
					master_json.exp_mgmt.experiments[original_name];
					delete(master_json.exp_mgmt.experiments[original_name]);
					$.post("IndexTabs/Studies/AjaxMySQL.php",{
						action:"rename",
						original_name:original_name,
						new_name:new_name
					}, function(returned_result){
						update_master_json();
						list_experiments();
						$("#experiment_list").val(new_name);
					});
				})
				.catch(function(error){
					report_error(error);
				});
		}
		//confirm that there isn't another experiment with that name

	});
});
$("#rename_proc_button").on("click",function(){
	bootbox.prompt("What do you want to rename this <b>Procedure</b> sheet to?",function(new_proc_name){
		var experiment = master_json.exp_mgmt.experiment;
		var this_exp   = master_json.exp_mgmt.experiments[experiment];

		var current_procs = Object.keys(this_exp.all_procs);
		var current_proc = $("#proc_select").val();
		current_procs.splice(current_procs.indexOf(current_proc), 1);

		var current_proc_sheet = this_exp.all_procs[current_proc];

		if(current_procs.indexOf(new_proc_name) !== -1){
			bootbox.alert("You already have a procedure sheet with that name");
		} else {
			new_proc_name = new_proc_name.replace(".csv","") + ".csv";

			master_json.exp_mgmt.experiments[experiment].all_procs[new_proc_name] = current_proc_sheet;

			delete(master_json.exp_mgmt.experiments[experiment].all_procs[current_proc]);

			$("#proc_select").append($('<option>', {
				text : new_proc_name
			}));
			$("#proc_select").val(new_proc_name);

			$('#stim_select option[value="' + current_proc + '"]').remove();

			createExpEditorHoT(this_exp.all_procs[new_proc_name],"procedure",new_proc_name);	//sheet_name
		}
	});
});
$("#rename_stim_button").on("click",function(){
	bootbox.prompt("What do you want to rename this <b>Stimuli</b> sheet to?",function(new_sheet_name){
		var experiment = master_json.exp_mgmt.experiment;
		var this_exp   = master_json.exp_mgmt.experiments[experiment];

		var current_stims = Object.keys(this_exp.all_stims);
		var current_stim = $("#stim_select").val();
		current_stims.splice(current_stims.indexOf(current_stim), 1);

		var current_stim_sheet = this_exp.all_stims[current_stim];

		if(current_stims.indexOf(new_sheet_name) !== -1){
			bootbox.alert("You already have a <b>Stimuli</b> sheet with that name");
		} else {
			new_sheet_name = new_sheet_name.replace(".csv","") + ".csv";

			master_json.exp_mgmt.experiments[experiment].all_stims[new_sheet_name] = current_stim_sheet;

			delete(master_json.exp_mgmt.experiments[experiment].all_stims[current_stim]);

			$("#stim_select").append($('<option>', {
				text : new_sheet_name
			}));
			$("#stim_select").val(new_sheet_name);

			$('#stim_select option[value="' + current_stim + '"]').remove();

			createExpEditorHoT(this_exp.all_stims[new_sheet_name],"stimuli",new_sheet_name);	//sheet_name
		}
	});
});
$("#run_btn").on("click",function(){
  if(typeof(master_json.data.save_script) == "undefined" ||
     //test here for whether there is a github repository linked
     master_json.data.save_script == ""){
     var no_script_warning = '<h2 class="text-danger">You have not set up where the data will be saved online yet. Whilst your experiment will work locally, it WILL NOT work online. <span onclick="online_settings()"><em><u>Click here</u></em></span> to review your online settings.</h2>';
  } else {
    var no_script_warning = '';
  }
	var select_html = '<select id="select_condition" class="custom-select">';
	clean_conditions();
  exp_json.conditions.forEach(function(condition){
		select_html += "<option>" + condition.name + "</option>";
	});
	select_html += "</select>";

	bootbox.dialog({
		title:"Select a Condition",
		message: no_script_warning + "Which condition would you like to run? <br><br>" + select_html,
		buttons: {
      local:{
        label: "Localhost",
				className: 'btn-primary',
				callback: function(){
					window.open("RunStudy.html?platform=localhost&" +
                      "location=" + master_json.exp_mgmt.experiment + "&" +
                      "name=" + $("#select_condition").val(),"_blank");
				}
      },
			online: {
				label: "Online",
				className: 'btn-primary',
				callback: function(){
          if(typeof(master_json.github.repository) == "undefined"){
            bootbox.alert("You need to identify or create an online git repository  of Collector to run this online");
          } else {
						// put in code from collector install here
						//bootbox.dialog("<div id='github_dialog'></div>");
						//$("#github_dialog").load('IndexTabs/Studies/ExperimentEditor/GithubDialog.html');

						var dialog = bootbox.dialog({
							title: 'Synch with github repository',
							message: '<div class="jumbotron">' +
												  '<h1 class="display-4">Collector</h1>' +
												  '<p class="lead">Put in the information below to install an online versions of Collector</p>' +
												  '<div class="input-group mb-3">' +
												    '<div class="input-group-prepend">' +
												      '<span class="input-group-text bg-primary text-white">Your github username</span>' +
												    '</div>' +
												    '<input class="form-control" id="github_username"/>' +
												  '</div>' +
												  '<div class="input-group mb-3">'+
												    '<div class="input-group-prepend">'+
												     ' <span class="input-group-text bg-primary text-white">Your password</span>' +
												    '</div>' +
												    '<input class="form-control" id="github_password"/>' +
												  '</div>' +
													'<div class="input-group mb-3">'+
												    '<div class="input-group-prepend">'+
												     ' <span class="input-group-text bg-primary text-white">Your organisation (optional)</span>' +
												    '</div>' +
												    '<input class="form-control" id="github_organisation"/>' +
												  '</div>' +
												  '<div class="input-group mb-3">' +
												    '<div class="input-group-prepend">' +
												      '<span class="input-group-text bg-primary text-white">Your repository\'s name</span>' +
												    '</div>' +
												    '<input class="form-control" id="github_repository"/>' +
												  '</div>' +
												'</div>' +
												'<script>' +
													'$("#github_username").val(master_json.github.username);' +
													//'$("#github_organisation").val(master_json.github.organisation);' +
													'$("#github_repository").val(master_json.github.repository);' +
												'</script>',
							buttons: {
									synch: {
											label: "Synch",
											className: 'btn-primary',
											callback: function(){
												eel.push_collector($("#github_username").val(),
												                   $("#github_password").val(),
																					 $("#github_organisation").val(),
																					 $("#github_repository").val());

												var github_url =  "https://" +
																					master_json.github.username +
																					".github.io/" +
																					master_json.github.repository +
																					"/" +
																					dev_obj.version +
																					"/";

												window.open(github_url + "RunStudy.html?platform=github&" +
																		"location=" + master_json.exp_mgmt.experiment +"&" +
																		"name=" + $("#select_condition").val(),"_blank");

											}
									},
									cancel: {
											label: "Cancel",
											className: 'btn-secondary',
											callback: function(){
													//nothing, just close
											}
									},
							}
				    });
          }
				}
			},
      preview:{
        label: "Preview",
				className: 'btn-primary',
				callback: function(){
					window.open("RunStudy.html?platform=preview&" +
                      "location=" + master_json.exp_mgmt.experiment + "&" +
                      "name=" + $("#select_condition").val(),"_blank");
				}
      },
			cancel: {
				label: "Cancel",
				className: 'btn-secondary',
				callback: function(){
					//nada;
				}
			}
		}
	});
});
$("#save_btn").on("click", function(){
	$("#save_trial_type_button").click();
	$("#save_survey_btn").click();
  $("#save_snip_btn").click();
	$("#save_data_script_btn").click();

  if(typeof(master_json.keys) == "undefined" ||
		 typeof(master_json.keys.public_key) == "undefined"){
			 encrypt_obj.generate_keys();
	}

	var experiment = master_json.exp_mgmt.experiment;
  var this_exp = master_json.exp_mgmt.experiments[experiment];
      this_exp.public_key    = master_json.keys.public_key;
      this_exp.save_script = master_json.data.save_script;

	//parse procs for survey saving next
	if(typeof(this_exp) !== "undefined") {
 //   if(typeof(this_exp.parsed_procs) == "undefined"){
      this_exp.parsed_procs = {};
      var procs = Object.keys(this_exp.all_procs);
      procs.forEach(function(proc){
        this_exp.parsed_procs[proc] = Papa.parse(Papa.unparse(this_exp.all_procs[proc]),{header:true}).data;
      });
   // }

    //add surveys to experiment
    if(typeof(this_exp.surveys) == "undefined"){
      this_exp.surveys = {};
    }

    Object.keys(this_exp.parsed_procs).forEach(function(proc_name){

      this_proc = this_exp.parsed_procs[proc_name];
      this_proc.forEach(function(proc_row){
        proc_row = clean_obj_keys(proc_row);
        if(typeof(proc_row.survey) !== "undefined" &&
          proc_row.survey !== ""){
          var this_survey = proc_row.survey.toLowerCase();
          if(typeof(master_json.surveys.user_surveys[this_survey]) !== "undefined"){
            if(typeof(this_exp.surveys) == "undefined"){
              this_exp.surveys = {};
            }
            this_exp.surveys[this_survey] = master_json.surveys.user_surveys[this_survey];

            //check for boosts
            if(typeof(this_exp.boosts) == "undefined"){
              this_exp.boosts = {};
            }
            keyed_survey = Papa.parse(Papa.unparse(master_json.surveys.user_surveys[this_survey]),{header:true}).data;
            keyed_survey.forEach(function(key_row){
              clean_key_row = clean_obj_keys(key_row);
              if(typeof(clean_key_row.type) !== "undefined"){
                var survey_boost_type = clean_key_row.type.toLowerCase();
                if(typeof(master_json.boosts[survey_boost_type]) !== "undefined"){
                  this_exp.boosts[survey_boost_type] = {
                    location:'',
                    contents:master_json.boosts[survey_boost_type].contents
                  }
                }
              }
            });
          } else if(typeof(master_json.surveys.default_surveys[this_survey]) !== "undefined"){
            this_exp.surveys[proc_row.survey] = master_json.surveys.default_surveys[this_survey];
          }	else {
            bootbox.alert("The survey <b>" + proc_row.survey + "</b> in your procedure sheet doesn't appear to exist. Please check the spelling of it");
          }
        }
      });
    });

    //clean all the procedures
    var trialtypes = [];

    Object.keys(this_exp.parsed_procs).forEach(function(proc_name){
      this_exp.parsed_procs[proc_name] = this_exp.parsed_procs[proc_name].map(function(row){
        var cleaned_row = clean_obj_keys(row);
        if(trialtypes.indexOf(cleaned_row["trial type"]) == -1){
          trialtypes.push(cleaned_row["trial type"].toLowerCase());
        }
        return cleaned_row;
      });

    });
    trialtypes = trialtypes.filter(Boolean); //remove blanks
    if(typeof(this_exp.trialtypes) == "undefined"){
      this_exp.trialtypes = {};
    }

    // First loop is to make sure the experiment has all the trialtypes
    ///////////////////////////////////////////////////////////////////
    trialtypes.forEach(function(trialtype){
      if(typeof(master_json.trialtypes.user_trialtypes[trialtype]) == "undefined"){
        this_exp.trialtypes[trialtype] = master_json.trialtypes.default_trialtypes[trialtype];
      } else {
        this_exp.trialtypes[trialtype] = master_json.trialtypes.user_trialtypes[trialtype];
      }
    });

    if(dev_obj.context == "localhost"){
      eel.save_master_json(master_json);
      eel.save_experiment(experiment,     //experiment name
                          this_exp);      //experiment content
    }

    //dropbox check here
    if(dropbox_check()){
      dbx_obj.new_upload({path: "/Experiments/"+experiment+".json", contents: JSON.stringify(this_exp), mode:'overwrite'},
        function(returned_data){
          dbx.sharingCreateSharedLink({path:returned_data.path_lower})
            .then(function(returned_link){
              this_exp.location = returned_link.url;

              // if this is the experiment
              switch(dev_obj.context){
                case "github":
                  dbx_obj.new_upload({path: "/Experiments/"+experiment+".json", contents: JSON.stringify(this_exp), mode:'overwrite'},function(location_saved){
                      custom_alert("experiment_location sorted");
                      $("#run_link").attr("href","../"+ dev_obj.version + "/RunStudy.html?location="+this_exp.location);
                      update_master_json();
                    },function(error){
                      custom_alert("check console for error saving location");
                      bootbox.alert(error.error + "<br> Perhaps wait a bit and save again?");;
                    },
                    "filesUpload");
                  break;
                case "server":
                  $.post("AjaxExperimentLocation.php",
                    {
                      location:   this_exp.location,
                      experiment: experiment
                    },
                    function(returned_data){
                      custom_alert(returned_data);

                      dbx_obj.new_upload({path: "/Experiments/"+experiment+".json", contents: JSON.stringify(this_exp), mode:'overwrite'},function(location_saved){
                        custom_alert("experiment_location sorted");
                        $("#run_link").attr("href","../"+ master_json.exp_mgmt.version + "/RunStudy.html?location="+this_exp.location);
                        update_master_json();
                      },function(error){
                        custom_alert("check console for error saving location");
                        bootbox.alert(error.error + "<br> Perhaps wait a bit and save again?");;
                      },
                      "filesUpload");
                    }
                  );
                  break;
              }


            })
            .catch(function(error){
              report_error(error);
            });

        },function(error){
          alert(error);
        },
        "filesUpload");
    }
  }
});
$("#stim_select").on("change",function(){
	var experiment = master_json.exp_mgmt.experiment;
	var this_exp   = master_json.exp_mgmt.experiments[experiment];
	createExpEditorHoT(this_exp.all_stims[this.value], "stimuli", this.value);
});
$("#upload_experiment_button").on("click",function(){
	if($("#show_hide_upload").is(":visible")){
		$("#show_hide_upload").hide(500);
	} else {
		$("#show_hide_upload").show(500);
	}
});
$("#upload_experiment_input").on("change",function(){
	if (this.files && this.files[0]) {
		var myFile = this.files[0];
		var reader = new FileReader();
		var this_filename	= this.files[0].name;
		reader.addEventListener('load', function (e) {
			upload_exp_contents(e.target.result,this_filename);
		});
		reader.readAsBinaryString(myFile);
	}
});
$("#versions_btn").on("click",function(){
	if(typeof($_GET) == "undefined" || typeof($_GET.uid) == "undefined"){
		bootbox.alert("If you login a dropbox account, it'll automatically backup your experiment files");
	} else {
		experiment = master_json.exp_mgmt.experiment;
		var version_address = "https://www.dropbox.com/history/Apps/Open-Collector/experiments/"+experiment+".json?_subject_uid="+ $_GET.uid +"&undelete=1";

		$("#synch_btn").on("click",function(){
			alert("hi there");
		});

		var dialog = bootbox.dialog({
			title: 'Revert back to an earlier version',
			message: "<p>Click <a href='"+version_address+"' target='_blank'>here</a> to see version history of this file in dropbox<br><br>If you've reverted the current experiment '"+experiment+"' to an earlier version, click on the 'synch' button to load the reverted version of the experiment.</p>",
			buttons: {
					synch: {
							label: "Synch",
							className: 'btn-primary',
							callback: function(){
								$.get(master_json.exp_mgmt.experiments[experiment].location.replace("www.","dl."),function(result){
									master_json.exp_mgmt.experiments[experiment] = JSON.parse(result);
									update_master_json();
									update_handsontables();
								});
							}
					},
					cancel: {
							label: "Cancel",
							className: 'btn-secondary',
							callback: function(){
									//nothing, just close
							}
					},
			}
    });
	}
});
