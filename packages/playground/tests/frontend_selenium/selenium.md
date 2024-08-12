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

- In the root directory, run `yarn install`, then `yarn lerna run build`, and finally `make run project=playground`.
- Change directory to frontend selenium by running `cd packages/playground/tests/frontend_selenium/` in the command line.
- Install the recommended version of the pip package listed above for a stable run, or you can just install Python 3 and use the command:
  - `pip install -r requirements.txt --break-system-packages` (Use this if you don't use any of the listed packages).
  - Or use Virtual Environments: First, create an environment using `python -m venv myenv`, then activate it using `source myenv/bin/activate`, and finally, install packages using `pip install -r requirements.txt`.
- Add your configuration either in [config.ini](../frontend_selenium/Config.ini) or by exporting `TFCHAIN_MNEMONICS`, `TFCHAIN_NODE_MNEMONICS`, `STELLAR_ADDRESS`, and `EMAIL`.
- Description of config under `Base` section:
  - `port`: the port that the localhost is running on.
  - `net`: the network that the tests will be run against.
- Description of config under `Utils` section:
  - `seed`: twin mnemonic that will be used for all the automated tests.
  - `node_seed`: twin mnemonic for the node that will be used in node-related tests.
  - `address`: a stellar address with a TFT trustline that will be used in TFT bridge-related tests.
  - `email`: a valid email that will be used for all the automated tests.
- If the port in serve changes from `5173` for any reason, you should update the `port` under the `Base` section in [config.ini](../frontend_selenium/Config.ini) to reflect the new value.
- You'll also need to install `Xvfb`, Run `sudo apt install xvfb`.

### Second

- You need to leave the localhost running and open a new terminal.
- You can run selenium tests with pytest through the command line using `python3 -m pytest -v`.

### More options to run tests

- If you want to run the tests visually to see how they are running, you need to comment out the lines `16` and `33` in the [conftest.py](../frontend_selenium/tests/conftest.py).
- You can also run single test file through the command line using `python3 -m pytest -v tests/file/test_file.py`.
- You can also run specific test cases through the command line using `python3 -m pytest -v tests/file/test_file.py::test_func`.
- You can also run collection of test cases through the command line using `python3 -m pytest -v -k 'test_func or test_func'`.
- You can also run all the tests and get an HTML report using [pytest-html](https://pypi.org/project/pytest-html/) package through the command line using `python3 -m pytest -v --html=report.html`.
