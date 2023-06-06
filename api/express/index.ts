import express, {Request, Response} from "express";
import {createWorker, deleteWorker, getModels, pauseWorker, resumeWorker} from "./workers";

const app = express();

app.use((_: Request, res: Response, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "*");
	next();
});

app.use(express.json());

app.get("/v1/models", getModels);

app.post("/v1/workers/:model/create", createWorker);
app.post("/v1/workers/:model/pause", pauseWorker);
app.post("/v1/workers/:model/resume", resumeWorker);
app.post("/v1/workers/:model/delete", deleteWorker);

// Handle errors
app.use((err: Error, _: Request, res: Response, next: any) => {
	console.error(err);
	res.status(500).send({error: "Internal server error."});
});

/*
TOOO:
- upload google cloud key
*/

export {app};
