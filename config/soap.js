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
        const certFile = process.env.PATH_CERT;

        // Verificar se o arquivo é PFX ou PEM
        if (certFile.endsWith('.pfx') || certFile.endsWith('.PFX')) {
            // Se for PFX, converter para PEM e então configurar o cliente SOAP
            const pemFile = 'certs/certificado.pem';
            this.convertPfxToPem(certFile, pemFile);
        } else if (certFile.endsWith('.pem') || certFile.endsWith('.PEM')) {
            // Se já for PEM, configurar diretamente o cliente SOAP
            this.setSoapClient(certFile);
        } else {
            throw new Error('Unsupported certificate format. Supported formats: PFX, PEM.');
        }
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

    setSoapClient(certFile) {
        soap.createClient(url, {
            options: {
                pfx: fs.readFileSync(certFile), // PFX ou PEM
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
