const soap = require('soap');
const fs = require('fs');
const { exec } = require('child_process');

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
        // Caminhos para os arquivos PFX e PEM
        const pfxFile = process.env.PATH_CERT;
        const pemFile = 'certs/certificado.pem'; // Caminho onde o arquivo PEM será salvo

        // Converter PFX para PEM se necessário
        this.convertPfxToPem(pfxFile, pemFile);
    }

    convertPfxToPem(pfxFile, pemFile) {
        const command = `openssl pkcs12 -in ${pfxFile} -out ${pemFile} -nodes -passin pass:${process.env.PWD_CERT}`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error converting PFX to PEM:', error);
                return;
            }
            console.log('PFX converted to PEM successfully.');
            // Depois de converter, configure o cliente SOAP com o arquivo PEM
            this.setSoapClient(pemFile);
        });
    }

    setSoapClient(pemFile) {
        soap.createClient(url, {
            options: {
                pfx: fs.readFileSync(process.env.PATH_CERT),
                cert: fs.readFileSync(pemFile), // Certificado PEM
                key: fs.readFileSync(pemFile), // Chave privada PEM
                passphrase: process.env.PWD_CERT, // Senha do certificado
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
