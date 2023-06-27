import {setup} from "../lib/setup";
import {runServer} from "../api";

void setup().then(() => {
	// TODO(konsti): graceful shutdown
	runServer();
});
