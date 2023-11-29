module local_server

import vweb
import time
import x.json2


pub fn (app &VServerApp) before_request() {
	eprintln('${time.now()}: ${app.req.method} ${app.req.url}')
}

@['/api/verify'; post]
pub fn (mut app VServerApp) verify() vweb.Result {
	data := app.req.data
	payload := json2.decode[Payload](data) or { 
		app.set_status(400, "")
		return app.json({
			"Error": "true",
			"message": "Please make sure that you sent a valid date."
			"required_fields": Payload{}.str()
			"status": '400'
		})
	}

	println(payload)
	return app.json({
		"data": "id"
	})
}
