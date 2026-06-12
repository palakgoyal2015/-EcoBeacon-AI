import re
from pypdf import PdfReader, PdfWriter

INPUT_PDF = "Project_Code_Documentation.pdf"
OUTPUT_PDF = "Project_Code_Documentation.pdf"


def normalized_body_text(page_text: str) -> str:
    text = page_text or ""
    text = text.replace("Project Code Documentation", "")
    text = re.sub(r"Page\s+\d+", "", text)
    text = "".join(ch for ch in text if not ch.isspace())
    return text


reader = PdfReader(INPUT_PDF)
writer = PdfWriter()
removed = []

for i, page in enumerate(reader.pages, start=1):
    body = normalized_body_text(page.extract_text() or "")
    if len(body) == 0:
        removed.append(i)
        continue
    writer.add_page(page)

with open(OUTPUT_PDF, "wb") as f:
    writer.write(f)

print(f"Original pages: {len(reader.pages)}")
print(f"Removed pages: {removed if removed else 'None'}")
print(f"Final pages: {len(writer.pages)}")
