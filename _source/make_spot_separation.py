# 2도 인쇄(K + PANTONE 3125 C) 진짜 별색 분판 파일 생성
# 렌더링된 페이지 PNG(RGB, 실제 화면에 보이는 최종 색)를 픽셀 단위로 분석해
# "K 잉크 농도(k)"와 "스팟 잉크 농도(s)"로 역산(decompose)한다.
# 광학밀도(Beer-Lambert, 로그선형) 모델 사용 — 임의의 두 잉크 베이스 색상에 대해
# 최소자승으로 (k, s)를 구하고, 모델에 안 맞는 픽셀(원본에 2색 외 다른 색이 섞여
# 있는 경우)은 residual(잔차)로 감지해 별도 보고한다.

import sys, os, glob
import numpy as np
from PIL import Image

SRC_DIR = sys.argv[1] if len(sys.argv) > 1 else 'output/_sep_src'
OUT_DIR = sys.argv[2] if len(sys.argv) > 2 else 'output/_sep_out'
os.makedirs(OUT_DIR, exist_ok=True)

WHITE = np.array([255, 255, 255], dtype=np.float64)
K_INK = np.array([24, 24, 24], dtype=np.float64)     # --ink #181818 = K 100%
S_INK = np.array([0, 171, 194], dtype=np.float64)    # --brand #00ABC2 = PANTONE 3125 U 100%

EPS = 1.0 / 255.0

def log_transmittance(rgb):
    t = np.clip(rgb / 255.0, EPS, 1.0)
    return np.log(t)

logT_k = log_transmittance(K_INK)  # (3,)
logT_s = log_transmittance(S_INK)  # (3,)

# 최소자승 계수 (3채널 x 2미지수) — 픽셀별로 동일한 M 사용
M = np.stack([logT_k, logT_s], axis=1)          # (3,2)
M_pinv = np.linalg.pinv(M)                        # (2,3)

files = sorted(glob.glob(os.path.join(SRC_DIR, '*.png')))
if not files:
    print('no source pngs found in', SRC_DIR); sys.exit(1)

k_pages = []
s_pages = []
report = []

for fp in files:
    img = Image.open(fp).convert('RGB')
    arr = np.asarray(img, dtype=np.float64)          # (H,W,3)
    H, W, _ = arr.shape
    logY = log_transmittance(arr).reshape(-1, 3)      # (H*W,3)

    x = logY @ M_pinv.T                                # (H*W,2) -> [k, s]
    x = np.clip(x, 0.0, 1.0)

    # 잔차(모델 재구성 오차) 계산 — 원본에 K/스팟 외 다른 색이 섞였는지 감지용
    recon = x @ M.T                                    # (H*W,3) log space
    resid = np.sqrt(np.mean((logY - recon) ** 2, axis=1))
    resid_img = resid.reshape(H, W)

    k = x[:, 0].reshape(H, W)
    s = x[:, 1].reshape(H, W)

    # 분판 관례: 흰색=잉크 0%, 검정=잉크 100% (하프톤 농도 그레이스케일)
    k_gray = np.clip(255 * (1 - k), 0, 255).astype(np.uint8)
    s_gray = np.clip(255 * (1 - s), 0, 255).astype(np.uint8)

    k_pages.append(Image.fromarray(k_gray, mode='L'))
    s_pages.append(Image.fromarray(s_gray, mode='L'))

    bad_frac = float((resid_img > 0.08).mean())  # 임계값: 로그공간 RMS 오차
    report.append((os.path.basename(fp), bad_frac, float(resid_img.max())))

    if bad_frac > 0.001:
        # 문제 픽셀 시각화(빨강으로 표시)한 진단 이미지 저장
        diag = np.array(img).copy()
        mask = resid_img > 0.08
        diag[mask] = [255, 0, 0]
        Image.fromarray(diag).save(os.path.join(OUT_DIR, 'diag_' + os.path.basename(fp)))

    print(f'{os.path.basename(fp)}: off-model px = {bad_frac*100:.3f}%  max_resid={resid_img.max():.3f}')

k_pages[0].save(os.path.join(OUT_DIR, 'K_plate.pdf'), save_all=True, append_images=k_pages[1:], resolution=400.0)
s_pages[0].save(os.path.join(OUT_DIR, 'Spot_3125C_plate.pdf'), save_all=True, append_images=s_pages[1:], resolution=400.0)

with open(os.path.join(OUT_DIR, 'separation_report.txt'), 'w', encoding='utf-8') as f:
    f.write('page\toff_model_px_pct\tmax_residual\n')
    for name, bad, mx in report:
        f.write(f'{name}\t{bad*100:.4f}%\t{mx:.4f}\n')

print('done. pages:', len(files))
