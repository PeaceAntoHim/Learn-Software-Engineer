import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts"
import createMessageBaseAllSegmentDevice from "./src/controllers/allSegmentDevice.ts"
import createMessageBaseExternalIdDevice from "./src/controllers/baseExternalIdDevice.ts"


const router = new Router()

router
.post("/baseAllSegments",  createMessageBaseAllSegmentDevice)
.post("/baseExternalId", createMessageBaseExternalIdDevice)

export default router
