
import { Device } from "@u4/adbkit";
import { AppiumManager } from "../appium/AppiumManager.js";
import { AdbService } from "./AdbService.js";
import { TDevice } from "../types/templateService.js";
import PQueue from "p-queue";


/**@type {Map<String, PQueue>} */
let deviceQueueList: Map<string, PQueue>

/** @type {Map<String, String>} */
let deviceStatusList: Map<string, string>;

class DeviceManager {
    adbService: AdbService;
    appiumManager: AppiumManager;

    /**
     * 
     * @param {{adbService: AdbService, appiumManager: AppiumManager}}  
     */
    constructor({ adbService, appiumManager }: { adbService: AdbService; appiumManager: AppiumManager; }) {
        deviceQueueList = new Map();
        deviceStatusList = new Map();
        this.adbService = adbService;
        this.appiumManager = appiumManager
    }

    async syncDevices() {
        console.debug("SyncDevices")
        let tracker = this.adbService.tracker;

        tracker.on("add", async (device: Device) => {
            console.debug("add", device)
        })

        tracker.on("remove", async (device: Device) => {
            console.debug("remove", device)
            // remove 
            await this.removeDevice(device)
        })

        tracker.on("change", async (device: Device) => {
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

        let promises = currDevicesConnected.map(async (device: Device) => {
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
    async createDevice(device: Device) {
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
    async getDeviceById({ deviceId, ignoreMaintenanceStatus = false }: { deviceId: string; ignoreMaintenanceStatus?: boolean; }): Promise<TDevice> {
        let devices = await this.getDevices()
        let device = devices.find((val: { id: string; }) => {
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
    async removeDevice(device: Device) {
        
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
    async createDeviceQueue(device: Device) {

        if (Object.keys(deviceQueueList).includes(device.id)) {
            console.warn(`${device.id} queue already created`)
            return false;
        } else {
            deviceQueueList.set(device.id, new PQueue({ concurrency: 1 }))
            console.debug(`${device.id} queue created`)
            // console.log(deviceQueueList.get(device.id))
            // msgLogger.sendConsoleDebug({context: "DEVICE", event: "QUEUE_CREATED"}, {DeviceId: deviceId})
            return true;
        }
    }

    /**
     * 
     * @param {Device} device 
     */
    deleteDeviceQueue(device: Device) {
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
    getDeviceQueueByDeviceId(deviceId: string): Promise<PQueue> {
        return new Promise((resolve, reject) => {
            deviceQueueList.set(deviceId, new PQueue({ concurrency: 1 }))
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
    getDeviceStatusById(deviceId: string){
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
    updateDeviceStatusById(deviceId: string, SetMaintenance: boolean) {
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
        } ) 
    } 
    updateAllDeviceStatus(SetMaintenance: boolean){

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