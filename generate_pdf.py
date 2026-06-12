"""Generate a PDF documenting the project structure and source code."""
import os
from fpdf import FPDF

ROOT = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "Project_Code_Documentation.pdf")

# Folders/files to skip
SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".vscode", "__pycache__", "data"}
SKIP_FILES = {"package-lock.json", "Project_Code_Documentation.pdf", "generate_pdf.py"}
# File extensions/names we will inline as code
CODE_EXTS = {".js", ".jsx", ".ts", ".tsx", ".json", ".html", ".css", ".md", ".txt", ".cjs", ".mjs"}


def should_skip_dir(name: str) -> bool:
    return name in SKIP_DIRS or name.startswith(".")


def collect_files():
    files = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if not should_skip_dir(d)]
        for f in filenames:
            if f in SKIP_FILES:
                continue
            full = os.path.join(dirpath, f)
            rel = os.path.relpath(full, ROOT).replace("\\", "/")
            files.append(rel)
    files.sort()
    return files


def build_tree():
    """Return a list of strings representing folder structure."""
    lines = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = sorted([d for d in dirnames if not should_skip_dir(d)])
        rel = os.path.relpath(dirpath, ROOT)
        depth = 0 if rel == "." else rel.count(os.sep) + 1
        indent = "    " * depth
        folder_name = os.path.basename(ROOT) if rel == "." else os.path.basename(dirpath)
        lines.append(f"{indent}{folder_name}/")
        for f in sorted(filenames):
            if f in SKIP_FILES:
                continue
            lines.append(f"{indent}    {f}")
    return lines


def sanitize(text: str) -> str:
    # Replace characters not supported by core PDF fonts (latin-1)
    return text.encode("latin-1", "replace").decode("latin-1")


class PDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, "Project Code Documentation", align="R")
        self.ln(10)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"Page {self.page_no()}", align="C")


def add_tree_section(pdf: PDF, tree_lines):
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(20, 80, 40)
    pdf.cell(0, 10, "1. Folder Structure", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    pdf.set_font("Courier", "", 9)
    pdf.set_text_color(0, 0, 0)
    for line in tree_lines:
        safe = sanitize(line)
        if not safe:
            pdf.ln(4.5)
            continue
        for i in range(0, len(safe), 85):
            pdf.cell(0, 4.5, safe[i:i + 85], new_x="LMARGIN", new_y="NEXT")


def add_file_section(pdf: PDF, rel_path: str, idx: int):
    full = os.path.join(ROOT, rel_path.replace("/", os.sep))
    ext = os.path.splitext(rel_path)[1].lower()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(20, 80, 40)
    pdf.multi_cell(0, 8, sanitize(f"{idx}. {rel_path}"))
    pdf.ln(1)
    pdf.set_draw_color(20, 80, 40)
    pdf.set_line_width(0.4)
    y = pdf.get_y()
    pdf.line(pdf.l_margin, y, pdf.w - pdf.r_margin, y)
    pdf.ln(3)

    if ext not in CODE_EXTS:
        pdf.set_font("Helvetica", "I", 10)
        pdf.set_text_color(120, 120, 120)
        pdf.multi_cell(0, 6, f"[Binary or unsupported file type: {ext}] - content not embedded.")
        return

    try:
        with open(full, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception as e:
        pdf.set_font("Helvetica", "I", 10)
        pdf.multi_cell(0, 6, f"[Error reading file: {e}]")
        return

    pdf.set_font("Courier", "", 8)
    pdf.set_text_color(0, 0, 0)
    max_chars = 95  # hard wrap to avoid FPDF "no space" errors
    for raw_line in content.splitlines() or [""]:
        line = sanitize(raw_line.replace("\t", "    "))
        if not line:
            pdf.ln(3.5)
            continue
        for i in range(0, len(line), max_chars):
            chunk = line[i:i + max_chars]
            pdf.cell(0, 3.8, chunk, new_x="LMARGIN", new_y="NEXT")


def main():
    files = collect_files()
    tree_lines = build_tree()

    pdf = PDF(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_margins(15, 15, 15)

    add_tree_section(pdf, tree_lines)

    for i, rel in enumerate(files, start=1):
        add_file_section(pdf, rel, i)

    pdf.output(OUT)
    print(f"PDF generated: {OUT}")
    print(f"Total files documented: {len(files)}")


if __name__ == "__main__":
    main()
