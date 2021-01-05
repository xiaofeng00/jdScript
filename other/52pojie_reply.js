const iconv = require('iconv-lite');
const cheerio = require("cheerio"); //文档转换

const name = '吾爱破解签到'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
const FORM_HASH = 'd5876384'

const $ = new Env(name)
let cookie = process.env.WUAIPOJIE_COOKIE ||
    'htVD_2132_saltkey=RT4KgRzn; htVD_2132_lastvisit=1607435235; htVD_2132_auth=5be4kK9QMJcpehSEC21VabHhGr9VtJp%2BngABniXvKCH2zxUIkDqnffOmSmxkUePnAkqkp9KiUgKuuuo%2BnMTbjg12XQg; htVD_2132_connect_is_bind=1; htVD_2132_atarget=1; htVD_2132_smile=1D1; htVD_2132_lastviewtime=552401%7C1607656529; htVD_2132_visitedfid=16D8; htVD_2132_sid=0; htVD_2132_ulastactivity=1607840830%7C0; wzws_cid=89408b4262a003aa100fa1b32cb2ba03926e07aa50310b8dbb28acfeb88fcfdcf30a2383c95aa0b0690a72f64284b98bbd7d69a0a2a5f1b65cbc71eef0c8ac5e1bdf0c8a3113acf1efa9c7ee6c8f37db; Hm_lvt_46d556462595ed05e05f009cdafff31a=1607655726,1607656515,1607751179,1607841120; Hm_lpvt_46d556462595ed05e05f009cdafff31a=1607841120; htVD_2132_lastcheckfeed=552401%7C1607841176; htVD_2132_st_t=552401%7C1607841180%7C8fa2087c69d31a64bc05283b6849efc5; htVD_2132_forum_lastvisit=D_16_1607841180; htVD_2132_viewid=tid_1312990; htVD_2132_secqaaqS0=623023.a481a127b954f837b5; htVD_2132_secqaaqSAZq40=623090.83c62d50c2f565940c; htVD_2132_secqaaqSAkCc0=626556.ccccb9f806465b40bf; htVD_2132_st_p=552401%7C1607841865%7Cf178ae63761908021f780928f9eaf0d9;htVD_2132_lastact=1608012642%09misc.php%09secqaa;'
const REPLY_MESSAGE = process.env.WUAIPOJIE_REPLY_MESSAGE || '666666666666666666'

!(async () => {
    // 开始任务
    // const tList = await hotList()
    // console.log(`找到${tList.length}个贴子，开始随机回复`)
    // const tid = tList[getRandom(0, tList.length - 1)]
    // await reply(tid)
    const question = await getReplyVerify()
    await replyVerify(question)
    // const tList = await hotList()
    // console.log(`找到${tList.length}个贴子，开始随机回复`)
    // const tid = tList[getRandom(0, tList.length - 1)]
})()
    .catch((e) => {
        $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
    })
    .finally(() => {
        $.done();
    })

/**
 * 最新热门随机选一个贴子
 */
