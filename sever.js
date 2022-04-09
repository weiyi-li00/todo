const http = require("http");
const { v4: uuidv4 } = require("uuid");
const errHandle = require("./errHandle");
const todos = [];
const requestListener = (req, res) => {
  //res為client端發出的請求與資訊
  const headers = {
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, Content-Length, X-Requested-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, POST, GET,OPTIONS,DELETE",
    "Content-Type": "application/json"
  };
  let body = "";
  let num = 0;
  req.on("data", (chunk) => {
    body += chunk;
    num += 1;
  });

  if (req.method == "GET" && req.url == "/todos") {
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos
      })
    );
    res.end();
  } else if (req.method == "POST" && req.url == "/todos") {
    req.on("end", () => {
      try {
        const status = JSON.parse(body).title;
        if (!status) {
          errHandle(res);
        } else {
          const todo = {
            "title": status,
            "id": uuidv4()
          };
          todos.push(todo);
          console.log("todos", todos);
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              data: todos
            })
          );
          res.end();
        }
      } catch (err) {
        errHandle(res);
      }
    });
  } else if (req.method == "DELETE" && req.url.startsWith("/todos/")) {
    const id = req.url.split("/").pop();
    const index = todos.findIndex((el) => {
      return el.id === id;
    });
    if (index !== -1) {
      todos.splice(index, 1);
      res.writeHead(200, headers);
      res.write(
        JSON.stringify({
          status: "success",
          data: todos
        })
      );
      res.end();
    } else {
      errHandle(res);
    }
  } else if (req.method == "DELETE" && req.url == "/todos") {
    todos.length = 0;
    res.writeHead(200, headers);
    res.write(
      JSON.stringify({
        status: "success",
        data: todos,
        "delete": "yes"
      })
    );
    res.end();
  } else if (req.method == "OPTIONS") {
    //跨網域設定
    res.writeHead(200, headers);
    res.end();
  } else if (req.method == "PATCH" && req.url.startsWith("/todos/")) {
    req.on("end", () => {
      try {
        const todo = JSON.parse(body).title;
        const id = req.url.split("/").pop();
        const index = todos.findIndex((el) => {
          return el.id === id;
        });
        if (todo !== undefined && index !== -1) {
          todos[index].title = todo;
          res.writeHead(200, headers);
          res.write(
            JSON.stringify({
              status: "success",
              data: todos
            })
          );
          res.end();
        } else {
          errHandle(res);｀
        }
      } catch {
        errHandle(res);
      }
    });
  } else {
    errHandle(res);
  }
};
const sever = http
  .createServer(requestListener)
  .listen(process.env.PORT || 3005);
//process.env.PORT環境變數
