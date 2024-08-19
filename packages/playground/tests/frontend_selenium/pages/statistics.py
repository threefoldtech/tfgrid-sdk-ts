from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException



class StatisticsPage:

    logout_button = (By.XPATH, "//button[.//span[text()=' Logout ']]")
    tfgrid_button = (By.XPATH, "//span[text()='TFGrid']")
    grid_status_button = (By.XPATH, "//span[text()='Grid Status']")
    node_monitoring_button = (By.XPATH, "//span[text()='Node Monitoring']")
    statistics_button = (By.XPATH, "//span[text()='Node Statistics']")
    statistics_label = (By.XPATH, "//*[contains(text(), 'Statistics')]")
    map= (By.XPATH,"//button[contains(@class, 'btn-main-container')]")
    nodes_online = (By.XPATH, "//span[text()='Nodes Online']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    dedicated_machines = (By.XPATH, "//span[text()='Dedicated Machines']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    farms = (By.XPATH, "//span[text()='Farms']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    countries = (By.XPATH, "//span[text()='Countries']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    cpus = (By.XPATH, "//span[text()='CPUs']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    ssd_storage = (By.XPATH, "//span[text()='SSD Storage']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    hdd_storage = (By.XPATH, "//span[text()='HDD Storage']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    ram = (By.XPATH, "//span[text()='RAM']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    gpus = (By.XPATH, "//span[text()='GPUs']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    access_nodes = (By.XPATH, "//span[text()='Access Nodes']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    gateways = (By.XPATH, "//span[text()='Gateways']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    twins = (By.XPATH, "//span[text()='Twins']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    public_ips = (By.XPATH, "//span[text()='Public IPs']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    conracts = (By.XPATH, "//span[text()='Contracts']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")
    number_of_workloads = (By.XPATH, "//span[text()='Number of workloads']/ancestor::div/following-sibling::div[@class='v-card-text card-body']")


    def __init__(self, browser):
        self.browser = browser

    def navigate(self):
        webdriver.ActionChains(self.browser).send_keys(Keys.ESCAPE).perform()
        self.browser.find_element(*self.tfgrid_button).click()
        self.browser.find_element(*self.statistics_button).click()
        WebDriverWait(self.browser, 60).until(EC.visibility_of_element_located(self.statistics_label))

    def statistics_detials(self):
        details = []
        wait = WebDriverWait(self.browser, 60)  # Increased wait time to 60 seconds
        elements_to_fetch = [
            ("Nodes Online", self.nodes_online),
            ("Dedicated Machines", self.dedicated_machines),
            ("Farms", self.farms),
            ("Countries", self.countries),
            ("CPUs", self.cpus),
            ("SSD Storage", self.ssd_storage),
            ("HDD Storage", self.hdd_storage),
            ("RAM", self.ram),
            ("GPUs", self.gpus),
            ("Access Nodes", self.access_nodes),
            ("Gateways", self.gateways),
            ("Twins", self.twins),
            ("Public IPs", self.public_ips),
            ("Contracts", self.conracts),
            ("Number of workloads", self.number_of_workloads)
        ]
        try:
            for name, locator in elements_to_fetch:
                try:
                    element_text = wait.until(EC.visibility_of_element_located(locator)).text
                    details.append(element_text)
                    print(f"{name} fetched: {element_text}")
                except TimeoutException:
                    print(f"{name} not found within the specified time.")
                    details.append(None)# Add None or some default value to maintain list consistency
        except TimeoutException as e:
            print(f"TimeoutException: {e}")
        return details
    def get_link(self):
        WebDriverWait(self.browser, 30).until(EC.number_of_windows_to_be(2))
        self.browser.switch_to.window(self.browser.window_handles[1])
        url = self.browser.current_url
        self.browser.close()
        self.browser.switch_to.window(self.browser.window_handles[0])
        return url
    
    def grid_status_link(self):
        self.browser.find_element(*self.grid_status_button).click()
        return self.get_link()
    
    def node_monitoring_link(self):
        self.browser.find_element(*self.node_monitoring_button).click()
        return self.get_link()