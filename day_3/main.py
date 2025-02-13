import PyPDF2
from flask import Flask, jsonify
from collections import OrderedDict  # Tartiblangan lug‘at uchun

app = Flask(__name__)


def extract_text_from_pdf(file_path):
    """PDF fayldan barcha sahifalarning matnini tartiblangan JSON shaklida qaytaruvchi funksiya."""
    pages_text = OrderedDict()  # OrderedDict yordamida sahifalar tartib bilan saqlanadi
    try:
        with open(file_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page_num in range(len(reader.pages)):
                page = reader.pages[page_num]
                text = page.extract_text()
                if text:
                    pages_text[f"page_{page_num + 1}"] = text.strip()
                else:
                    pages_text[f"page_{page_num + 1}"] = "Matn topilmadi."
    except Exception as e:
        pages_text["error"] = f"Xato yuz berdi: {e}"
    return pages_text


@app.route("/pdf-data", methods=["GET"])
def get_pdf_data():
    """PDF ma'lumotlarini tartiblangan JSON formatida qaytaruvchi API."""
    pdf_file_path = "hack.pdf"  # Sizning PDF faylingizning yo'li
    extracted_text = extract_text_from_pdf(pdf_file_path)
    return jsonify(extracted_text)


if __name__ == "__main__":
    app.run(debug=True)
