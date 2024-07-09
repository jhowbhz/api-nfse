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
    default:
        throw new Error(`Mode ${mode} not supported.`);
}

class Client {
    constructor() {
        this.client = null;
    }

    setClient() {
        soap.createClient(url, {
            wsdl_options: {
                cert: fs.readFileSync('./certs/certificado.pem'), // Certificado PEM
                key: fs.readFileSync('./certs/chave_privada.pem'), // Chave privada PEM
                pfx: fs.readFileSync(process.env.PATH_CERT),
                passphrase: process.env.PWD_CERT,
                strictSSL: true
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
