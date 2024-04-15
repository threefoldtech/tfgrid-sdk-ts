# Selenium

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

- In the root directory, run `yarn install` then `yarn lerna run build` then `make run project=playground`.
- Change directory to frontend selenium through the command line using `cd packages/playground/tests/frontend_selenium/`.
- Install the recommended version of the pip package listed above for a stable run, or you can just install Python 3 and use `pip install -r requirements.txt`.
- If the port in serve changes from `5173` for any reason, you should change the variable `port` under `Base` section in [config.ini](../frontend_selenium/Config.ini) to the new value.
- Add `Twin Mnemonic`, `Twin With A Node Mnemonic`, `Stellar Address`, and `Email` either in [config.ini](../frontend_selenium/Config.ini) under `Utils` or by exporting `TFCHAIN_MNEMONICS`, `TFCHAIN_NODE_MNEMONICS`, `STELLAR_ADDRESS`, and `EMAIL`.
- Xvfb might also need to be installed using `sudo apt install xvfb`.

### Second

- You need to leave the server running and open a new terminal.
- You can run selenium with pytest through the command line using `python3 -m pytest -v`

### More options to run tests

- You can also run single test file through the command line using `python3 -m pytest -v tests/file/test_file.py`
- You can also run specific test cases through the command line using `python3 -m pytest -v tests/file/test_file.py::test_func`
- You can also run collection of test cases through the command line using `python3 -m pytest -v -k 'test_func or test_func'`
- You can also run all the tests and get an HTML report using [pytest-html](https://pypi.org/project/pytest-html/) package through the command line using `python3 -m pytest -v --html=report.html`
