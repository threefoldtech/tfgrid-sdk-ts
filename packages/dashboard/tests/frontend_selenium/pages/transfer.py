from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

"""
This module contains Transfer page elements.
"""

class TransferPage:
    
    sidebar = (By.XPATH, '/html/body/div[1]/div/div/nav/div/div[1]/div/div/div[1]/div[1]/div[3]/i')
    transfer_page = (By.XPATH, '/html/body/div[1]/div/div/nav/div/div[1]/div/div/div[1]/div[2]/div[5]')
    twin_page = (By.XPATH, '/html/body/div[1]/div/div/nav/div/div[1]/div/div/div[1]/div[2]/div[1]')
    twin_address_input = (By.XPATH, '/html/body/div[1]/div/div/main/div[1]/div[2]/div/div/div[2]/div[3]/div/div[2]/div/div[2]/div/div/div[1]/div/div[3]/input')
    twin_address_amount_input = (By.XPATH, '/html/body/div[1]/div/div/main/div[1]/div[2]/div/div/div[2]/div[3]/div/div[2]/div/div[3]/div/div/div[1]/div/div[3]/input')
    submit_id_button = (By.XPATH, '/html/body/div[1]/div/div/main/div[1]/div[2]/div/div/div[2]/div[3]/div/div[1]/div/div[4]/button[2]')
    submit_address_button = (By.XPATH, '/html/body/div[1]/div/div/main/div[1]/div[2]/div/div/div[2]/div[3]/div/div[2]/div/div[4]/button[2]')
    address = (By.XPATH, '/html/body/div[1]/div[3]/div/div/div/div')
    twin_details = (By.XPATH, "//*[contains(text(), 'Twin Details')]")
    transfer_tft_title = (By.XPATH, "//*[contains(text(), 'Transfer TFTs on the TFChain')]")
    balance_text = (By.XPATH,'/html/body/div[1]/div/div/main/header/div/div[3]/div[2]/p[1]/strong')
    close_login_button = (By.XPATH, '/html/body/div[2]/div[25]/div[2]/div[2]/div[2]/v-tab-item/div/form/div[6]/button[1]')
    twin_address_text = (By.XPATH, '/html/body/div[1]/div/div/main/div[1]/div[2]/div/div/div/div[2]/div[2]/div/div[2]/div[2]/div/div/div/span')
    twin_id_input = (By.XPATH, '/html/body/div[1]/div/div/main/div[1]/div[2]/div/div/div[2]/div[3]/div/div[1]/div/div[2]/div/div/div[1]/div/div[3]/input')
    twin_id_amount_input = (By.XPATH, '/html/body/div[1]/div/div/main/div[1]/div[2]/div/div/div[2]/div[3]/div/div[1]/div/div[3]/div/div/div[1]/div/div[3]/input')
    twin_id_label = (By.XPATH, '/html/body/div[1]/div/div/main/div[1]/div[2]/div/div/div/div[2]/div[2]/div/div[2]/div[1]/div')
    by_twin_address_button = (By.XPATH, "/html/body/div[1]/div/div/main/div[1]/div[2]/div/div/div[2]/div[2]/div/div/button[2]")


    def __init__(self, browser):
        self.browser = browser
    
    def navigate(self):
        self.browser.find_element(*self.close_login_button).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.twin_details))
        self.browser.find_element(*self.sidebar).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_page))
        self.browser.find_element(*self.transfer_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_tft_title))

    def recipient_list(self):
        self.browser.find_element(*self.twin_address_input).click()
        return self.browser.find_element(*self.address).text

    def recipient_input(self, data):
        self.browser.find_element(*self.twin_address_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.twin_address_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.twin_address_input).send_keys(data)
        self.browser.find_element(*self.transfer_tft_title).click()
        
    def recipient_id_input(self, data):
        self.browser.find_element(*self.twin_id_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.twin_id_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.twin_id_input).send_keys(data)
        self.browser.find_element(*self.transfer_tft_title).click()
    
    def amount_tft_input(self, data):
        self.browser.find_element(*self.twin_address_amount_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.twin_address_amount_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.twin_address_amount_input).send_keys(data)
        self.browser.find_element(*self.transfer_tft_title).click()
        
    def amount_tft_id_input(self, data):
        self.browser.find_element(*self.twin_id_amount_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.twin_id_amount_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.twin_id_amount_input).send_keys(data)
        self.browser.find_element(*self.transfer_tft_title).click()
    
    def by_twin_address(self):
        self.browser.find_element(*self.by_twin_address_button).click()
    
    def get_twin_address(self):
        self.browser.find_element(*self.twin_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.twin_details))
        twin_address = self.browser.find_element(*self.twin_address_text).text
        self.browser.find_element(*self.transfer_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_tft_title))
        return twin_address
    
    def get_twin_id(self):
        self.browser.find_element(*self.twin_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.twin_details))
        twin_id = self.browser.find_element(*self.twin_id_label).text
        self.browser.find_element(*self.transfer_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_tft_title))
        return twin_id

    def get_balance(self):
        return self.browser.find_element(*self.balance_text).text[:-4]

    def get_balance_transfer(self, balance):
        new_balance = self.browser.find_element(*self.balance_text).text[:-4]
        self.browser.refresh()
        alert = Alert(self.browser)
        alert.accept()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_tft_title))
        while(new_balance == balance or 'Loadin' in new_balance):
            new_balance = self.browser.find_element(*self.balance_text).text[:-4]
        return new_balance

    def get_address_submit(self):
        return self.browser.find_element(*self.submit_address_button)

    def wait_for_button(self, button):
        WebDriverWait(self.browser, 30).until(EC.element_to_be_clickable(button))
        return button

    def get_id_submit(self):
        return self.browser.find_element(*self.submit_id_button)

    def wait_for(self, keyword):
        WebDriverWait(self.browser, 30).until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(), '"+ keyword +"')]")))
        return True
