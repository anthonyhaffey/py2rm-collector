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
function clean_conditions(){
  exp_json = master_json.exp_mgmt.experiments[master_json.exp_mgmt.experiment];	
	exp_json.conditions = collectorPapaParsed(exp_json.cond_array);	
  exp_json.conditions = exp_json.conditions.filter(row => row.procedure !== "");  
  exp_json.conditions.forEach(function(row){
    console.dir(row);
    console.dir(row.name);
    if(row.name.indexOf(" ") !== -1){
      bootbox.alert("You have a space in your condition: " + row.name + ". Please change the name to not have any spaces");
    }
  });
}

function simulate_experiment() {    
	clean_conditions();
	
	if(exp_json.conditions.length > 1){
		//detect if repetition in name 
		var unique_cond_names = {};
		var valid_cond_names  = true;
		exp_json.conditions.forEach(function(condition){
			if(typeof(unique_cond_names[condition.name]) == "undefined"){
				unique_cond_names[condition.name] = 1;
			} else {
				unique_cond_names[condition.name] ++;
				valid_cond_names  = false;
			}
		});
		if(valid_cond_names == false){
			
			//list invalid cond names 
			var repeat_cond_names = Object.keys(unique_cond_names).filter(cond_name => unique_cond_names[cond_name] !== 1);
			
			bootbox.alert("Check your <b>Names</b> column of your <b>Conditions</b> sheet. <b>"+ repeat_cond_names.join(", ")+"</b> occur(s) more than once");
			
		} else {			
			var select_html = '<select id="select_condition" class="custom-select">';
			exp_json.conditions.forEach(function(condition){
				select_html += "<option>" + condition.name + "</option>";
			});
			select_html += "</select>";
			
			bootbox.dialog({
				title:"Select a Condition",
				message:"The multiple conditions functionality <b>HAS NOT</b> been finalised. Please only create experiments with one condition in this version of Collector, and just select the top option when running it. <br><br>" + select_html, //There are multiple conditions in this experiment - please select which one you would like to simulate:
				buttons: {
					start: {
						label: "Start",
						className: 'btn-primary',
						callback: function(){
							var selected_cond_name = $("#select_condition").val();
							
							exp_condition = selected_cond_name;
							//exp_json.this_condition = exp_json.conditions.filter(condition => condition.name == selected_cond_name)[0];
              $("#post_welcome").show();
							initiate_experiment();
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
		}		
	} else {
		exp_json.this_condition = exp_json.conditions[0];
		$("#post_welcome").show();
		initiate_experiment();	
	}	
}