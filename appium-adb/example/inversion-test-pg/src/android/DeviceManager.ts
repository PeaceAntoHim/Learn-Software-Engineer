      
import PQueue from "p-queue";

/**
    * @typedef {import('./AdbService').AdbService} AdbService
    * @typedef {import('../appium/AppiumManager').AppiumManager} AppiumManager
    * @typedef {import('@u4/adbkit').Device} Device
 */

/**@type {Map<String, PQueue>} */
let deviceQueueList

/** @type {Map<String, String>} */
let deviceStatusList;

class DeviceManager {
    adbService: any;
    appiumManager: any;

    /**
     * 
     * @param {{adbService: AdbService, appiumManager: AppiumManager}}  
     */
    constructor({ adbService, appiumManager }) {
        deviceQueueList = new Map();
        deviceStatusList = new Map();
        this.adbService = adbService;
        this.appiumManager = appiumManager
    }

    async syncDevices() {
        console.debug("SyncDevices")
        let tracker = this.adbService.tracker;

        tracker.on("add", async (device) => {
            console.debug("add", device)
        })

        tracker.on("remove", async (device) => {
            console.debug("remove", device)
            // remove 
            await this.removeDevice(device)
        })

        tracker.on("change", async (device) => {
            console.debug("change", device)
            if (device.type === "device") {
                let success = await this.createDevice(device)
                if (success) {
                    await this.createDeviceQueue(device)
                }
            }
        })
        tracker.on("end", () => {
            console.debug("Tracking End")
        })

        let currDevicesConnected = await this.adbService.listDevices()
        console.debug("Connected devices: ", currDevicesConnected)

        let promises = currDevicesConnected.map(async (device) => {
            let success = await this.createDevice(device)
            if (success) {
                await this.createDeviceQueue(device)
            }

        })
        await Promise.all(promises)
    }

    /**
     * 
     * @param {Device} device 
     * @returns 
     */
    async createDevice(device) {
        console.debug("Creating Device..")
        if (Object.keys(deviceStatusList).includes(device.id)) {
            console.warn(`${device.id} statusList already created`)
            return false;
        } else {
            deviceStatusList.set(device.id, "NORMAL")
            console.debug(`${device.id} statusList created`)
            return true;
        }
    }

    async getDevices() {
        let devices = await this.adbService.listDevices()
        return devices
    }

    /**
     * 
     * @param {{deviceId: String, ignoreMaintenanceStatus: Boolean}} 
     * @return {Device}
     */
    async getDeviceById({ deviceId, ignoreMaintenanceStatus = false }) {
        let devices = await this.getDevices()
        let device = devices.find((val) => {
            return val.id == deviceId
        })

        if (device) {
            let deviceStatus = deviceStatusList.get(deviceId)
            if (deviceStatus && (deviceStatus == "NORMAL" || (deviceStatus == "MAINTENANCE" && ignoreMaintenanceStatus === true))) {
                return device
            } else {
                throw `Device ${device.id} status: ${deviceStatus}`
            }
        }else {
           throw `Device Manager dont have ${deviceId}`
        }
    }

    /**
     * 
     * @param {Device} device 
     * @returns 
     */
    async removeDevice(device) {
        
        this.deleteDeviceQueue(device)
        deviceStatusList.delete(device.id)
        await this.appiumManager.unAssignDeviceIdFromServer(device.id)
        console.warn(`${device.id} statusList deleted`);
    }

    // device queue
    /**
     * 
     * @param {Device} device 
     */
    async createDeviceQueue(device) {

        if (Object.keys(deviceQueueList).includes(device.id)) {
            console.warn(`${device.id} queue already created`)
            return false;
        } else {
            deviceQueueList.set(device.id, new PQueue({ concurrency: 1 }))
            console.debug(`${device.id} queue created`)
            // msgLogger.sendConsoleDebug({context: "DEVICE", event: "QUEUE_CREATED"}, {DeviceId: deviceId})
            return true;
        }
    }

    /**
     * 
     * @param {Device} device 
     */
    deleteDeviceQueue(device) {
        let queue = deviceQueueList.get(device.id);
        if (queue) {
            queue.clear()
            deviceQueueList.delete(device.id)
            console.debug(`${device.id} queue deleted`)
            // msgLogger.sendConsoleDebug({context: "DEVICE", event: "QUEUE_DELETED"}, {DeviceId: deviceId})
            return true
        }
        return false
    }

    /**
     * 
     * @param {String} deviceId 
     * @returns {Promise<PQueue>}
     */
    getDeviceQueueByDeviceId(deviceId) {
        return new Promise((resolve, reject) => {
            let deviceQueue = deviceQueueList.get(deviceId)
            if (deviceQueue) {
                resolve(deviceQueue)
            } else {
                return reject(`DeviceId ${deviceId} not found`)
            }
        })
    }
    getQueues(){
        let data = []
        for (let [deviceId, queue] of deviceQueueList){
            data.push({deviceId: deviceId, size: queue.size , pending: queue.pending}) 
        }
        return data
    }

    
    getAllDeviceStatus(){
        let data = []
        console.debug(deviceStatusList)
        for (let [deviceId, status] of deviceStatusList){
            data.push({deviceId: deviceId, status: status})
        }
        return data
    }
    //device status
    getDeviceStatusById(deviceId){
        return new Promise((resolve, reject) =>{
            let deviceStatus = deviceStatusList.get(deviceId)
            if(!deviceStatus) {
              return reject(`Device Status List doesn't have: ${deviceId}`)
            }
            resolve({deviceId: deviceId, status: deviceStatus})
        })
    }

    /**
     * 
     * @param {String} deviceId 
     * @param {Boolean} SetMaintenance 
     * @returns {{deviceId: String, status: String}}
     */
    updateDeviceStatusById(deviceId, SetMaintenance){
        return new Promise((resolve, reject) =>{
            let deviceStatus = deviceStatusList.get(deviceId)
            if(!deviceStatus) {
               return reject(`Device Status List doesn't have: ${deviceId}`)
            }
            // if(typeof(inMaintenance))
            if(typeof(SetMaintenance) !== "boolean") {
                return reject('SetMaintenance must be boolean')
            }
            deviceStatus = (SetMaintenance === true)? "MAINTENANCE" : "NORMAL"
            deviceStatusList.set(deviceId, deviceStatus)
            resolve({deviceId: deviceId, status: deviceStatus})
        })
    }
    updateAllDeviceStatus(SetMaintenance){

        return new Promise((resolve, reject) =>{
            if(typeof(SetMaintenance) !== "boolean") {
                return reject('SetMaintenance must be boolean')
            }
            let deviceList = deviceStatusList.keys()
            let deviceStatus = (SetMaintenance === true)? "MAINTENANCE" : "NORMAL"
            for (const deviceId of deviceList) {
               deviceStatusList.set(deviceId, deviceStatus) 
            }
            resolve(this.getAllDeviceStatus())
        })
    }


}

export { DeviceManager }