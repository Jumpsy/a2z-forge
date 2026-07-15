from pathlib import Path
from playwright.sync_api import sync_playwright

BASE_URL = "http://127.0.0.1:4178"
ARTIFACTS = Path("evals/artifacts/reference-product")
ARTIFACTS.mkdir(parents=True, exist_ok=True)

with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    console_errors = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.goto(BASE_URL, wait_until="networkidle")
    page.screenshot(path=str(ARTIFACTS / "desktop-empty.png"), full_page=True)

    page.get_by_role("button", name="Load the biology example").click()
    page.get_by_text("Source loaded. Ask a specific question").wait_for()
    assert page.locator("#source-lines li").count() >= 4
    page.get_by_label("Question about this source").fill("What produces most of the ATP?")
    page.get_by_role("button", name="Find an answer").click()
    page.locator("cite", has_text="Source 6").wait_for()
    assert "ATP synthase" in page.locator(".message.tutor").last.text_content()
    page.screenshot(path=str(ARTIFACTS / "desktop-cited-answer.png"), full_page=True)

    page.get_by_label("Review answer").fill("wrong answer")
    page.get_by_role("button", name="Check answer").click()
    assert "Review source" in page.locator(".review-result").text_content()
    assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    assert not console_errors, console_errors

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    mobile.goto(BASE_URL, wait_until="networkidle")
    mobile.get_by_role("button", name="Load the biology example").click()
    mobile.get_by_text("Source loaded. Ask a specific question").wait_for()
    assert mobile.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    mobile.screenshot(path=str(ARTIFACTS / "mobile-source-loaded.png"), full_page=True)
    mobile.close()
    browser.close()

print("Reference browser journey passed: empty, source, cited answer, review, responsive, console")
