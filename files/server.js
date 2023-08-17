const username = process.env.WEB_USERNAME || "admin";
const password = process.env.WEB_PASSWORD || "password";
const port = process.env.PORT || 3000;
const express = require("express");
const app = express();
var exec = require("child_process").exec;
const os = require("os");
const { legacyCreateProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");
const auth = require("basic-auth");

app.get("/", function (req, res) {
  res.status(200).send("hello world");
});

// 页面访问密码
app.use((req, res, next) => {
  const user = auth(req);
  if (user && user.name === username && user.pass === password) {
    return next();
  }
  res.set("WWW-Authenticate", 'Basic realm="Node"');
  return res.status(401).send();
});

//获取系统进程表
app.get("/status", function (req, res) {
  let cmdStr = "pm2 list; ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>获取守护进程和系统进程表：\n" + stdout + "</pre>");
    }
  });
});

//获取系统监听端口
app.get("/listen", function (req, res) {
    let cmdStr = "ss -nltp";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
      } else {
        res.type("html").send("<pre>获取系统监听端口：\n" + stdout + "</pre>");
      }
    });
  });

//获取节点数据
app.get("/list", function (req, res) {
    let cmdStr = "bash argo.sh";
    exec(cmdStr, function (err, stdout, stderr) {
      if (err) {
        res.type("html").send("<pre>命令行执行错误：\n" + err + "</pre>");
      }
      else {
        res.type("html").send("<pre>节点数据：\n\n" + stdout + "</pre>");
      }
    });
  });

//获取系统版本、内存信息
app.get("/info", function (req, res) {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("命令行执行错误：" + err);
    }
    else {
      res.send(
        "命令行执行结果：\n" +
          "Linux System:" +
          stdout +
          "\nRAM:" +
          os.totalmem() / 1000 / 1000 +
          "MB"
      );
    }
  });
});

//系统权限只读测试
app.get("/test", function (req, res) {
  let cmdStr = 'mount | grep " / " | grep "(ro," >/dev/null';
  exec(cmdStr, function (error, stdout, stderr) {
    if (error !== null) {
      res.send("系统权限为---非只读");
    } else {
      res.send("系统权限为---只读");
    }
  });
});

