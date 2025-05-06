import pytest
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService
from pyvirtualdisplay import Display

"""
This module contains shared browser fixtures and CLI options.
"""

# Add --base-url CLI option to pytest
def pytest_addoption(parser):
    parser.addoption(
        "--base-url",
        action="store",
        default="http://localhost:8080",
        help="Base URL for the dashboard",
    )

# Fixture to access the base URL from command line or default
@pytest.fixture(scope="session")
def base_url(request):
    return request.config.getoption("--base-url")

# Selenium browser fixture with virtual display
@pytest.fixture
def browser():
    # Start virtual display (headless)
    display = Display(visible=0, size=(1920, 1080))
    display.start()

    # Configure Chrome WebDriver
    options = webdriver.ChromeOptions()
    # options.add_extension('extension.crx')  # Optional: add extension if needed
    driver = webdriver.Chrome(
        options=options,
        service=ChromeService(ChromeDriverManager().install())
    )
    driver.set_window_size(1920, 1080)
    driver.implicitly_wait(60)  # Wait up to 60s for elements

    yield driver  # Hand off driver to test

    # Clean up
    driver.quit()
    display.stop()
