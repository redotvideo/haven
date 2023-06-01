import express, {Request, Response} from "express";
import {createWorker, deleteWorker, getModels, getWorker, resumeWorker, stopWorker} from "./workers";

const app = express();

app.use((_: Request, res: Response, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");
	next();
});

app.get("/v1/models", getModels);

app.get("/v1/workers/:model", getWorker);
app.post("/v1/workers/:model/create", createWorker);
app.post("/v1/workers/:model/stop", stopWorker);
app.post("/v1/workers/:model/resume", resumeWorker);
app.post("/v1/workers/:model/delete", deleteWorker);

/*
TOOO:
- send prediction request
- upload google cloud key
*/

export {app};
