require('dotenv').config('../');

export default {
    APP: {
        PORT: Number(process.env.PORT) || 3000,
        HOST: process.env.HOST || 'http://192.168.0.4'
    },
    OPSGENIE: {
        URL: 'https://api.opsgenie.com'
    }
}
