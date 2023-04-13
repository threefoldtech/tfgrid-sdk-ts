from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

"""
This module contains Dashboard homepage elements.
"""

class DashboardPage:

    polka_connected_btn = (By.XPATH, '//*[@id="app"]/div[1]/div[1]/header/div/div[3]/div/div/button')
    polka_disconnected_btn = (By.XPATH, '//*[@id="app"]/div[1]/div[1]/header/div/div[3]/div/button[2]')
    swipe_right = (By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div/div[2]/button[2]')
    swipe_left = (By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div/div[2]/button[1]')
    download_polka = (By.XPATH, "//*[contains(text(), 'Download polkadot{.js} extension to access the Portal')]")
    discover_tfgrid = (By.XPATH, "//*[contains(text(), 'View ThreeFold Capacity')]")
    learn_more = (By.XPATH, "//*[contains(text(), 'Learn More')]")
    account_list = (By.XPATH ,'//*[@id="app"]/div[1]/div[3]/div/div/div/div[2]')
    search_bar = (By.XPATH, '/html/body/div[1]/div[1]/div[3]/div/div/div/div[1]/div/div/div/div[1]/div/input')
    connected_account_title = (By.XPATH, "//*[contains(text(), 'Connected Accounts')]")
    decentralized_cloud_img = (By.XPATH, '//*[@id="app"]/div[1]/div[3]/div/div/div/div[1]/div/div/div/div/div/div[1]/div[3]')
    explorer_map = (By.XPATH,'//*[@id="app"]/div[1]/div[3]/div/div[2]/section')
    threefold_guide_img = (By.XPATH, "//*[contains(text(), 'Your Guide to The ThreeFold Grid')]")
    
    def __init__(self, browser):
        self.browser = browser
    
    def polka_connection(self):
        self.browser.find_element(*self.polka_connected_btn).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.connected_account_title))

    def polka_disconnection(self):
        self.browser.find_element(*self.polka_disconnected_btn).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.decentralized_cloud_img))

    def polka_connected_status(self):
        return self.browser.find_element(*self.polka_connected_btn).get_attribute("class")

    def polka_disconnected_status(self):
        return self.browser.find_element(*self.polka_disconnected_btn).get_attribute("class")

    def navigate_to_polka(self):
        self.browser.find_element(*self.download_polka).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        return self.browser.current_url

    def navigate_to_explorer(self):
        self.browser.find_element(*self.swipe_right).click()
        self.browser.find_element(*self.discover_tfgrid).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.explorer_map))
        return self.browser.current_url

    def navigate_to_manual(self):
        self.browser.find_element(*self.swipe_left).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.threefold_guide_img))
        self.browser.find_element(*self.learn_more).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        return self.browser.current_url
    
    def search_accounts(self, account):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.connected_account_title))
        self.browser.find_element(*self.search_bar).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.search_bar).send_keys(Keys.DELETE)
        self.browser.find_element(*self.search_bar).send_keys(account)

    def accounts_list(self):
        return self.browser.find_element(*self.account_list).text
    
    def get_address(self, account):
        return str(account[13:])