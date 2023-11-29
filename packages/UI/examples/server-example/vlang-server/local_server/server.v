
module local_server

import vweb

pub fn init(config VServerConfig) &VServerApp {
	mut app := &VServerApp{
		port: config.port
	}

	return app
}

pub fn (app &VServerApp) run_and_wait () {
	vweb.run(app, app.port)
}