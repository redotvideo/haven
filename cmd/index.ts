import {config} from "../lib/config";

import {app} from "../api";
import {setup} from "../lib/setup";

void setup().then(() => {
	const port = config.server.port;

	app.listen(port, () => {
		console.log(`Server is running on port ${port}`);
	});
});
