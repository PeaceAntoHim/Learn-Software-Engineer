import { before, beforeEach } from "mocha"
import { config } from "../config/config"
import { Main } from "../controller/Test"

// before(function() {
//    this.timeout(40000)


   const init = new Main() 

   init.initClientservice()
// })




