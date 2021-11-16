
import datetime 
import requests
import os 

today = datetime.datetime.now()
end_of_month = today + datetime.timedelta(30)
current = today
weekday_counter = 0
week_counter = 0

tenk_steps = True 

url = os.environ['BASE_API_URL']

user_id = requests.get(f'{url}/users/?email_eq=test@yep.com').json()[0]["id"]
week_id = None

def generate_activity(date, as_set):
    print(date)
    activity = requests.post(f'{url}/activities', {
        "Day": date,
        "activity_set": as_set['id']       
    }).json()

activity_sets = [
    {
        "Name": "Weights - Gym",
        "Description": "Lift weights at the gym", 
        "planned_days": [ 0,1,4,5,6 ]        
    },
    {
        "Name": "TenK Steps - Exercise",
        "Description": "Walk Ten K Steps",
        "planned_days": [ 0,1,2,3,4,5,6 ]          
    },
    {
        "Name": "Datacamp - Study",
        "Description": "Study Datacamp courses",
        "planned_days": [ 0,1,2,3,4,5,6 ]         
    },
    {
        "Name": "Coursera - Study",
        "Description": "Study Coursera courses",
        "planned_days": [ 0,1,2,3,4,5,6 ]       
    },
    {
        "Name": "Plan Diet",
        "Description": "Don't eat any sugary foods",
        "planned_days": [ 0,1,2,4,5,6,7 ]         
    }
]

week_count = requests.get(f'{url}/weeks/count').json()
print(week_count)

if week_count == 0 :
    week_id = requests.post(f'{url}/weeks', {
        "StreakWeek": week_counter,
        "User": user_id,
        "WeekStartDate": today,
        "Current": True
    }).json()['id']
else:
    week_id = requests.get(f'{url}/weeks/1').json()['id']

for activity_set in activity_sets:
    activity_set["weeks"] = week_id
    
    as_set_resp = requests.get(f'{url}/activity-sets?Name_eq={activity_set["Name"]}')
    
    if len(as_set_resp.json()) == 0:
        as_set = requests.post(f'{url}/activity-sets', activity_set).json()
    else:
        print(as_set_resp.json())
        as_set = as_set_resp.json()[0]
    for day in activity_set["planned_days"]:
        generate_activity(today + datetime.timedelta(day), as_set) 

