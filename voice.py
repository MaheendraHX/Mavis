import os
import tempfile
import sounddevice as sd
import soundfile as sf
import pyttsx3
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

engine = pyttsx3.init()
engine.setProperty('rate', 175)
engine.setProperty('volume', 1.0)

voices = engine.getProperty('voices')
for voice in voices:
    if 'female' in voice.name.lower() or 'zira' in voice.name.lower():
        engine.setProperty('voice', voice.id)
        break

def speak(text):
    print(f"\nARIA: {text}\n")
    engine.say(text)
    engine.runAndWait()

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

def test_voice():
    speak("Hey Mahi, voice systems are online. Say something and I'll repeat it back.")
    text = listen(duration=7)
    if text:
        print(f"\nYou said: {text}")
        speak(f"I heard you say: {text}")
    else:
        speak("I didn't catch that. Try again.")

if __name__ == "__main__":
    test_voice()