from flask import Flask, render_template, request, session, send_file
from PyPDF2 import PdfMerger
import os

app = Flask(__name__, template_folder='.')
app.secret_key = 'supersecretkey'  # Secret key to manage user sessions

# Mapping of numbers to lists of PDFs
pdf_mapping = {
    "2w": ["EPDS.pdf"],
    "1mo": ["EPDS.pdf"],
    "2mo": ["CDC_2mo.pdf", "EPDS.pdf"], 
    "4mo": ["CDC_4mo.pdf", "EPDS.pdf"],
    "6mo": ["CDC_6mo.pdf", "EPDS.pdf"], 
    "9mo": ["CDC_9mo.pdf", "TB_and_Lead.pdf"],
    "12mo": ["CDC_1yr.pdf"],
    "1": ["CDC_1yr.pdf"],
    "15mo": [],
    "18mo": ["CDC_18mo.pdf", "M-Chat-R.pdf", "Lead.pdf"],
    "2": ["TB.pdf", "CDC_2yr.pdf", "M-Chat-R.pdf"],
    "2.5": [],
    "3": ["TB.pdf", "CDC_3yr.pdf"],
    "4": ["TB.pdf", "CDC_4yr.pdf"],
    "5": ["TB.pdf", "CDC_5yr.pdf"],
    "6": ["TB.pdf"],
    "7": ["TB.pdf"],
    "8": ["TB.pdf", "PSC-17.pdf"],
    "9": ["TB.pdf", "PSC-17.pdf"],
    "10": ["TB.pdf", "PSC-17.pdf"],
    "11": ["TB.pdf", "PSC-17.pdf"],
    "12": ["TB.pdf", "PSC-17.pdf"],
    "13": ["TB.pdf", "Adolescent.pdf"],
    "14": ["TB.pdf", "Adolescent.pdf"],
    "15": ["TB.pdf", "Adolescent.pdf"],
    "16": ["TB.pdf", "Adolescent.pdf"],
    "17": ["TB.pdf", "Adolescent.pdf"],
    "18": ["TB.pdf", "Adolescent.pdf", "Legal_Auth.pdf"],
    "18+": ["TB.pdf", "Adolescent.pdf"],
}

@app.route("/", methods=["GET", "POST"])
def index():
    # Initialize the list of numbers in the session if it doesn't exist
    if 'numbers' not in session:
        session['numbers'] = []

    if request.method == "POST":
        if 'add_number' in request.form:
            # Get the number from the form input
            number = request.form.get("number").strip()

            # Append the number to the session list (if it exists in the mapping)
            if not any(char.isalpha() for char in number) and int(number) > 18: 
                number = "18+"
            if number in pdf_mapping:
                session['numbers'].append(number)
                session.modified = True

        elif 'remove' in request.form:
            if session['numbers']:
                session['numbers'].pop()
                session.modified = True

        elif 'reset' in request.form:
            # Reset the session to clear the number list
            session['numbers'] = []
            session.modified = True
        
        elif 'merge' in request.form:
            pdf_files = []
            for num in session['numbers']:
                if num in pdf_mapping:
                    pdf_files.extend([os.path.join("static", "pdfs", pdf) for pdf in pdf_mapping[num]])

            if not pdf_files:  # Check if there are no PDFs to merge
                error_message = "Error: No PDFs to merge."  # Set error message
                print(error_message)  # Debug message
            else:
                print(f"PDF files to merge: {pdf_files}")  # Debug message
                
                # Output merged file
                output_pdf = "merged_output.pdf"
                merge_pdfs(pdf_files, output_pdf)

                # Check if the output file was created and is not empty
                if os.path.exists(output_pdf) and os.path.getsize(output_pdf) > 0:
                    return send_file(output_pdf, as_attachment=True)

    return render_template("index.html", numbers=session['numbers'])  # Pass the list of numbers to the template

def merge_pdfs(pdf_list, output):
    """Function to merge PDFs"""
    if not pdf_list:
        print("No PDF files to merge.")  # Debug message if the list is empty
        return
    
    merger = PdfMerger()
    for pdf in pdf_list:
        print(f"Merging: {pdf}")  # Debug message to see each file being merged
        merger.append(pdf)
    with open(output, "wb") as f_out:
        merger.write(f_out)

if __name__ == "__main__":
    app.run(debug=True)
