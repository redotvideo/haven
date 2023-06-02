import express, {Request, Response} from "express";
import {createWorker, deleteWorker, getModels, getWorker, pauseWorker, resumeWorker} from "./workers";
import {predict} from "./predict";

const app = express();

app.use((_: Request, res: Response, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");
	next();
});

app.use(express.json());

app.get("/v1/models", getModels);

app.get("/v1/workers/:model", getWorker);
app.post("/v1/workers/:model/create", createWorker);
app.post("/v1/workers/:model/pause", pauseWorker);
app.post("/v1/workers/:model/resume", resumeWorker);
app.post("/v1/workers/:model/delete", deleteWorker);

app.post("/v1/predict/:model", predict);

/*
TOOO:
- upload google cloud key
*/

export {app};
