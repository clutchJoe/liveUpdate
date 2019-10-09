const puppeteer = require("puppeteer");
// const fs = require("fs");

module.exports = async () => {
    const bowser = await puppeteer.launch({ args: ['--no-sandbox'] }); // { headless: false }, {args: ['--no-sandbox']}
    const page = await bowser.newPage();
    // const page_1 = await bowser.newPage();
    await page.goto("http://nbastreams.xyz/", { waitUntil: "networkidle2" });
    const data = await page.evaluate(() => {
        let lists = [];
        const items = Array.from(document.querySelectorAll(".container .col-md-8 a"));
        for (let item of items) {
            let data = {};
            data.head = item.children[0].children[1].children[0].innerText;
            data.updateTime = item.children[0].children[1].children[1].innerText;
            data.link = item.getAttribute("href");
            lists.push(data);
        }
        return lists
    });

    for (let item of data) {
        await page.goto(item.link, { waitUntil: "networkidle2" });
        const iframes = await page.frames();
        for (let iframe of iframes) {
            if (iframe._navigationURL.endsWith(".php")) {
                await page.goto(iframe._navigationURL, { waitUntil: "networkidle2" });
                const sourceLink = await page.evaluate(() => {
                    const script = document.querySelector("body script");
                    const source = script.textContent.split(",")[0].split('"')[1];
                    return source;
                });
                item.link = sourceLink;
            };
        };
    }

    await page.goto('http://givemereddit.stream/nba', { waitUntil: "networkidle2" });
    const data_1 = await page.evaluate(() => {
        let lists = [];
        const items = Array.from(document.querySelectorAll("a.w-full.rounded"));
        for (let item of items) {
            let data = {};
            data.head = item.children[0].children[1].children[0].innerText;
            data.updateTime = item.children[0].children[1].children[1].innerText;
            data.link = item.getAttribute("href");
            lists.push(data);
        }
        return lists
    });
    for (let item of data_1) {
        await page.goto(item.link, { waitUntil: "networkidle2" });
        const sourceLink = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll("body script")).reverse();
            const tar = scripts.filter(script => script.textContent.trim().startsWith("window.onload = function"));
            const source = tar[0].textContent.split(",")[0].split("'")[1];
            return source;
        });
        item.link = sourceLink;
    }

    // fs.writeFile(
    //     "./static/list.json",
    //     JSON.stringify(data, null, "  "),
    //     err => {
    //         if (err) throw err;
    //         console.log("File created and data written...");
    //         console.log(new Date() + "\n");
    //     }
    // );

    await bowser.close();
    return await data.concat(data_1);
}