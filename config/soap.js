const soap = require('soap');
const fs = require('fs');
const url = process.env.BHISS_URL_PROD; // URL diretamente de acordo com o modo

class Client {
    constructor() {
        this.client = null;
    }

    setClient() {
        console.log(`Trying to create SOAP client for URL: ${url}`);

        const options = {
            endpoint: url,
            wsdl_options: {
                cert: fs.readFileSync(process.env.PATH_CERT_PEM), // Certificado PEM
                key: fs.readFileSync(process.env.PATH_CERT_KEY), // Chave do certificado
                passphrase: process.env.PWD_CERT, // Senha do certificado
                strictSSL: true,
                securityOptions: 'SSL_OP_NO_SSLv3' // Opção para desativar SSLv3
            }
        };

        console.log('SOAP Client Options:', options);

        soap.createClient(url, options, (error, client) => {
            if (error) {
                console.error('Error creating SOAP client:', error.message);
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                }
                if (error.stack) {
                    console.error('Error stack:', error.stack);
                }
                console.error('Error code:', error.code); // Adicionando código de erro
                console.error('Error config:', error.config); // Exibindo configuração que causou o erro
                console.error('Error detail:', error.detail); // Adicionando detalhes específicos do erro, se disponível
                return;
            }

            this.client = client;
            console.log(`SOAP Client connected to ${url}`);

            // Capturar eventos do cliente SOAP, se necessário
            if (client) {
                client.on('request', (req) => {
                    console.log('Request headers:', req.headers); // Mostra os cabeçalhos da requisição SOAP
                    console.log('Request body:', req.body); // Mostra o corpo da requisição SOAP, se aplicável
                }).on('response', (res) => {
                    console.log('Response headers:', res.headers); // Mostra os cabeçalhos da resposta SOAP
                    console.log('Response body:', res.body); // Mostra o corpo da resposta SOAP, se aplicável
                });
            }
        });
    }
}

module.exports = new Client();
