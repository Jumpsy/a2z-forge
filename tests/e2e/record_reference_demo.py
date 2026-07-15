from pathlib import Path
from playwright.sync_api import sync_playwright

output = Path("docs/assets/video")
output.mkdir(parents=True, exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context(
        viewport={"width": 1280, "height": 720},
        record_video_dir=str(output),
        record_video_size={"width": 1280, "height": 720},
    )
    page = context.new_page()
    page.goto("http://127.0.0.1:4178", wait_until="networkidle")
    page.wait_for_timeout(900)
    page.get_by_role("button", name="Load the biology example").click()
    page.get_by_text("Source loaded. Ask a specific question").wait_for()
    page.wait_for_timeout(900)
    page.get_by_label("Question about this source").fill("What produces most of the ATP?")
    page.get_by_role("button", name="Find an answer").click()
    page.locator("cite", has_text="Source 6").wait_for()
    page.wait_for_timeout(1700)
    page.locator("#review-title").scroll_into_view_if_needed()
    page.wait_for_timeout(1100)
    video = page.video
    page.close()
    context.close()
    if video:
        recorded = Path(video.path())
        recorded.replace(output / "reference-workflow.webm")
    browser.close()

print("Recorded docs/assets/video/reference-workflow.webm")
