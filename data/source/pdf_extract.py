import pdfplumber

# Open the PDF file
with pdfplumber.open("DVA-C02.pdf") as pdf:
    content = []
    for page in pdf.pages:
        text = page.extract_text()
        content.append(text)

# Save content to a JSON file
with open("pdf_content.txt", "w", encoding="utf-8") as txt_file:
    # Add page numbers and separate pages with a divider
    for i, page_text in enumerate(content):
        # txt_file.write(f"--- Page {i+1} ---\n\n")
        txt_file.write(page_text)
        txt_file.write("\n\n")

print("PDF content has been saved to pdf_content.txt")
