import 'dotenv/config'

export const configApp = {
    http: {
        listenPort: process.env.HTTP_PORT || 8080
    },
    logLevel: {
        level: process.env.LOG_LEVEL || "debug"
    },
    hostname: process.env.HOST_NAME,
    //server
    smsServer: {
        host: process.env.SMS_SERVER_HOST,
        apiPath: '/sms_message/add.api'
    },
    transServer: {
        host: process.env.TRANS_SERVER_HOST,
        apiPath: '/machine/update_job.api',
        apiKurasPath: '/machine/update_job_kuras.api'
    },
    filterMutationServer: {
        host: process.env.FILTER_MUTATION_SERVER_HOST,
        apiPath: '/merchant_result_qr.api'
    },


}

// export default configApp