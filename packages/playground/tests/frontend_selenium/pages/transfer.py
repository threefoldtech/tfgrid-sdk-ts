from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TransferPage:

    """
    This module contains TF Token Transfer page elements.
    """

    logout_button = (By.XPATH, "//button[.//span[text()=' Logout ']]")
    tfchain_button = (By.XPATH, "//span[text()='TFChain']")
    transfer_page = (By.XPATH, "//span[text()='TF Token Transfer']")
    twin_page = (By.XPATH, "//span[text()='Your Profile']")
    twin_address_input = (By.XPATH, "(//label[text()='Recipient Address:']/following-sibling::input)[1]")
    twin_address_amount_input = (By.XPATH, "(//label[text()='Transfer Amount:']/following-sibling::input)[2]")
    submit_id_button = (By.XPATH, "(//button[.//span[text()='Send']])[1]")
    submit_address_button =  (By.XPATH, "(//button[.//span[text()='Send']])[2]")
    twin_details = (By.XPATH, "//*[contains(text(), 'Twin Details')]")
    transfer_tft_title = (By.XPATH, "//*[contains(text(), 'Transfer TFTs on the TFChain')]")
    balance_text = (By.XPATH,'/html/body/div[1]/div/div/main/header/div/div[3]/div[2]/p[1]/strong')
    twin_address_text = (By.XPATH, '/html/body/div[1]/div/div/main/div/div[2]/div/div/div/div[2]/div[2]/div[1]/div/div[3]/div[2]/div/div/div/div[1]/span')
    twin_id_input = (By.XPATH, "//label[text()='Recipient Twin ID:']/following-sibling::input")
    twin_id_amount_input = (By.XPATH, "//label[text()='Transfer Amount:']/following-sibling::input")
    twin_id_label = (By.XPATH, '/html/body/div[1]/div/div/main/div/div[2]/div/div/div/div[2]/div[2]/div[1]/div/div[1]/div[2]/div/div/div')
    by_twin_address_button = (By.XPATH, "//button[.//span[text()='By Address']]")


    def __init__(self, browser):
        self.browser = browser
    
    def navigate(self):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.logout_button))
        webdriver.ActionChains(self.browser).send_keys(Keys.ESCAPE).perform()
        self.browser.find_element(*self.tfchain_button).click()
        self.browser.find_element(*self.transfer_page).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_tft_title))

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
        balance = 'Loadin'
        while(balance == 'Loadin'):
            balance = self.browser.find_element(*self.balance_text).text[:-4]
        return balance

    def get_balance_transfer(self, balance):
        new_balance = self.browser.find_element(*self.balance_text).text[:-4]
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.transfer_tft_title))
        while(new_balance == balance or 'Loadin' in new_balance):
            self.wait_for(' Balance: ')
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
