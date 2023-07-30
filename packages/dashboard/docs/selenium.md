# Selenium

Install the recommended version of the pip package listed below for a stable run, or you can just install Python 3 and use `pip install -r requirements.txt` in the frontend_selenium directory.

| Prerequisites                                                    | version  |
| ---------------------------------------------------------------- | -------- |
| [Python](https://www.python.org/downloads/)                      | `3.10.4` |
| [pytest](https://pypi.org/project/pytest/)                       | `7.4.0`  |
| [requests](https://pypi.org/project/requests/)                   | `2.31.0` |
| [selenium](https://pypi.org/project/selenium/)                   | `4.10.0` |
| [PyVirtualDisplay](https://pypi.org/project/PyVirtualDisplay/)   | `3.0`    |
| [webdriver-manager](https://pypi.org/project/webdriver-manager/) | `3.9.1`  |

## Running selenium

### First

- In the root directory, run `yarn install & yarn serve`
- If the port in serve changes from `8080` for any reason, you should change the variable `port` in [config.ini](../tests/frontend_selenium/Config.ini) to the new value.
- Add accounts `Twin Mnemonic`, `Twin With A Node Mnemonic` and `Stellar Address` either in [config.ini](../tests/frontend_selenium/Config.ini) or by exporting `TFCHAIN_MNEMONICS`, `TFCHAIN_NODE_MNEMONICS` and `STELLAR_ADDRESS`.
- Xvfb might also need to be installed using `sudo apt install xvfb`.

### Second

- You need to leave the server running and open a new terminal.
- Change directory to frontend selenium through the command line using `cd /packages/dashboard/tests/frontend_selenium`
- You can run selenium with pytest through the command line using `python3 -m pytest -v`

### More options to run tests

- You can also run single test file through the command line using `python3 -m pytest tests/test_file.py`
- You can also run specific test cases through the command line using `python3 -m pytest tests/test_file.py::test_func`
- You can also run collection of test cases through the command line using `python3 -m pytest -v -k 'test_func or test_func'`
- You can also run all the tests and get an HTML report using [pytest-html](https://pypi.org/project/pytest-html/) package through the command line using `python3 -m pytest -v --html=report.html`
