import {config} from "../lib/config";

import {app} from "../api/express";
import {setup} from "../lib/setup";
import {runServer} from "../api";

void setup().then(() => {
	const port = config.server.port;

	// Old express server
	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});

	// New fastify server
	runServer();
});
