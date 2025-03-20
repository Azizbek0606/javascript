import eel
import vosk
import webrtcvad
import pyaudio
import os
import json

# Vosk modeli yo‘lini dinamik aniqlash
model_path = os.path.join(os.path.dirname(__file__), "vosk-model-small-en-us-0.15")
print(f"Model yo‘li: {model_path}")  # Debugging uchun yo‘lni chop etamiz
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model papkasi topilmadi: {model_path}")

# Modelni yuklash
try:
    model = vosk.Model(model_path)
except Exception as e:
    print(f"Modelni yuklashda xato: {e}")
    raise

rec = vosk.KaldiRecognizer(model, 16000)

# WebRTC VAD
vad = webrtcvad.Vad()
vad.set_mode(3)

# Audio oqimi
p = pyaudio.PyAudio()
stream = p.open(
    format=pyaudio.paInt16, channels=1, rate=16000, input=True, frames_per_buffer=480
)

# Eel bilan UI’ni ishga tushirish
eel.init("web")


# JavaScript’ga matn yuborish
@eel.expose
def get_audio_text():
    while True:
        data = stream.read(480, exception_on_overflow=False)
        if vad.is_speech(data, 16000):
            if rec.AcceptWaveform(data):
                result = rec.Result()
                # JavaScript’dagi update_text funksiyasini chaqirish
                eel.update_text(result)  # Bu JavaScript’da aniqlangan bo‘lishi kerak
            else:
                partial = json.loads(rec.PartialResult())
                if "partial" in partial and partial["partial"]:
                    # JavaScript’dagi update_partial funksiyasini chaqirish
                    eel.update_partial(
                        json.dumps(partial)
                    )  # Dict’ni JSON string’ga aylantirib yuboramiz


# Ilova oynasini ochish
eel.start("./web/index.html", size=(800, 600), block=False)

# Ovozli jarayonni boshlash
get_audio_text()
