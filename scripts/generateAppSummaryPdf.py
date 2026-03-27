from pathlib import Path

from pypdf import PdfReader
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "output" / "pdf"
TMP_DIR = ROOT / "tmp" / "pdfs"
OUTPUT_PATH = OUTPUT_DIR / "app-summary-one-page.pdf"

PAGE_WIDTH, PAGE_HEIGHT = letter
MARGIN = 40
GUTTER = 18
CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)
LEFT_COL_W = (CONTENT_WIDTH - GUTTER) * 0.56
RIGHT_COL_W = CONTENT_WIDTH - GUTTER - LEFT_COL_W

TITLE_COLOR = colors.HexColor("#0F2742")
ACCENT = colors.HexColor("#E86A33")
TEXT = colors.HexColor("#182433")
MUTED = colors.HexColor("#566677")
BORDER = colors.HexColor("#D7E0E8")
PANEL = colors.HexColor("#F7F9FB")

TITLE_FONT = "Helvetica-Bold"
BODY_FONT = "Helvetica"
BULLET = "-"


WHAT_IT_IS = (
    "A React 19 + D3 single-page dashboard for podcast analytics. "
    "It reads episode metrics from data/data.csv, derives growth, "
    "retention, loyalty, and conversion metrics, and presents six charts "
    "plus editorial recommendations."
)

WHO_ITS_FOR = [
    "Exact named persona: Not found in repo.",
    "Primary user (inferred from UI copy): podcast creators, editors, or growth leads who want to learn what drives downloads, completion, returning listeners, shares, and subscriber conversion.",
]

FEATURES = [
    "Loads bundled CSV data and attempts a remote refresh through /api/podcast-data.",
    "Builds summary cards for episodes analyzed, downloads, completion, and subscriber conversion.",
    "Generates editorial recommendation cards from topic, duration, guest, share, and efficiency metrics.",
    "Shows six D3 views: trend, retention scatter, audience mix, topic leaderboard, conversion bubble, and conversion ranking.",
    "Infers episode topics from title/description rules and classifies guest format and duration band.",
    "Caches remote CSV results in browser localStorage for 30 minutes and falls back gracefully to local data.",
]

HOW_IT_WORKS = [
    "UI: Vite + React mounts App in src/main.jsx and renders a single dashboard page in src/App.jsx.",
    "Data prep: src/podcastData.js parses CSV rows, computes derived fields, aggregates summary/topic/duration/guest metrics, and builds recommendation text.",
    "Charts: src/charts.jsx draws SVG charts with D3 inside React effects.",
    "Sync path: vite.config.js registers a Vite middleware at /api/podcast-data; it calls scripts/podcastCsvSync.js.",
    "File service: scripts/podcastCsvSync.js serves fresh local CSV when under 30 minutes old, otherwise fetches a remote CSV, writes data/data.csv, and returns it.",
    "Backend/database/auth: Not found in repo.",
]

HOW_TO_RUN = [
    "Run npm install.",
    "Run npm run dev.",
    "Open the local Vite URL shown in the terminal; the app mounts from index.html and src/main.jsx.",
    "Optional verification: run npm run build.",
]


def wrap_text(text, font_name, font_size, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if stringWidth(candidate, font_name, font_size) <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def section_height(title, body_lines, title_gap=14, line_height=11, bottom_gap=8):
    return title_gap + (len(body_lines) * line_height) + bottom_gap


def make_body_lines():
    lines = []
    lines.extend(wrap_text(WHAT_IT_IS, BODY_FONT, 9.2, LEFT_COL_W))
    lines.append("")
    for item in WHO_ITS_FOR:
        wrapped = wrap_text(f"{BULLET} {item}", BODY_FONT, 9.0, LEFT_COL_W)
        lines.extend(wrapped)
    return lines


def make_bullet_lines(items, width, font_size=8.8):
    lines = []
    for item in items:
        wrapped = wrap_text(f"{BULLET} {item}", BODY_FONT, font_size, width)
        lines.extend(wrapped)
    return lines


def draw_section(c, x, y_top, width, title, lines, body_font_size=9.0, line_height=11.2):
    height = section_height(title, lines, line_height=line_height)
    c.setFillColor(PANEL)
    c.setStrokeColor(BORDER)
    c.roundRect(x, y_top - height, width, height, 12, fill=1, stroke=1)

    text = c.beginText()
    text.setTextOrigin(x + 12, y_top - 18)
    text.setFont(TITLE_FONT, 11)
    text.setFillColor(TITLE_COLOR)
    text.textLine(title)
    text.moveCursor(0, 2)
    text.setFont(BODY_FONT, body_font_size)
    text.setFillColor(TEXT)

    for line in lines:
      if line:
        text.textLine(line)
      else:
        text.textLine("")

    c.drawText(text)
    return y_top - height - 10


def generate_pdf():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    c = canvas.Canvas(str(OUTPUT_PATH), pagesize=letter)
    c.setTitle("Poddata App Summary")

    c.setFillColor(colors.white)
    c.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, stroke=0, fill=1)

    c.setFillColor(TITLE_COLOR)
    c.setFont(TITLE_FONT, 22)
    c.drawString(MARGIN, PAGE_HEIGHT - 42, "Poddata App Summary")
    c.setFillColor(ACCENT)
    c.rect(MARGIN, PAGE_HEIGHT - 50, 54, 4, stroke=0, fill=1)
    c.setFillColor(MUTED)
    c.setFont(BODY_FONT, 9)
    c.drawRightString(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 40, "Evidence derived from repo files only")

    left_x = MARGIN
    right_x = MARGIN + LEFT_COL_W + GUTTER
    top_y = PAGE_HEIGHT - 68

    left_y = top_y
    right_y = top_y

    overview_lines = make_body_lines()
    feature_lines = make_bullet_lines(FEATURES, LEFT_COL_W - 24, font_size=8.7)
    architecture_lines = make_bullet_lines(HOW_IT_WORKS, RIGHT_COL_W - 24, font_size=8.5)
    run_lines = make_bullet_lines(HOW_TO_RUN, RIGHT_COL_W - 24, font_size=8.8)

    left_y = draw_section(c, left_x, left_y, LEFT_COL_W, "What It Is", overview_lines, body_font_size=9.0, line_height=10.8)
    left_y = draw_section(c, left_x, left_y, LEFT_COL_W, "What It Does", feature_lines, body_font_size=8.7, line_height=10.4)

    right_y = draw_section(c, right_x, right_y, RIGHT_COL_W, "How It Works", architecture_lines, body_font_size=8.5, line_height=10.2)
    right_y = draw_section(c, right_x, right_y, RIGHT_COL_W, "How To Run", run_lines, body_font_size=8.8, line_height=10.6)

    c.setFont(BODY_FONT, 7.5)
    c.setFillColor(MUTED)
    c.drawRightString(PAGE_WIDTH - MARGIN, 18, "Key gaps are labeled 'Not found in repo.'")

    c.showPage()
    c.save()

    reader = PdfReader(str(OUTPUT_PATH))
    if len(reader.pages) != 1:
        raise RuntimeError(f"Expected 1 page, found {len(reader.pages)} pages")


if __name__ == "__main__":
    generate_pdf()
