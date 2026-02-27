"""
Visual Verification Script for Quantum Orbital Visualizer

Uses Playwright to capture screenshots of all pages and key orbital configurations.
Run with: python scripts/visual_test.py

Prerequisites:
    pip install playwright
    playwright install chromium
"""

import subprocess
import sys
import time
from pathlib import Path


def ensure_playwright():
    """Install playwright if not available."""
    try:
        from playwright.sync_api import sync_playwright
        return True
    except ImportError:
        print("Installing playwright...")
        subprocess.run([sys.executable, "-m", "pip", "install", "playwright"], check=True)
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)
        return True


def capture_screenshots():
    from playwright.sync_api import sync_playwright

    output_dir = Path(__file__).parent.parent / "screenshots"
    output_dir.mkdir(exist_ok=True)

    base_url = "http://localhost:3000"

    pages_to_test = [
        {"name": "home", "url": "/", "wait": 5},
        {"name": "visualizer_default", "url": "/visualizer", "wait": 6},
        {"name": "elements", "url": "/elements", "wait": 3},
        {"name": "about", "url": "/about", "wait": 2},
    ]

    print(f"Saving screenshots to: {output_dir.absolute()}\n")

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            executable_path="/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome",
        )
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            color_scheme="dark",
        )
        page = context.new_page()

        for test in pages_to_test:
            url = f"{base_url}{test['url']}"
            print(f"Capturing: {test['name']} ({url})...")

            try:
                page.goto(url, wait_until="networkidle", timeout=30000)
                # Wait for 3D rendering to complete
                time.sleep(test["wait"])

                filepath = output_dir / f"{test['name']}.png"
                page.screenshot(path=str(filepath), full_page=False)
                print(f"  -> Saved: {filepath.name}")
            except Exception as e:
                print(f"  -> ERROR: {e}")

        # Test specific elements on the Elements page
        element_tests = [
            {"symbol": "H", "name": "hydrogen"},
            {"symbol": "C", "name": "carbon"},
            {"symbol": "Fe", "name": "iron"},
        ]

        for el_test in element_tests:
            print(f"Capturing: element_{el_test['name']}...")
            try:
                page.goto(f"{base_url}/elements", wait_until="networkidle", timeout=30000)
                time.sleep(2)

                # Click the element button
                element_btn = page.locator(f"button:has-text('{el_test['symbol']}')").first
                if element_btn.is_visible():
                    element_btn.click()
                    time.sleep(5)  # Wait for orbital to render

                    filepath = output_dir / f"element_{el_test['name']}.png"
                    page.screenshot(path=str(filepath), full_page=False)
                    print(f"  -> Saved: {filepath.name}")
                else:
                    print(f"  -> Element button '{el_test['symbol']}' not found")
            except Exception as e:
                print(f"  -> ERROR: {e}")

        browser.close()

    print(f"\nAll screenshots saved to: {output_dir.absolute()}")
    print("Review them to verify the UI looks correct.")


def main():
    ensure_playwright()

    # Check if dev server is running
    import urllib.request
    try:
        urllib.request.urlopen("http://localhost:3000", timeout=3)
        print("Dev server is running at http://localhost:3000\n")
    except Exception:
        print("ERROR: Dev server not running. Start it first with: pnpm dev")
        print("Then run this script again.")
        sys.exit(1)

    capture_screenshots()


if __name__ == "__main__":
    main()
