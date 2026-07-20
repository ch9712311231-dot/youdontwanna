// 인쇄소 전달용 PDF 렌더링 — src/book.html(도련 포함 154x216mm 낱장)을
// 재단선(크롭마크) + 등록 여백을 더한 더 큰 시트로 감싸서 출력한다.
// 실제 별색(Pantone) 분판은 하지 않음 — RGB(K+시안 근사치) 그대로,
// 인쇄소 사전인쇄(prepress) 단계에서 별색 변환 필요 (COLOR_SPEC.md 참고).
const path = require('path');
const puppeteer = require('puppeteer-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const BLEED_W = 154, BLEED_H = 216;   // mm, 트림(148x210) + 도련 3mm×2
const TRIM_INSET = 3;                 // mm, 도련 폭
const MARGIN = 10;                    // mm, 재단선을 그릴 여백(도련 바깥)
const MARK_GAP = 3, MARK_LEN = 5, MARK_W = 0.3; // mm

async function main() {
  const inputName = process.argv[2] || 'book.html';
  const outputName = process.argv[3] || '임용합격로드맵_인쇄용.pdf';
  const inputPath = path.join(__dirname, 'src', inputName);
  const outputPath = path.join(__dirname, 'output', outputName);

  const browser = await puppeteer.launch({ executablePath: EDGE, headless: true });
  const page = await browser.newPage();
  await page.goto('file:///' + inputPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await page.emulateMediaType('print');

  await page.evaluate(({ BLEED_W, BLEED_H, TRIM_INSET, MARGIN, MARK_GAP, MARK_LEN, MARK_W }) => {
    const pages = Array.from(document.querySelectorAll('section.page'));
    const totalW = BLEED_W + 2 * MARGIN, totalH = BLEED_H + 2 * MARGIN;

    const style = document.createElement('style');
    style.textContent = `
      html,body{background:#ffffff !important;}
      .print-sheet{
        position:relative; width:${totalW}mm; height:${totalH}mm;
        background:#ffffff; page-break-after:always; overflow:hidden;
      }
      .print-sheet:last-child{page-break-after:auto;}
      .print-sheet > section.page{
        position:absolute !important; left:${MARGIN}mm; top:${MARGIN}mm;
        page-break-after:auto !important;
      }
      .cropmark{position:absolute; background:#000;}
      .cropmark.h{height:${MARK_W}mm;}
      .cropmark.v{width:${MARK_W}mm;}
      .slug{position:absolute; left:0; right:0; bottom:2mm; text-align:center;
        font:6pt/1 'Pretendard','Malgun Gothic',sans-serif; color:#000; letter-spacing:.02em;}
    `;
    document.head.appendChild(style);

    const trimX0 = MARGIN + TRIM_INSET, trimX1 = MARGIN + BLEED_W - TRIM_INSET;
    const trimY0 = MARGIN + TRIM_INSET, trimY1 = MARGIN + BLEED_H - TRIM_INSET;
    const bleedX0 = MARGIN, bleedX1 = MARGIN + BLEED_W;
    const bleedY0 = MARGIN, bleedY1 = MARGIN + BLEED_H;

    function mark(kind, top, left, length) {
      const d = document.createElement('div');
      d.className = 'cropmark ' + kind;
      d.style.top = top + 'mm';
      d.style.left = left + 'mm';
      if (kind === 'h') d.style.width = length + 'mm';
      else d.style.height = length + 'mm';
      return d;
    }

    pages.forEach((el, idx) => {
      const sheet = document.createElement('div');
      sheet.className = 'print-sheet';
      el.parentNode.insertBefore(sheet, el);
      sheet.appendChild(el);

      // 좌상단
      sheet.appendChild(mark('h', trimY0, bleedX0 - MARK_GAP - MARK_LEN, MARK_LEN));
      sheet.appendChild(mark('v', bleedY0 - MARK_GAP - MARK_LEN, trimX0, MARK_LEN));
      // 우상단
      sheet.appendChild(mark('h', trimY0, bleedX1 + MARK_GAP, MARK_LEN));
      sheet.appendChild(mark('v', bleedY0 - MARK_GAP - MARK_LEN, trimX1, MARK_LEN));
      // 좌하단
      sheet.appendChild(mark('h', trimY1, bleedX0 - MARK_GAP - MARK_LEN, MARK_LEN));
      sheet.appendChild(mark('v', bleedY1 + MARK_GAP, trimX0, MARK_LEN));
      // 우하단
      sheet.appendChild(mark('h', trimY1, bleedX1 + MARK_GAP, MARK_LEN));
      sheet.appendChild(mark('v', bleedY1 + MARK_GAP, trimX1, MARK_LEN));

      const slug = document.createElement('div');
      slug.className = 'slug';
      slug.textContent = `해커스임용 합격로드맵 · A5(148×210)+도련3mm · 2도인쇄(K+시안) · p.${String(idx + 1).padStart(3, '0')}`;
      sheet.appendChild(slug);
    });
  }, { BLEED_W, BLEED_H, TRIM_INSET, MARGIN, MARK_GAP, MARK_LEN, MARK_W });

  await page.pdf({
    path: outputPath,
    width: `${BLEED_W + 2 * MARGIN}mm`,
    height: `${BLEED_H + 2 * MARGIN}mm`,
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });

  await browser.close();
  console.log('saved:', outputPath);
}

main().catch(err => { console.error(err); process.exit(1); });
