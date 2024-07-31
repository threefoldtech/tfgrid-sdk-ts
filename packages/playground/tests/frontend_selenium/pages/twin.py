from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.alert import Alert
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class TwinPage:

    """
    This module contains Your Profile page elements.
    """

    logout_button = (By.XPATH, "//button[.//span[text()=' Logout ']]")
    tfchain_button = (By.XPATH, "//span[text()='TFChain']")
    your_profile_button = (By.XPATH, "//span[text()='Your Profile']")
    twin_details_label = (By.XPATH, "//*[contains(text(), 'Twin Details')]")
    get_tft_button = (By.XPATH, "/html/body/div[1]/div/div/main/header/div/div[2]/div/div/div/div/button")
    locked_info_button = (By.XPATH, '/html/body/div[1]/div/div/main/header/div/div[3]/div[2]/p[2]/a/span[3]/i')
    twin_id_label = (By.XPATH, '/html/body/div[1]/div/div/main/div/div[2]/div/div/div/div[2]/div[2]/div[1]/div/div[1]/div[2]/div/div/div')
    twin_email_label = (By.XPATH, '/html/body/div[1]/div/div/main/div/div[2]/div/div/div/div[2]/div[2]/div[1]/div/div[2]/div[2]/div/div/div')
    twin_address_text = (By.XPATH, '/html/body/div[1]/div/div/main/div/div[2]/div/div/div/div[2]/div[2]/div[1]/div/div[3]/div[2]/div/div/div/div[1]/span')
    twin_relay_text = (By.XPATH, '/html/body/div[1]/div/div/main/div/div[2]/div/div/div/div[2]/div[2]/div[1]/div/div[4]/div[2]/div/div/div')
    edit_email_button = (By.XPATH, '/html/body/div[1]/div/div/main/div/div[2]/div/div/div/div[2]/div[2]/div[1]/div/div[2]/div[2]/div/div/div/i')
    edit_email_input = (By.XPATH, "//input[@placeholder='email@example.com']")
    submit_email_button= (By.XPATH, '/html/body/div[1]/div/div/main/div/div[2]/div/div/div/div[2]/div[2]/div[1]/div/div[2]/div[2]/div/div/form/button')
    connect_manual_button = (By.XPATH, '/html/body/div[1]/div/div/main/div/div[2]/div/div/div/div[2]/div[2]/div[2]/div[1]/p/a')
    connect_google_button = (By.XPATH, '/html/body/div[1]/div/div/main/div/div[2]/div/div/div/div[2]/div[2]/div[2]/div[3]/a[1]')
    connect_apple_button = (By.XPATH, '/html/body/div[1]/div/div/main/div/div[2]/div/div/div/div[2]/div[2]/div[2]/div[3]/a[2]')


    def __init__(self, browser):
        self.browser = browser
        
    def navigate(self):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.logout_button))
        webdriver.ActionChains(self.browser).send_keys(Keys.ESCAPE).perform()
        self.browser.find_element(*self.tfchain_button).click()
        self.browser.find_element(*self.your_profile_button).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.twin_details_label))

    def get_twin_details(self):
        twin_id = self.browser.find_element(*self.twin_id_label).text
        twin_email = self.browser.find_element(*self.twin_email_label).text
        while(twin_email == ''):
            twin_email = self.browser.find_element(*self.twin_email_label).text
        twin_address = self.browser.find_element(*self.twin_address_text).text
        twin_relay = self.browser.find_element(*self.twin_relay_text).text
        return twin_id, twin_email, twin_address, twin_relay

    def get_tft(self):
        self.browser.find_element(*self.get_tft_button).click()
    
    def press_locked_info(self):
        self.browser.find_element(*self.locked_info_button).click()
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        return self.browser.current_url
    
    def press_edit_btn(self):
        email = self.browser.find_element(*self.twin_email_label).text
        self.browser.find_element(*self.edit_email_button).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.edit_email_input))
        return self.browser.find_element(*self.edit_email_input).get_attribute('value')

    def edit_twin_email(self, email):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.edit_email_input))
        self.browser.find_element(*self.edit_email_input).send_keys(Keys.CONTROL + "a")
        self.browser.find_element(*self.edit_email_input).send_keys(Keys.DELETE)
        self.browser.find_element(*self.edit_email_input).send_keys(email)

    def press_submit_btn(self):
        self.browser.find_element(*self.submit_email_button).click()
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.edit_email_button))
        self.browser.refresh()
        alert = Alert(self.browser)
        alert.accept()
        self.browser.switch_to.window(self.browser.window_handles[0])
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located(self.twin_details_label))
    
    def get_link(self):
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        url = self.browser.current_url
        self.browser.close()
        self.browser.switch_to.window(self.browser.window_handles[0])
        return url
    
    def connect_manual_link(self):
        self.browser.find_element(*self.connect_manual_button).click()
        return self.get_link()
    
    def get_connect_google_link(self):
        self.browser.find_element(*self.connect_google_button).click()
        return self.get_link()

    def get_connect_apple_link(self):
        self.browser.find_element(*self.connect_apple_button).click()
        return self.get_link()

    def wait_for(self, keyword):
        WebDriverWait(self.browser, 30).until(EC.visibility_of_element_located((By.XPATH, "//*[contains(text(), '"+ keyword +"')]")))
        return True