// keepalive begin
//web保活
function keep_web_alive() {
  // 请求主页，保持唤醒
  exec("curl -m8 127.0.0.1:" + port, function (err, stdout, stderr) {
    if (err) {
      console.log("保活-请求主页-命令行执行错误：" + err);
    }
    else {
      console.log("保活-请求主页-命令行执行成功，响应报文:" + stdout);
    }
  });
}

  //登陆session保活，这可能是多余的。请根据自己抓包填写cookie及相关请求头
  var headers = {
    Host: "cloud.okteto.com",
    Cookie:
      "_lr_hb_-okteto-waxir%2Fokteto-cloud={%22heartbeat%22:1692290153950}; _lr_uf_-okteto-waxir=0823f8c8-acad-4040-ba10-823eb9380fbe; _lr_tabs_-okteto-waxir%2Fokteto-cloud={%22sessionID%22:0%2C%22recordingID%22:%225-eea565f8-6691-4188-b786-1adf4c77e4dd%22%2C%22webViewID%22:null%2C%22lastActivity%22:1692290173899}",
    "sec-ch-ua":
      '"Not/A)Brand";v="99", "Microsoft Edge";v="115", "Chromium";v="115"',
    "content-type": "text/html",
    "sec-ch-ua-mobile": "?0",
    authorization: "Bearer 7sYFiViLTesOb5ImspB4yxE1yM8pmDHOjpn4yBRa",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.203",
    "sec-ch-ua-platform": '"Windows"',
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    origin: "https://cloud.okteto.com",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "navigate",
    "sec-fetch-dest": "document",
    referer: "https://cloud.okteto.com/",
    "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
  };

  var dataString =
    '{"query":"query getSpace($spaceId: String!) {\\n  space(id: $spaceId) {\\n    id\\n    status\\n    quotas {\\n      ...QuotasFields\\n    }\\n    members {\\n      ...MemberFields\\n    }\\n    apps {\\n      ...AppFields\\n    }\\n    stacks {\\n      ...StackFields\\n    }\\n    gitDeploys {\\n      ...GitDeployFields\\n    }\\n    devs {\\n      ...DevFields\\n    }\\n    deployments {\\n      ...DeploymentFields\\n    }\\n    pods {\\n      ...PodFields\\n    }\\n    functions {\\n      ...FunctionFields\\n    }\\n    statefulsets {\\n      ...StatefulsetFields\\n    }\\n    jobs {\\n      ...JobFields\\n    }\\n    cronjobs {\\n      ...CronjobFields\\n    }\\n    volumes {\\n      ...VolumeFields\\n    }\\n    externals {\\n      ...ExternalResourceFields\\n    }\\n    scope\\n    persistent\\n  }\\n}\\n\\nfragment QuotasFields on Quotas {\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  pods {\\n    ...QuotaFields\\n  }\\n  storage {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment QuotaFields on Resource {\\n  limits\\n  limitsTotal\\n  requests\\n  requestsTotal\\n  total\\n  used\\n}\\n\\nfragment MemberFields on Member {\\n  id\\n  avatar\\n  email\\n  externalID\\n  name\\n  owner\\n}\\n\\nfragment AppFields on App {\\n  id\\n  name\\n  version\\n  chart\\n  icon\\n  description\\n  repo\\n  config\\n  status\\n  actionName\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment StackFields on Stack {\\n  id\\n  name\\n  yaml\\n  status\\n  actionName\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment GitDeployFields on GitDeploy {\\n  id\\n  name\\n  icon\\n  yaml\\n  repository\\n  repoFullName\\n  branch\\n  status\\n  actionName\\n  variables {\\n    name\\n    value\\n  }\\n  github {\\n    installationId\\n  }\\n  gitCatalogItem {\\n    id\\n    name\\n  }\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment DevFields on Dev {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  divert\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment EndpointFields on Endpoint {\\n  url\\n  private\\n  divert\\n}\\n\\nfragment DeploymentFields on Deployment {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  devmode\\n  repository\\n  path\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment PodFields on Pod {\\n  id\\n  name\\n  yaml\\n  createdAt\\n  updatedAt\\n  error\\n  status\\n  deployedBy\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment FunctionFields on Function {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  devmode\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment StatefulsetFields on StatefulSet {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  devmode\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n  endpoints {\\n    ...EndpointFields\\n  }\\n}\\n\\nfragment JobFields on Job {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  replicas\\n  numPods\\n  createdAt\\n  updatedAt\\n  cpu {\\n    ...QuotaFields\\n  }\\n  memory {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment CronjobFields on CronJob {\\n  id\\n  name\\n  deployedBy\\n  yaml\\n  error\\n  status\\n  createdAt\\n  updatedAt\\n}\\n\\nfragment VolumeFields on Volume {\\n  id\\n  name\\n  createdByDevmode\\n  deployedBy\\n  yaml\\n  status\\n  createdAt\\n  updatedAt\\n  storage {\\n    ...QuotaFields\\n  }\\n}\\n\\nfragment ExternalResourceFields on ExternalResource {\\n  id\\n  name\\n  createdAt\\n  updatedAt\\n  deployedBy\\n  endpoints {\\n    url\\n  }\\n  notes {\\n    path\\n    markdown\\n  }\\n}","variables":{"spaceId":"hrzyang"},"operationName":"getSpace"}';

  var options = {
    url: "https://cloud.okteto.com/graphql",
    method: "POST",
    headers: headers,
    body: dataString,
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      let externalID = "hrzyang"; //这里也可以换成自己的邮箱
      if (body.indexOf(externalID) != -1)
        console.log("externalID为hrzyang的用户session保活成功");
      else console.log("登陆session失效,保活失败");
    } else console.log("登陆session保活-发请求出错:" + error);
  });

setInterval(keep_web_alive, 10 * 1000);

app.use( /* 具体配置项迁移参见 https://github.com/chimurai/http-proxy-middleware/blob/master/MIGRATION.md */
  legacyCreateProxyMiddleware({
    target: 'http://127.0.0.1:8080/', /* 需要跨域处理的请求地址 */
    ws: true, /* 是否代理websocket */
    changeOrigin: true, /* 是否需要改变原始主机头为目标URL,默认false */ 
    on: {  /* http代理事件集 */ 
      proxyRes: function proxyRes(proxyRes, req, res) { /* 处理代理请求 */
        // console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2)); //for debug
        // console.log(req) //for debug
        // console.log(res) //for debug
      },
      proxyReq: function proxyReq(proxyReq, req, res) { /* 处理代理响应 */
        // console.log(proxyReq); //for debug
        // console.log(req) //for debug
        // console.log(res) //for debug
      },
      error: function error(err, req, res) { /* 处理异常  */
        console.warn('websocket error.', err);
      }
    },
    pathRewrite: {
      '^/': '/', /* 去除请求中的斜线号  */
    },
    // logger: console /* 是否打开log日志  */
  })
);

//启动核心脚本运行web,哪吒和argo
exec("bash entrypoint.sh", function (err, stdout, stderr) {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
