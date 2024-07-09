const soap = require('soap');
const fs = require('fs');
const mode = process.env.API_MODE;
let url;

switch (mode) {
    case "1":
        url = process.env.BHISS_URL_PROD;
        break;
    case "2":
        url = process.env.BHISS_URL_DEV;
        break;
}

class Client {
    constructor() {
        this.client = null;
    }

    setClient() {
        soap.createClient(url, {
            wsdl_options: {
                pfx: fs.readFileSync(process.env.PATH_CERT),
                passphrase: process.env.PWD_CERT,
                strictSSL: true,
                secureOptions: require('constants').SSL_OP_NO_SSLv3 | require('constants').SSL_OP_NO_TLSv1 // Evita SSLv3 e TLSv1
            }
        }, (error, client) => {
            if (error) {
                console.error('Error creating SOAP client:', error);
                return;
            }

            this.client = client;
            console.log(`SOAP ${mode == 1 ? 'Production' : 'Dev'} Connected - ${url}`);
        });
    }
}

module.exports = new Client();
