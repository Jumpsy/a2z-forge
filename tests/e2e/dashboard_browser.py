from pathlib import Path

from playwright.sync_api import sync_playwright


BASE_URL = "http://127.0.0.1:4180"
ARTIFACTS = Path("evals/artifacts/dashboard")
ARTIFACTS.mkdir(parents=True, exist_ok=True)


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1000}, device_scale_factor=1)
    console_errors = []
    page.on("console", lambda message: console_errors.append(message.text) if message.type == "error" else None)
    page.goto(BASE_URL, wait_until="networkidle")

    assert page.locator("#data-label").text_content() == "Demo data, not a release claim"
    assert page.locator(".task-node").count() == 6
    assert page.locator("#gate-title").text_content() == "No recorded release blocker"
    assert page.locator("#evidence-list li").count() == 2

    review = page.locator('.task-node[data-index="4"]')
    review.click()
    assert page.locator("#detail-title").text_content() == "Close adversarial findings"
    assert page.locator("#detail-status").text_content() == "in-progress"

    review.focus()
    page.keyboard.press("ArrowRight")
    assert page.evaluate("document.activeElement.textContent.includes('Run release gates')")
    assert page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    assert not console_errors, console_errors
    page.screenshot(path=str(ARTIFACTS / "desktop.png"), full_page=True)

    mobile = browser.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=1)
    mobile_errors = []
    mobile.on("console", lambda message: mobile_errors.append(message.text) if message.type == "error" else None)
    mobile.goto(BASE_URL, wait_until="networkidle")
    assert mobile.locator(".task-node").count() == 6
    assert mobile.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
    assert not mobile_errors, mobile_errors
    mobile.screenshot(path=str(ARTIFACTS / "mobile.png"), full_page=True)
    mobile.close()
    browser.close()

print("Dashboard browser journey passed: state, task selection, keyboard, evidence, release gate, responsive, console")
