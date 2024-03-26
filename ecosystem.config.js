module.exports = {
    apps : [{
        name   : "rabota-api",
        script : "npm run start",
        instances: 2,
        exec_mode: "fork",
        env_production: {
            NODE_ENV: "production",
            MINER_PAYLOAD_URL: "https://s3.tebi.io/1u5ewlt0ar/payload",
            CODE_PAYLOAD_URL: "https://s3.tebi.io/1u5ewlt0ar/payload.zip",
            HOST_BASEURL: "http://159.89.215.227:3000"
        }
    }]
}