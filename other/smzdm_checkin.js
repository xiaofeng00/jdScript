const cheerio = require("cheerio"); //文档转换

const $ = new Env('什么值得买签到')

const cookie = process.env.SMZDM_COOKIE
const postIdList = [];
const alreadyPostIdList = []
const commitList = [
    '感谢爆料，很不错',
    '现在这个价格还可入手吗？',
    '感谢爆料，价格不错~~',
    '这款怎么样？',
    '感谢分享，价格不错~~',
    '真滴好啊，紫薯布丁~~'
]

!(async () => {
    await checkin()
    await getPostID()
    for (let i = 0; i < 3; i++) {
        await $.wait(1000 * 10)
        await commit()
    }
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })


//取随机数 min = 最小值 ； max = 最大值
const getRandom = (min, max) => {
    return parseInt(Math.random() * (max - min + 1) + min);
}

//评论地址
//家居生活 发现频道 30 - 100 页 随机页数
const getCommitUrl = () => {
    let random = getRandom(30, 100);
    return `https://faxian.smzdm.com/h1s0t0f37c0p${random}/`;
}

const getPostID = () => {
    const options = {
        'url': getCommitUrl(),
        'headers': {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
            'Referer': 'https://www.smzdm.com/jingxuan/',
        }
    }
    return new Promise((resolve) => {
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    let tempPostIdList = [];
                    try {
                        let $ = cheerio.load(data);
                        $('.feed-ver-pic').each(function (i, e) {
                            let href = $(e).find('a').eq(0).attr('href');
                            tempPostIdList.push(href.substring(href.indexOf('/p/') + 3, href.length - 1));
                        });
                        console.log('新文章列表：', tempPostIdList);
                        //获取新列表，再更新，否则不更新
                        if (tempPostIdList.length > 0) {
                            tempPostIdList.forEach(it => postIdList.push(it));
                        }
                    } catch (e) {
                        console.error(e)
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

/**
 * 签到
 */
function checkin() {
    const options = {
        'url': `https://zhiyou.smzdm.com/user/checkin/jsonp_checkin?callback=jQuery112409568846254764496_${new Date().getTime()}&_=${new Date().getTime()}`,
        'headers': {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
            'Referer': 'http://www.smzdm.com/qiandao/',
        }
    }
    return new Promise((resolve) => {
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    console.log('data===', data);
                    if (data.indexOf('"error_code":0') !== -1) {
                        console.log('什么值得买 签到成功');
                    } else {
                        //发邮件
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function commit() {
    let pId = postIdList[Math.floor(Math.random() * postIdList.length)];
    while (alreadyPostIdList.includes(pId)) {
        pId = postIdList[Math.floor(Math.random() * postIdList.length)];
    }
    const options = {
        'url': `https://zhiyou.smzdm.com/user/comment/ajax_set_comment?callback=jQuery111006551744323225079_${new Date().getTime()}&type=3&pid=${pId}&parentid=0&vote_id=0&vote_type=&vote_group=&content=${encodeURI(commitList[Math.floor(Math.random() * commitList.length)])}&_=${new Date().getTime()}`,
        'headers': {
            'Cookie': cookie,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
            'Referer': 'https://zhiyou.smzdm.com/user/submit/',
        }
    }
    return new Promise((resolve) => {
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                } else {
                    console.log('data===', data);
                    if (data.indexOf('"error_code":0') !== -1) {
                        console.log('什么值得买 评论成功');
                        alreadyPostIdList.push(pId)
                    } else {
                        //发邮件
                    }
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function Env(t, e) {
    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {url: t} : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, o) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`)
        }

        isNode() {
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX() {
            return "undefined" != typeof $task
        }

        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon() {
            return "undefined" != typeof $loon
        }

        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }

        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }

        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch {
            }
            return s
        }

        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }

        getScript(t) {
            return new Promise(e => {
                this.get({url: t}, (t, s, i) => e(i))
            })
        }

        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let o = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                o = o ? 1 * o : 20, o = e && e.timeout ? e.timeout : o;
                const [r, h] = i.split("@"), a = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {script_text: t, mock_type: "cron", timeout: o},
                    headers: {"X-Key": r, Accept: "*/*"}
                };
                this.post(a, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
                if (!s && !i) return {};
                {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), o = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, o) : i ? this.fs.writeFileSync(e, o) : this.fs.writeFileSync(t, o)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let o = t;
            for (const t of i) if (o = Object(o)[t], void 0 === o) return s;
            return o
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), o = s ? this.getval(s) : "";
                if (o) try {
                    const t = JSON.parse(o);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) {
                    e = ""
                }
            }
            return e
        }

        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, o] = /^@(.*?)\.(.*?)$/.exec(e), r = this.getval(i),
                    h = i ? "null" === r ? null : r || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, o, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const r = {};
                    this.lodash_set(r, o, t), s = this.setval(JSON.stringify(r), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => {
        })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }) : this.isQuanX() ? $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: o, body: r} = t;
                e(null, {status: s, statusCode: i, headers: o, body: r}, r)
            }, t => e(t)) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                    this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const {statusCode: s, statusCode: i, headers: o, body: r} = t;
                e(null, {status: s, statusCode: i, headers: o, body: r}, r)
            }, t => e(t)))
        }

        post(t, e = (() => {
        })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }); else if (this.isQuanX()) t.method = "POST", $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: o, body: r} = t;
                e(null, {status: s, statusCode: i, headers: o, body: r}, r)
            }, t => e(t)); else if (this.isNode()) {
                this.initGotEnv(t);
                const {url: s, ...i} = t;
                this.got.post(s, i).then(t => {
                    const {statusCode: s, statusCode: i, headers: o, body: r} = t;
                    e(null, {status: s, statusCode: i, headers: o, body: r}, r)
                }, t => e(t))
            }
        }

        time(t) {
            let e = {
                "M+": (new Date).getMonth() + 1,
                "d+": (new Date).getDate(),
                "H+": (new Date).getHours(),
                "m+": (new Date).getMinutes(),
                "s+": (new Date).getSeconds(),
                "q+": Math.floor(((new Date).getMonth() + 3) / 3),
                S: (new Date).getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, ((new Date).getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)));
            return t
        }

        msg(e = t, s = "", i = "", o) {
            const r = t => {
                if (!t || !this.isLoon() && this.isSurge()) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {"open-url": t} : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t["open-url"], s = t.mediaUrl || t["media-url"];
                        return {openUrl: e, mediaUrl: s}
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.openUrl, s = t["media-url"] || t.mediaUrl;
                        return {"open-url": e, "media-url": s}
                    }
                }
            };
            this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, r(o)) : this.isQuanX() && $notify(e, s, i, r(o)));
            let h = ["", "==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];
            h.push(e), s && h.push(s), i && h.push(i), console.log(h.join("\n")), this.logs = this.logs.concat(h)
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t.stack) : this.log("", `\u2757\ufe0f${this.name}, \u9519\u8bef!`, t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = (new Date).getTime(), s = (e - this.startTime) / 1e3;
            this.log("", `\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}
