const express = require("express");
// const cors = require("cors");
const app = express();
const schedule = require('node-schedule');
const fetchData = require("./nbaStreamCrawling.js");
// const bot = require("./bot");
// app.use(express.json());
// app.use(cors());
const rule = new schedule.RecurrenceRule();
rule.second = 0;
rule.minute = [25, 55];
let source = [
    { head: "Updating..." }
];
app.get("/live", (req, res) => {
    res.send(source).end();
});
schedule.scheduleJob(rule, async () => {
    source = await fetchData();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server started on port ${PORT}`));