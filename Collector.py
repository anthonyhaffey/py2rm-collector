import eel
import os
import json

@eel.expose
def ask_python_exp(exp_name):
    experiment_file = open("web/User/Experiments/" + exp_name + ".json", "r")
    experiment_file  = experiment_file.read()
    experiment_json = json.loads(experiment_file)
    eel.python_gives_exp(experiment_json)

@eel.expose
def delete_exp(exp_name):
    os.remove("web/User/Experiments/" + exp_name + ".json")# delete file

@eel.expose
def pull_open_collector(username,
                        password,
                        organisation,
                        repository):
    if(organisation == ""):
        organisation = username
    try:
        push_collector(username,
                       password,
                       organisation,
                       repository,
                       "backup before updating from open-collector repository")
        os.system("git remote set-url --push origin https://github.com/" + organisation +"/" + repository + ".git")
        pull_open_collector_only()

    except:
        print("Something went wrong")
    finally:
        print("Attempt to update finished")
        #should trigger restart here

def pull_open_collector_only():
    os.system("remote set-url origin https://github.com/open-collector/open-collector.git")
    os.system("git fetch origin master")
    os.system("git merge -X theirs origin/master --allow-unrelated-histories -m'update from open-collector'")

@eel.expose
def push_collector(username,
                   password,
                   organisation,
                   repository,
                   this_message):
    print("trying to push to the repository")
    if organisation == "":
        organisation = username
    #create repository if that fails
    #os.system("git push https://github.com/open-collector/open-collector")
    try:
        os.system("git add .")
        os.system("git commit -m '" + this_message + "'")
        os.system("git push https://" + username + ":" + password + "@github.com/" + organisation + "/" + repository+ ".git")
    except:
        print("looks like I need to create a repository to push to")

        #need to make this a repository
        if(organisation != username):
            create_repository = organisation + "/" + repository
        else :
            create_repository = repository
        os.system('git init')
        os.system('eval "$(ssh-agent -s)"')
        os.system("hub create " + create_repository)
        os.system("git add .")
        os.system("git commit -m 'pushing from local'")
        os.system("git push https://" + username + ":" + password + "@github.com/" + organisation + "/" + repository+ ".git")
        #git config receive.denyCurrentBranch refuse
        #git push --set-upstream py2rm-collector

        #os.system("git push https://" + username + ":" + password + "@github.com/" + organisation + "/" + repository)
    finally:
        print("It all seems to have worked - mostly speaking")

@eel.expose
def update_collector(location,
                     this_rep_info,
                     password):
    this_rep_info = json.loads(this_rep_info)
    organisation  = this_rep_info["organisation"]
    repository    = this_rep_info["repository"]
    username      = this_rep_info["username"]

    if organisation == "":
        organisation = username

    #repository = split the location to get the repository name
    os.chdir(location)
    os.system("git pull https://github.com/open-collector/open-collector")

    eel.python_message("Succesfully updated on local machine!")

    if this_rep_info["online"]:
        os.system("git add .")
        os.system("git commit -m 'update from master'")
        os.system("git push https://" + username + ":" + password + "@github.com/" + organisation + "/" + repository)
        eel.python_message("Succesfully updated <b>" + organisation + "/" + repository)
        #git push https://username:password@myrepository.biz/file.git --all




@eel.expose
def load_master_json():
    #check if the uber mega file exists yet
    try:
        master_json = open("web/User/master.json", "r")
    except:
        master_json = open("web/kitten/Default/master.json", "r")
    finally:
        master_json = master_json.read()
        master_json = json.loads(master_json)
        eel.load_master_json(master_json)

@eel.expose
def save_data(experiment_name,participant_code,responses):
    print("experiment_name")
    print(experiment_name)
    print("participant_code")
    print(participant_code)
    print("responses")
    print(responses)
    if os.path.isdir("web/User/Data") == False:
        os.mkdir("web/User/Data")
    if os.path.isdir("web/User/Data/" + experiment_name) == False:
        os.mkdir("web/User/Data/" + experiment_name)
    experiment_file = open("web/User/Data/" + experiment_name+ "/" + participant_code + ".csv", "w")
    experiment_file.write(responses)


@eel.expose
def save_experiment(experiment_name,experiment_json):
    print("trying to save experiment")
    if os.path.isdir("web/User/Experiments") == False:
        os.mkdir("web/User/Experiments")
    print(experiment_name)
    print(json.dumps(experiment_json))
    experiment_file = open("web/User/Experiments/" + experiment_name + ".json", "w")
    experiment_file.write(json.dumps(experiment_json))


@eel.expose
def save_master_json(master_json):
    #detect if the "User" folder exists yet
    if os.path.isdir("web/User") == False:
        os.mkdir("web/User")
    master_file = open("web/User/master.json", "w")
    master_file.write(json.dumps(master_json))

####################
# Start Collector ##
####################

if os.path.isdir("web") == False:

    # more code here
    # check if github is installed

    pull_open_collector_only()



eel.init('web') #allowed_extensions=[".js",".html"]
eel.start('kitten/index.html')
