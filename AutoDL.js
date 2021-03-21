const { log } = require("console");

const https = require("https");
const fs = require("fs");
const fs_ex = require("fs-extra");

const axios = require("axios");


let isBeforeExitAlreadyFired = false;

process.on("beforeExit", (code) => {
  // beforeExit を1回しか実行させないためのガード条件
  if (isBeforeExitAlreadyFired) {
    return;
  }
  isBeforeExitAlreadyFired = true;
  main();
});

function getData(URL) {
  return new Promise((resolve) => {
    main();

    function main() {
      try {
        const data = [];
        // console.log(encodeURI(URL));
        https.get(encodeURI(URL), (res) => {
          res
            .on("data", function(chunk) {
              data.push(chunk);
            })
            .on("end", function() {
              resolve(Buffer.concat(data));
            });
        });
      } catch {
        console.log("retry");
        setTimeout(() => {
          main();
        }, 100);
      }
    }
  });
}

async function main() {
    const URL = "https://standpic-asset.kirafan.cn/index.json";
    // console.log((await axios.get(URL)).data);

  const dirList = (await axios.get(URL)).data
    .filter((x) => x.type === "dir")
    .map((x) => x.name);

  const chara_db_prom = dirList.map(async (x) => {
    const path = "./chara_img/" + x;
    if (!fs.existsSync(path)) {
      fs_ex.mkdirsSync(path);
    }
    const prom = axios.get(
      "https://standpic-asset.kirafan.cn/" + encodeURI(x) + "/index.json"
    );
    return prom;
  });

  let fin = 0;

  const chara_db = [];
    for (let i = 0; i < chara_db_prom.length; i++) {
      console.log(dirList[i]);
    chara_db.push((await chara_db_prom[i]).data);
    fin++;
    console.log(fin + "/" + chara_db_prom.length);
  }

  console.log(chara_db);
  console.log("ok");

  return;

  //   var data = [];
  //   let db;
  //   await https.get(URL, function(res) {
  //     res
  //       .on("data", function(chunk) {
  //         data.push(chunk);
  //       })
  //       .on("end", async function() {
  //         var events = Buffer.concat(data);
  //         db = JSON.parse(events);

  //         await db.forEach(async (chara) => {
  //           let id = chara["m_CharaID"];

  //           let path = `./mergedcharaicon/charaicon_${id}.png`;
  //           if (fs.existsSync(path) === false) {
  //             var url = `https://card-asset.kirafan.cn/mergedcharaicon/charaicon_${id}.png`;

  //             var outFile = fs.createWriteStream(path);

  //             var req = https.get(url, function(res) {
  //               res.pipe(outFile);
  //               res.on("end", function() {
  //                 outFile.close();
  //               });
  //             });
  //             req.on("error", function(err) {
  //               console.log("Error: ", err);
  //               return;
  //             });
  //           }
  //         });
  //       });
  //   });
}

process.on("exit", (code) => {
  console.log("Process exit event with code: ", code);
});
