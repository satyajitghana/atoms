"""
Capture orbital screenshots for README grid and OG image.
Uses Playwright to navigate the visualizer, set quantum numbers via keyboard,
then screenshots just the 3D canvas with all UI hidden.
"""

import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

BROWSER_PATH = "/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome"
BASE_URL = "http://localhost:3000"

# Orbitals: (n, l, m, label, particles_k) - higher n needs more particles
ORBITALS = [
    (1, 0, 0, "1s", 200),
    (2, 0, 0, "2s", 200),
    (2, 1, 0, "2p", 200),
    (3, 0, 0, "3s", 300),
    (3, 1, 0, "3p", 300),
    (3, 2, 0, "3d", 300),
    (4, 0, 0, "4s", 500),
    (4, 1, 0, "4p", 500),
    (4, 2, 0, "4d", 500),
    (4, 3, 0, "4f", 500),
    (3, 2, 1, "3d_m1", 300),
    (3, 2, 2, "3d_m2", 300),
]

HIDE_UI_JS = """
() => {
    // Hide header
    document.querySelector('header')?.style.setProperty('display', 'none');
    // Hide control panels and labels but NOT the canvas
    const main = document.querySelector('main');
    if (main) {
        const container = main.querySelector('[class*="relative"]');
        if (container) {
            Array.from(container.children).forEach((el, i) => {
                if (i > 0) el.style.setProperty('display', 'none');
            });
        }
    }
}
"""


def check_server():
    try:
        urllib.request.urlopen(BASE_URL, timeout=3)
        return True
    except Exception:
        return False


def set_quantum_numbers(page, n, l, m):
    """Set quantum numbers via keyboard interaction with sliders."""
    sliders = page.locator('span[role="slider"]')

    # n slider (index 0): reset to 1 then go to target
    n_slider = sliders.nth(0)
    n_slider.click()
    for _ in range(7):
        page.keyboard.press("Home")  # go to minimum
    time.sleep(0.1)
    for _ in range(n - 1):
        page.keyboard.press("ArrowRight")
    time.sleep(0.2)

    # l slider (index 1)
    l_slider = sliders.nth(1)
    l_slider.click()
    for _ in range(7):
        page.keyboard.press("Home")
    time.sleep(0.1)
    for _ in range(l):
        page.keyboard.press("ArrowRight")
    time.sleep(0.2)

    # m slider (index 2) - range is -l to +l
    if l > 0:
        m_slider = sliders.nth(2)
        m_slider.click()
        for _ in range(7):
            page.keyboard.press("Home")  # go to -l
        time.sleep(0.1)
        for _ in range(m + l):  # offset from -l to target m
            page.keyboard.press("ArrowRight")
        time.sleep(0.2)


def set_particle_count(page, target_k):
    """Set particle count via the particle slider (index 3)."""
    # Particle steps: [10K, 25K, 50K, 100K, 150K, 200K, 300K, 500K]
    # Map target_k to slider index
    steps = [10, 25, 50, 100, 150, 200, 300, 500]
    target_idx = 0
    for i, s in enumerate(steps):
        if s <= target_k:
            target_idx = i

    sliders = page.locator('span[role="slider"]')
    p_slider = sliders.nth(3)
    p_slider.click()
    for _ in range(8):
        page.keyboard.press("Home")
    time.sleep(0.1)
    for _ in range(target_idx):
        page.keyboard.press("ArrowRight")
    time.sleep(0.2)


def capture_orbital_screenshots():
    """Capture individual orbital screenshots with UI hidden."""
    output_dir = Path(__file__).parent.parent / "screenshots" / "orbitals"
    output_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=BROWSER_PATH)
        context = browser.new_context(
            viewport={"width": 1024, "height": 800},
            color_scheme="dark",
        )
        page = context.new_page()

        for n, l, m, label, particles_k in ORBITALS:
            print(f"  Capturing {label} (n={n}, l={l}, m={m}, {particles_k}K)...")
            page.goto(f"{BASE_URL}/visualizer", wait_until="load", timeout=30000)
            time.sleep(3)

            # Set particle count first, then quantum numbers
            set_particle_count(page, particles_k)
            time.sleep(0.5)
            set_quantum_numbers(page, n, l, m)
            time.sleep(5)  # wait for rendering

            # Hide all UI
            page.evaluate(HIDE_UI_JS)
            time.sleep(0.3)

            filepath = output_dir / f"{label}.png"
            page.screenshot(path=str(filepath), full_page=False)
            print(f"    -> {filepath.name}")

        browser.close()
    return output_dir


