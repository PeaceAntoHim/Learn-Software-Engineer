/* eslint-disable no-unused-vars */
import { spawn, exec } from "child_process";
import { tools } from "../libs/Tools.js";

/**
    * @typedef {import('../libs/TypeDef').AppiumServer} AppiumServer
 */

/**
 * @type {Map<String, AppiumServer>} 
 */
let appiumServerList

const totalServer = process.env.NODE_ENV == "development" ? 3 : 20
const ports = Array(totalServer).fill().map((val, idx) => idx + 20001)

class AppiumManager {

    constructor() {
        appiumServerList = new Map()
        console.debug("appium ports: ", ports)
    }

    async spawnAllServer() {
        await this.killAllAppium()
        await tools.delay(2000)
        console.debug("spawnAllServer")

        let promises = ports.map(async (port, idx) => {
            await this.spawnServer({ port })
        })

        await Promise.all(promises)

        // spawn 20 server CPU 100% give time to cool down
        // console.debug("node_env", process.env.NODE_ENV)
        let idleTime = process.env.NODE_ENV == "development" ? 3000 : 20000
        await tools.delay(idleTime)

        let pidsPorts = await this.appiumOsPidsPorts()

        console.debug("Init Set appiumServerList")
        pidsPorts.map(({ pid, port }, idx) => {
            appiumServerList.set(`appium-${idx + 1}`, { pid, port, deviceId: "" })
        })
        console.debug("Init spawned AllServer: ", appiumServerList)

    }
    async spawnServer({ port, path = "/wd/hub" }) {
        console.debug(`spawning server port ${port}`)
        let serverProcess = spawn("appium", ["server", "-pa", path, "-p", `${port}`, "--session-override"])
        return serverProcess.pid
    }

    async appiumOsPidsPorts() {
        console.debug("appium OS Pid Ports")
        let msg: any = await this.grepOsAppiumPidsText()

        let pidsPorts = msg.split("\n")
            .filter(val => val.includes("/bin/appium"))
            .map(txt => {
                //ex: user01 8446 8.0 0.7 1119976 125692 pts/1 Sl+ 11:56 0:01 node ~/.asdf/installs/nodejs/19.2.0/bin/appium server -pa /wd/hub -p 20001 --session-override
                //ex: user01     20990   20908  0 13:45 ?        00:00:02 node /home/user01/.nvm/versions/node/v19.2.0/bin/appium server -pa /wd/hub -p 20001 --session-override
                txt = txt.replace(/\s\s+/gm, " ").split(" ")
                // console.debug("txt: ", txt)
                return txt
            }).map(txtArr => {
                let pid = txtArr[1]
                // console.debug("txtArr: ", txtArr)
                let portIdx = txtArr.indexOf("-p") + 1
                // let regex = /-p\s(.*)\s/gm
                // let txt = txtArr.find(txt => {
                //     return txt.match(/-p\s(.*)\s/gm)
                // })
                // let match = regex.exec(txt)
                // let port = match ? match[1] : ""
                let port = txtArr.at(portIdx)
                return { pid: Number(pid), port: Number(port) }
            })

        console.debug("OS pids & ports: ", pidsPorts)
        return pidsPorts
    }

    async grepOsAppiumPidsText() {
        /**
         * @type {String}
         */
        let msg = await new Promise((resolve, reject) => {
            exec("ps -ef | grep \"/wd/hub\"", (error, stdout, stderr) => {
                if (error) reject(error)

                resolve(stdout)
            })
        }).catch(err => {
            throw err
        })
        return msg
    }

    async killAllAppium() {
        console.debug("Kill all Appium")
        let pidsPorts = await this.appiumOsPidsPorts()
        pidsPorts.forEach((val) => {
            let isRunning = tools.pidIsRunning(val.pid)
            if (isRunning === true) {
                tools.killPid(val.pid)
            }
        })

        await tools.delay(3000)
        for (const [key, server] of appiumServerList) {
            appiumServerList.delete(key)
        }
        console.debug("killed AllAppium: ", appiumServerList)
    }


    async assignServerToDeviceId(deviceId) {
        //find empty server
        //TODO: check process in server ?
        /** @type {AppiumServer} */
        let alreadyAssigned
        for (const [key, server] of appiumServerList) {
            if (server.deviceId == deviceId) {
                alreadyAssigned = server
                break
            }
        }

        if (alreadyAssigned) {
            if (!tools.pidIsRunning(alreadyAssigned.pid)) {
                console.warn(`OS pid ${alreadyAssigned.pid} for ${alreadyAssigned.deviceId} not running, will try to recreate`)
                // create new server
                let newPid =  await this.spawnServer({port: alreadyAssigned.port})
                await tools.delay(2000)
                alreadyAssigned.pid = newPid
            }
            // console.debug("Current appiumServerList after found alreadyAssigned: ", appiumServerList)
            return alreadyAssigned
        }

        /** @type {AppiumServer} */
        let serverToBeAssign
        for (const [key, server] of appiumServerList) {
            if (server.deviceId == "") {
                serverToBeAssign = server
                break
            }
        }
        if (!serverToBeAssign) throw "No vacant server"

        serverToBeAssign.deviceId = deviceId

        // console.debug("Current appiumServerList after assigned: ", appiumServerList)
        return serverToBeAssign
    }

    async unAssignDeviceIdFromServer(deviceId) {
        console.debug("Unassigning device:: ", deviceId)
        /** @type {AppiumServer} */
        let serverToBeUnassign
        for (const [key, server] of appiumServerList) {
            if (server.deviceId == deviceId) {
                serverToBeUnassign = server
                break;
            }
        }
        if (!serverToBeUnassign) {
            console.debug(`No Server to be unassign found for ${deviceId}`)
            return
        }

        //TODO: clean process in server ?
        serverToBeUnassign.deviceId = ""

        console.debug("Current appiumServerList after unAssigned: ", appiumServerList)
    }
}


export { AppiumManager }