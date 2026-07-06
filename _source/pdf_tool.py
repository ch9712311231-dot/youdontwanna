import sys, fitz

def info(path):
    doc = fitz.open(path)
    print("pages:", doc.page_count)
    for i in range(min(3, doc.page_count)):
        t = doc[i].get_text()
        print(f"--- page {i+1} text len {len(t)} ---")
        print(t[:300])

def render(path, pages, outdir, zoom=2.5):
    doc = fitz.open(path)
    mat = fitz.Matrix(zoom, zoom)
    for p in pages:
        page = doc[p-1]
        pix = page.get_pixmap(matrix=mat)
        outpath = f"{outdir}/p{p:03d}.png"
        pix.save(outpath)
        print("saved", outpath)

def text(path, pages):
    doc = fitz.open(path)
    for p in pages:
        t = doc[p-1].get_text()
        print(f"=== page {p} ===")
        print(t)

if __name__ == "__main__":
    cmd = sys.argv[1]
    path = sys.argv[2]
    if cmd == "info":
        info(path)
    elif cmd == "render":
        pages = [int(x) for x in sys.argv[3].split(",")]
        outdir = sys.argv[4]
        render(path, pages, outdir)
    elif cmd == "text":
        pages = [int(x) for x in sys.argv[3].split(",")]
        text(path, pages)