def capture_home_og():
    """Capture home page as OG image (1200x630)."""
    og_path = Path(__file__).parent.parent / "public" / "og.png"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=BROWSER_PATH)
        context = browser.new_context(
            viewport={"width": 1200, "height": 630},
            color_scheme="dark",
        )
        page = context.new_page()

        print("  Capturing OG image (1200x630)...")
        page.goto(f"{BASE_URL}/", wait_until="load", timeout=30000)
        time.sleep(6)

        page.screenshot(path=str(og_path), full_page=False)
        print(f"    -> public/og.png")
        browser.close()
    return og_path


def capture_page_screenshots():
    """Capture all page screenshots for verification."""
    output_dir = Path(__file__).parent.parent / "screenshots"
    output_dir.mkdir(parents=True, exist_ok=True)

    pages = [
        ("home", "/", 5),
        ("visualizer", "/visualizer", 6),
        ("elements", "/elements", 3),
        ("about", "/about", 2),
    ]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=BROWSER_PATH)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            color_scheme="dark",
        )
        page = context.new_page()

        for name, url, wait in pages:
            print(f"  Capturing page: {name}...")
            page.goto(f"{BASE_URL}{url}", wait_until="load", timeout=30000)
            time.sleep(wait)
            filepath = output_dir / f"{name}.png"
            page.screenshot(path=str(filepath), full_page=False)
            print(f"    -> {filepath.name}")

        # Element tests
        for symbol, ename in [("H", "hydrogen"), ("C", "carbon"), ("Fe", "iron")]:
            print(f"  Capturing element: {ename}...")
            page.goto(f"{BASE_URL}/elements", wait_until="load", timeout=30000)
            time.sleep(2)
            btn = page.locator(f"button:has-text('{symbol}')").first
            if btn.is_visible():
                btn.click()
                time.sleep(5)
                filepath = output_dir / f"element_{ename}.png"
                page.screenshot(path=str(filepath), full_page=False)
                print(f"    -> {filepath.name}")

        browser.close()
    return output_dir


def create_orbital_grid():
    """Create a 4x3 grid of orbital screenshots for the README."""
    orbitals_dir = Path(__file__).parent.parent / "screenshots" / "orbitals"
    output_path = Path(__file__).parent.parent / "public" / "orbital-grid.png"

    # 4 columns x 3 rows
    grid_labels = [
        ["1s", "2s", "2p", "3s"],
        ["3p", "3d", "3d_m1", "3d_m2"],
        ["4s", "4p", "4d", "4f"],
    ]

    cell_size = 300  # resize each orbital to this
    padding = 4
    label_height = 28
    cols, rows = 4, 3

    grid_w = cols * cell_size + (cols + 1) * padding
    grid_h = rows * (cell_size + label_height) + (rows + 1) * padding

    grid = Image.new("RGB", (grid_w, grid_h), color=(5, 5, 8))
    draw = ImageDraw.Draw(grid)

    # Try to use a monospace font
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", 16)
    except Exception:
        font = ImageFont.load_default()

    for row_idx, row_labels in enumerate(grid_labels):
        for col_idx, label in enumerate(row_labels):
            img_path = orbitals_dir / f"{label}.png"
            if not img_path.exists():
                print(f"  Warning: {img_path} not found, skipping")
                continue

            img = Image.open(img_path)
            img = img.resize((cell_size, cell_size), Image.LANCZOS)

            x = padding + col_idx * (cell_size + padding)
            y = padding + row_idx * (cell_size + label_height + padding)

            grid.paste(img, (x, y))

            # Draw label below the image
            text_x = x + cell_size // 2
            text_y = y + cell_size + 4
            bbox = draw.textbbox((0, 0), label, font=font)
            tw = bbox[2] - bbox[0]
            draw.text((text_x - tw // 2, text_y), label, fill=(140, 140, 160), font=font)

    grid.save(str(output_path), quality=95)
    print(f"  Grid saved to: {output_path}")

    # Also save a smaller version for README
    readme_path = Path(__file__).parent.parent / "public" / "orbital-grid-sm.png"
    small = grid.resize((grid_w // 2, grid_h // 2), Image.LANCZOS)
    small.save(str(readme_path), quality=90)
    print(f"  Small grid saved to: {readme_path}")

    return output_path


def main():
    if not check_server():
        print("ERROR: Dev server not running at http://localhost:3000")
        print("Start it with: pnpm dev")
        return

    print("=== Capturing orbital screenshots ===")
    capture_orbital_screenshots()

    print("\n=== Creating orbital grid ===")
    create_orbital_grid()

    print("\n=== Capturing OG image ===")
    capture_home_og()

    print("\n=== Capturing page screenshots ===")
    capture_page_screenshots()

    print("\nDone! All assets captured.")


if __name__ == "__main__":
    main()
