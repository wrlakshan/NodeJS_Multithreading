const express = require("express");
const { Worker, workerData } = require("worker_threads");

const app = express();
const port = process.env.PORT || 3000;
const THREAD_COUNT = 12;

function createWorker() {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./worker.js", {
      workerData: { thread_count: THREAD_COUNT },
    });

    worker.on("message", (data) => {
      resolve(data);
    });

    worker.on("error", (err) => {
      reject(err);
    });
  });
}

app.get("/non-blocking", (req, res) => {
  res.status(200).send("This page is non-blocking");
});

app.get("/blocking-thread", async (req, res) => {
  const workerPromises = [];

  for (let i = 0; i < THREAD_COUNT; i++) {
    workerPromises.push(createWorker());
  }

  const thread_results = await Promise.all(workerPromises);
  const total =
    thread_results[0] +
    thread_results[1] +
    thread_results[2] +
    thread_results[3];

  res.status(200).send(`results: ${total}`);
});

app.get("/blocking", (req, res) => {
  let count = 0;
  for (let i = 0; i < 20_000_000_000; i++) {
    count++;
  }
  res.status(200).send(`Result is ${count}`);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
