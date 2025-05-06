import pytest
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from pyvirtualdisplay import Display

"""
This module contains shared browser fixtures and CLI/environment options.
"""

# Add --base-url CLI option
def pytest_addoption(parser):
    parser.addoption(
        "--base-url",
        action="store",
        default="http://localhost:8080",
        help="Base URL for the dashboard"
    )

# Fixture to access --base-url
@pytest.fixture(scope="session")
def base_url(request):
    return request.config.getoption("--base-url")

# Fixture to access NETWORK from environment
@pytest.fixture(scope="session")
def network():
    return os.getenv("NETWORK", "dev")

# Selenium WebDriver with headless display
@pytest.fixture
def browser():
    display = Display(visible=0, size=(1920, 1080))
    display.start()

    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(
        options=options,
        service=ChromeService(ChromeDriverManager().install())
    )
    driver.set_window_size(1920, 1080)
    driver.implicitly_wait(60)

    yield driver

    driver.quit()
    display.stop()
