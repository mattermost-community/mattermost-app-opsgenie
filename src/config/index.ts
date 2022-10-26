require('dotenv').config('../');

export default {
    APP: {
        PORT: Number(process.env.PORT) || 4002,
        HOST: process.env.HOST || ''
    },
    OPSGENIE: {
        URL: 'https://api.opsgenie.com'
    }
}
