from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

"""
This module contains Twin page elements.
"""
class TwinPage:

    close_login_button = (By.XPATH, '/html/body/div[1]/div[3]/div/div/div[4]/button')
    twin_details_label = (By.XPATH, "//*[contains(text(), 'Twin Details')]")
    relay_edit_list = (By.XPATH, '//*[@id="app"]/div[4]/div/div/div[1]/form/div/div/div[1]/div[1]/div[1]/div')
    relay_edit_option = (By.XPATH, '/html/body/div[1]/div[5]/div/div/div/div')
    edit_relay_button = (By.XPATH, "//*[contains(text(), 'Edit')]")
    submit_button = (By.XPATH, '//*[@id="app"]/div[4]/div/div/div[2]/button[2]')
    get_tft_button = (By.XPATH, "//*[contains(text(), 'GET TFT')]")
    locked_info_button = (By.XPATH, '//*[@id="app"]/div[1]/div[1]/header/div/div[3]/div/section/div[1]/div/p/span[2]/a/span/i')
    twin_id_label = (By.XPATH, '//*[@id="app"]/div[1]/div[2]/div/div[1]/div[1]/div[2]/div[1]/div/div[2]/div[1]')
    twin_address_text = (By.XPATH, '//*[@id="app"]/div[1]/div[2]/div/div[1]/div[1]/div[2]/div[1]/div/div[2]/div[2]')
    twin_relay_text = (By.XPATH, '//*[@id="app"]/div[1]/div[2]/div/div[1]/div[1]/div[2]/div[1]/div/div[2]/div[3]')


    def __init__(self, browser):
        self.browser = browser
        
    def navigate(self):
        self.browser.find_element(*self.close_login_button).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.twin_details_label))

    def get_twin_details(self):
        twin_id = self.browser.find_element(*self.twin_id_label).text
        twin_address = self.browser.find_element(*self.twin_address_text).text
        twin_relay = self.browser.find_element(*self.twin_relay_text).text
        return twin_id, twin_address, twin_relay

    def get_tft(self):
        self.browser.find_element(*self.get_tft_button).click()
    
    def press_locked_info(self):
        self.browser.find_element(*self.locked_info_button).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        return self.browser.current_url
    
    def press_edit_btn(self):
        self.browser.find_element(*self.edit_relay_button).click()

    def edit_twin_relay(self):
        self.wait_for('Edit Twin')
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.relay_edit_list))
        self.wait_for('relay')
        self.browser.find_element(*self.relay_edit_list).click()
        WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable(self.relay_edit_option))
        self.browser.find_element(*self.relay_edit_option).click()
        return self.browser.find_element(*self.relay_edit_list).text

    def press_submit_btn(self):
        self.browser.find_element(*self.submit_button).click()

    def wait_for(self, keyword):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), '"+ keyword +"')]")))
        return True