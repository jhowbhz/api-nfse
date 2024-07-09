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
                cert: fs.readFileSync(process.env.PATH_CERT_PEM),          // Certificado
                key: fs.readFileSync(process.env.PATH_CERT_KEY),           // Chave do certificado
                passphrase: process.env.PWD_CERT,                     // Senha do certificado
                strictSSL: true,
                securityOptions: 'SSL_OP_NO_SSLv3' // Opção para desativar SSLv3
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
