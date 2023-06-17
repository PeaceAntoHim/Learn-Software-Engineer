import Adb, { Client, Tracker } from "@u4/adbkit";

class AdbService {
    client: Client;
    tracker: Tracker;
    constructor() { }

    async initClient() {
        this.client = Adb.createClient();
        this.tracker = await this.client.trackDevices();
    }

    async listDevices() {
        let devices = await this.client.listDevices();
        return devices
    }
}

export { AdbService }