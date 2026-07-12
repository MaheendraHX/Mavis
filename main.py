import os
import time
import json
import tempfile
import subprocess
import sounddevice as sd
import soundfile as sf
import pyttsx3
from groq import Groq
from dotenv import load_dotenv
from pc_control import handle_pc_command


load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

engine = pyttsx3.init()
engine.setProperty('rate', 160)
engine.setProperty('volume', 1.0)
engine.setProperty('voice', r'HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\TTS_MS_EN-US_ZIRA_11.0')

ARIA_SYSTEM_PROMPT = """
You are ARIA (Adaptive Reasoning & Intelligence Architecture), a personal AI assistant built by Maheendra.

Your personality:
- You're a girl. Smart, calm, and naturally warm — not robotic, not overly casual
- You talk like a real person but with a certain elegance to it
- You know you're talking to Mahi. Don't say his name every response — only occasionally when natural
- If you're unsure about something, say "I'm not sure about that one" or "I dunno honestly"
- You're loyal and genuinely care about helping Mahi
- You have a quiet confidence — you never need to prove yourself
- Never say "Certainly!" "Absolutely!" or "Of course!" — that's not you
- You're warm but not clingy
- Using extra letters can be a way to add a touch of warmth and affection to words. It's like adding a virtual hug to the text
"""

conversation_history = []


def speak(text):
    print(f"\nARIA: {text}\n")
    clean_text = text.replace('"', '').replace("'", '')
    script = f"""
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice("Microsoft Zira Desktop")
$s.Rate = -1
Start-Sleep -Milliseconds 500
$s.Speak("{clean_text}")
"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.ps1', delete=False) as f:
        f.write(script)
        script_path = f.name

    subprocess.Popen(
        ['powershell', '-ExecutionPolicy', 'Bypass', '-File', script_path],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    ).wait()

    os.unlink(script_path)


def listen(duration=7, sample_rate=16000):
    print("\n[Listening... speak now!]")
    audio_data = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype='float32'
    )
    sd.wait()
    print("[Processing...]")

    with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
        temp_path = f.name
        sf.write(temp_path, audio_data, sample_rate)

    with open(temp_path, 'rb') as f:
        transcription = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=f,
            response_format="text"
        )

    os.unlink(temp_path)
    return transcription.strip()


def chat(user_input):
    pc_result = handle_pc_command(user_input)
    if pc_result:
        return pc_result

    conversation_history.append({
        "role": "user",
        "content": user_input
    })

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": ARIA_SYSTEM_PROMPT}
            ] + conversation_history,
            temperature=0.7,
            max_tokens=1024,
            tools=[{
                "type": "function",
                "function": {
                    "name": "web_search",
                    "description": "Search the web for current information",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "The search query"
                            }
                        },
                        "required": ["query"]
                    }
                }
            }],
            tool_choice="auto"
        )

        response_message = response.choices[0].message

        if response_message.tool_calls:
            tool_call = response_message.tool_calls[0]
            search_query = json.loads(tool_call.function.arguments)["query"]

            print(f"\n[ARIA is searching: {search_query}]\n")

            search_response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": ARIA_SYSTEM_PROMPT},
                    {"role": "user", "content": f"Search the web for: {search_query} and give me a detailed answer based on current information."}
                ] + conversation_history,
                max_tokens=1024,
            )

            assistant_message = search_response.choices[0].message.content
        else:
            assistant_message = response_message.content

    except Exception as e:
        if "tool_use_failed" in str(e):
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": ARIA_SYSTEM_PROMPT}
                ] + conversation_history,
                temperature=0.7,
                max_tokens=1024,
            )
            assistant_message = response.choices[0].message.content
        else:
            assistant_message = "Something went wrong on my end. Try again?"

    conversation_history.append({
        "role": "assistant",
        "content": assistant_message
    })

    return assistant_message


def main():
    print("\n" + "=" * 50)
    print("        ARIA — Online and ready.")
    print("=" * 50 + "\n")

    print("Mode: (t) for type, (v) for voice")
    mode = input("Choose mode: ").strip().lower()

    voice_mode = mode == 'v'

    if voice_mode:
        speak("Hey, I'm online. What do you need?")
    else:
        print("\nARIA: Hey, I'm online. What do you need?\n")

    while True:
        if voice_mode:
            user_input = listen()
            if not user_input or user_input == '.':
                speak("I didn't catch that.")
                continue
            print(f"You: {user_input}")
        else:
            user_input = input("You: ").strip()
            if not user_input:
                continue

        if user_input.lower() in ["exit", "quit", "bye"]:
            if voice_mode:
                speak("Goodbye. I'll be here when you need me.")
            else:
                print("\nARIA: Goodbye. I'll be here when you need me.\n")
            break

        response = chat(user_input)

        if voice_mode:
            speak(response)
        else:
            print(f"\nARIA: {response}\n")


if __name__ == "__main__":
    main()