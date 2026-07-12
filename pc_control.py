import os
import subprocess
import datetime
import psutil

APPS = {
    "chrome": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "vscode": "C:\\Users\\mahee\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe",
    "explorer": "explorer.exe",
    "notepad": "notepad.exe",
    "spotify": "C:\\Users\\mahee\\AppData\\Roaming\\Spotify\\Spotify.exe",
    "whatsapp": "shell:AppsFolder\\5319275A.WhatsAppDesktop_cv1g1gvanyjgm!App",
}


def open_app(app_name):
    app_name = app_name.lower().strip()
    if app_name not in APPS:
        return f"I don't have {app_name} in my app list yet."

    try:
        target = APPS[app_name]
        if app_name == "whatsapp":
            subprocess.Popen(["explorer.exe", target])
        else:
            subprocess.Popen(target)
        return f"Opening {app_name}."
    except Exception as e:
        return f"Couldn't open {app_name}: {str(e)}"


def open_folder(path):
    try:
        os.startfile(path)
        return f"Opening {path}."
    except Exception as e:
        return f"Couldn't open that folder: {str(e)}"


def get_time():
    now = datetime.datetime.now()
    return f"It's {now.strftime('%I:%M %p')} on {now.strftime('%A, %B %d')}."


def get_battery():
    try:
        battery = psutil.sensors_battery()
        if battery:
            status = "charging" if battery.power_plugged else "not charging"
            return f"Battery is at {int(battery.percent)}%, {status}."
        return "Couldn't read battery info."
    except:
        return "Battery info unavailable."


def get_system_info():
    cpu = psutil.cpu_percent(interval=1)
    ram = psutil.virtual_memory()
    return f"CPU usage: {cpu}%. RAM: {ram.used // (1024**3)}GB used out of {ram.total // (1024**3)}GB."


def handle_pc_command(command):
    command = command.lower()

    if "open" in command:
        for app in APPS:
            if app in command:
                return open_app(app)
        return "Which app do you want me to open?"

    elif "time" in command or "date" in command:
        return get_time()

    elif "battery" in command:
        return get_battery()

    elif "system" in command or "cpu" in command or "ram" in command:
        return get_system_info()

    else:
        return None