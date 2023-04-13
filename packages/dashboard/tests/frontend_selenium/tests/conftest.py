import pytest
from selenium import webdriver
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service
from pyvirtualdisplay import Display

"""
This module contains shared browser fixtures.
"""

@pytest.fixture
def browser():

    # Virtual display for the browser, allowing it to run in headless mode
    display = Display(visible=0, size=(1500, 1200))
    display.start()

    # Initialize the ChromeDriver instance with options
    options = webdriver.ChromeOptions()
    options.add_extension('polka_extension_0_44_1_0.crx')  # PolkaDot Extension
    driver = webdriver.Chrome(options=options, service=Service(ChromeDriverManager().install()))
    driver.set_window_size(1200, 1100)

    # Make its calls wait up to 60 seconds for elements to appear
    driver.implicitly_wait(60)

    # Return the WebDriver instance for the setup
    yield driver

    # Quit the WebDriver instance for the cleanup
    driver.quit()
    # Ending virtual display for the browser
    display.stop()