function hotList() {
    const options = {
        'url': 'https://www.52pojie.cn/forum.php?mod=guide&view=hot',
        'headers': {
            'Origin': 'https://www.52pojie.cn',
            'Referer': 'https://www.52pojie.cn/forum.php?mod=guide&view=my',
            'User-Agent': UA,
            'Cookie': cookie
        },
        'responseType': 'buffer'
    }
    return new Promise((resolve) => {
        const tList = []
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = iconv.decode(data, 'gb2312').toString('utf8')
                    let doc = cheerio.load(data);
                    doc('tbody')
                        .each((i, e) => {
                            let href = doc(e).find('a').attr('href');
                            if (href && href.includes('.html')) {
                                let tid = href.replace('thread-', '').replace('-1-1.html', '')
                                if (!tList.includes(tid)) {
                                    // console.log(`添加贴子ID --> ${tid}`)
                                    tList.push(tid)
                                }
                            }
                        })
                    data = tList
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

function reply(tid, data) {
    const options = {
        'method': 'POST',
        'url': `https://www.52pojie.cn/forum.php?mod=post&infloat=yes&action=reply&fid=2&extra=page%3D1&tid=${tid}&replysubmit=yes&inajax=1`,
        'headers': {
            'Origin': 'https://www.52pojie.cn',
            'Referer': `https://www.52pojie.cn/thread-${tid}-1-1.html`,
            'User-Agent': UA,
            'Cookie': cookie
        },
        'form': {
            'formhash': FORM_HASH,
            'handlekey': 'reply',
            'noticeauthor': '',
            'noticetrimstr': '',
            'noticeauthormsg': '',
            'usesig': '1',
            'subject': '',
            'message': 'www.52pojie.cn',
            secqaahash: 'qSAqv50',
            secanswer: '%BD%FB%D6%B9%C7%F3%CD%D1%C7%F3%C6%C6'
        },
        'responseType': 'buffer'
    }
    return new Promise((resolve) => {
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    data = iconv.decode(data, 'gb2312').toString('utf8')
                    if (data && data.includes('succeedhandle')) {
                        console.log(`回帖成功 --> ${tid}`)
                    } else {
                        console.log(`回帖失败，原因 --> ${data}`)
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
 * 获取回复验证
 */
function getReplyVerify() {
    const options = {
        'url': 'https://www.52pojie.cn/misc.php?mod=secqaa&action=update&idhash=qSAqv50&0.97506465277437',
        'headers': {
            'Cookie': cookie,
            'User-Agent': UA,
            'Origin': 'https://www.52pojie.cn',
            'Referer': `https://www.52pojie.cn/thread-1312990-1-1.html`,
            'Accept-Encoding': 'gzip, deflate, br'
        },
    }
    return new Promise((resolve) => {
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    const reg = /sectplcode\[2] \+ '(.*)' \+ sectplcode\[3]/
                    let res = data.match(reg)
                    data = res[1].split('？答案：')
                    console.log(`获取回帖验证\n问题 --> ${data[0]}`)
                    console.log(`答案 --> ${data[1]}`)
                    if (resp.headers['set-cookie']) {
                        resp.headers['set-cookie']
                            .forEach(it => cookie += it.substring(0, it.indexOf(';') + 1))
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
 * 回复验证
 */
function replyVerify(data) {
    const options = {
        url: `https://www.52pojie.cn/misc.php?mod=secqaa&action=check&inajax=1&idhash=qSAqv50&secverify=${data[1]}`,
        headers: {
            'Cookie': cookie,
            'User-Agent': UA,
            'Origin': 'https://www.52pojie.cn',
            'Referer': `https://www.52pojie.cn/thread-1312990-1-1.html`,
            'Accept-Encoding': 'gzip, deflate, br',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
    }
    console.log(options.url)
    return new Promise((resolve) => {
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    console.log(data)
                }
            } catch (e) {
                $.logErr(e, resp);
            } finally {
                resolve(data);
            }
        })
    })
}

//取随机数 min = 最小值 ； max = 最大值
function getRandom(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min);
}

// prettier-ignore
function Env(t, e) {
    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {url: t} : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
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
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `\ud83d\udd14${this.name}, \u5f00\u59cb!`)
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
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), a = {url: `http://${h}/v1/scripting/evaluate`, body: {script_text: t, mock_type: "cron", timeout: r}, headers: {"X-Key": o, Accept: "*/*"}};
                this.post(a, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
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
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e),
                    r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i) if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
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
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
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
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => {
                const {message: s, response: i} = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => {
        })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t)); else if (this.isNode()) {
                this.initGotEnv(t);
                const {url: s, ...i} = t;
                this.got.post(s, i).then(t => {
                    const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                    e(null, {status: s, statusCode: i, headers: r, body: o}, o)
                }, t => {
                    const {message: s, response: i} = t;
                    e(s, i, i && i.body)
                })
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

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {"open-url": t} : this.isSurge() ? {url: t} : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"];
                        return {openUrl: e, mediaUrl: s}
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl;
                        return {"open-url": e, "media-url": s}
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {url: e}
                    }
                }
            };
            this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r)));
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
