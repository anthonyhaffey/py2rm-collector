/*  Collector (Garcia, Kornell, Kerr, Blake & Haffey)
    A program for running experiments on the web
    Copyright 2012-2016 Mikey Garcia & Nate Kornell


    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License version 3 as published by
    the Free Software Foundation.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>

		Kitten release (2019) author: Dr. Anthony Haffey (a.haffey@reading.ac.uk)
*/
function createExpEditorHoT(sheet,selected_handsonTable, sheet_name) {
	if (selected_handsonTable.toLowerCase() == "conditions") {
		var area = $("#conditionsArea");
		var table_name = 'handsOnTable_Conditions';
	} else if (selected_handsonTable.toLowerCase() == "stimuli") {
		var area = $("#stimsArea");
		var table_name = 'handsOnTable_Stimuli';
	} else if (selected_handsonTable.toLowerCase() == "procedure") {
		var area = $("#procsArea");
		var table_name = 'handsOnTable_Procedure';
	} else {
		boostrap.alert("There is a bug in your code - not clear which experiment sheet you want to edit/update/create etc.");
	}
	area.html("<span class='sheet_name' style='display: none'>" + sheet_name + "</span>");
	var container = $("<div>").appendTo(area)[0];
	window[table_name] = createHoT(container, JSON.parse(JSON.stringify(sheet)),sheet_name);
}

function get_HoT_data(current_sheet) { // needs to be adjusted for
    console.dir(current_sheet);
    var data = JSON.parse(JSON.stringify(current_sheet.getData()));

    // remove last column and last row
    data.pop();

    for (var i=0; i<data.length; ++i) {
        data[i].pop();

        for (var j=0; j<data[i].length; ++j) {
            if (data[i][j] === null) {
                data[i][j] = '';
            }
        }
    }

    // check for unique headers
    var unique_headers = [];

    for (var i=0; i<data[0].length; ++i) {
        while (unique_headers.indexOf(data[0][i]) > -1) {
            data[0][i] += '*';
        }

        unique_headers.push(data[0][i]);
    }

    return data;
}


function new_experiment(experiment){


  $("#run_button").prop('disabled', true);
  $("#run_button").prop('title', "Loading your new experiment, please wait a moment before previewing");

  if($("#experiment_list").text().indexOf(experiment) !== -1){
		bootbox.alert("Name already exists. Please try again.");
	} else {

		//create it first in dropbox, THEN update table with location - duh
		master_json.exp_mgmt.experiment 			  			= experiment;
		master_json.exp_mgmt.experiments[experiment] = new_experiment_data;

    update_handsontables();
    update_master_json();

		var this_path = "/Experiments/"+experiment+".json";

    function update_experiment_list(returned_data){
      $('#experiment_list').append($('<option>', {
        text : experiment
      }));
      $("#experiment_list").val(experiment);
      $("#save_btn").click();
      $("#run_button").prop('disabled', false);
      $("#run_button").prop('title', "");
    }
		dbx_obj.new_upload({path:this_path,contents:JSON.stringify(new_experiment_data)},function(result){
      dbx.sharingCreateSharedLink({path:this_path})
        .then(function(returned_link){
          switch(dev_obj.context){
            case "server":
              $.post(
                "IndexTabs/Simulator/AjaxMySQL.php",
                {
                  action: "new",
                  experiment: experiment,
                  location:returned_link.url
                },
                function(returned_data){
                  update_experiment_list(experiment);
                }
              );
              break;
              case "gitpod":
              case "github":
                update_experiment_list(experiment);
                break;
          }

        })
        .catch(function(error){
          report_error(error,"new_experiment trying to share link");
        });
    },function(error){
      report_error(error,"new_experiment trying to upload template to dropbox");
    },
    "filesUpload");
	}
}

function remove_from_list(experiment){
	var x = document.getElementById("experiment_list");
	x.remove(experiment);
	master_json.exp_mgmt.experiment =  $("#experiment_list").val();
	if(experiment !== "Select a dropbox experiment"){
		update_handsontables();
	}
}

function show_run_stop_buttons(){
  if(developer_obj.simulator_on_off == "on"){
    $("#run_stop_buttons").show();
  }
}

function stim_proc_selection(stim_proc,sheet_selected){
	var experiment = master_json.exp_mgmt.experiment;
	var this_exp   = master_json.exp_mgmt.experiments[experiment];
	createExpEditorHoT(this_exp.all_stims[sheet_selected],stim_proc,sheet_selected);	//sheet_name
}

function update_spreadsheet_selection() {
	var current_experiment = $("#experiment_name").val();

	var exp_data = experiment_files[current_experiment];

	var select_html = '<option class="condOption" value="Conditions.csv">Conditions</option>';

	select_html += '<optgroup label="Stimuli" class="stimOptions">';

	for (var i=0; i<exp_data['Stimuli'].length; ++i) {
		var file = exp_data['Stimuli'][i];
		select_html += '<option value="Stimuli/' + file + '">' + file + '</option>';
	}

	select_html += '</optgroup>';

	select_html += '<optgroup label="Procedures" class="procOptions">';

	for (var i=0; i<exp_data['Procedures'].length; ++i) {
		var file = exp_data['Procedures'][i];
		select_html += '<option value="Procedure/' + file + '">' + file + '</option>';
	}

	select_html += '</optgroup>';

	//$("#spreadsheet_selection").html(select_html);
}

function upload_exp_contents(these_contents,this_filename){
	parsed_contents  = JSON.parse(these_contents)
	cleaned_filename = this_filename.toLowerCase().replace(".json","");

	// note that this is a local function. right?
	function upload_to_master_json(exp_name,this_content) {
		master_json.exp_mgmt.experiment = exp_name;
		master_json.exp_mgmt.experiments[exp_name] = this_content;
		list_experiments();
		upload_trialtypes(this_content);
	}

	function upload_trialtypes(this_content){
		console.dir("this_content.trialtypes");
		console.dir(this_content.trialtypes);
		var trialtypes = Object.keys(this_content.trialtypes);
		trialtypes.forEach(function(trialtype){


			// ask the user if they want to replace the trialtype


		});
	}

	bootbox.prompt({
		title: "Save experiment?",
		message: "Please confirm that you would like to upload this experiment and if so, what you would like to call it?",
		value: cleaned_filename,

		callback: function(exp_name){
			if(typeof(master_json.exp_mgmt.experiments[exp_name]) == "undefined"){
				upload_to_master_json(exp_name,parsed_contents);
			} else {
				bootbox.confirm("This experiment_name already exists, would you like to overwrite it?",function(result){
					if(result){
						upload_to_master_json(exp_name,parsed_contents);
					}
				});
			}
		}
	});
}