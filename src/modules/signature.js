const { SignedXml } = require('xml-crypto');
const fs = require('fs');
const pem = require('pem');
const myKeyInfo = require('../providers/myKeyInfo');

class Signature {
    constructor() {
        // Carrega o certificado PEM e a chave privada
        this.certificado = fs.readFileSync(process.env.PATH_CERT_PEM);
        this.chavePrivada = fs.readFileSync(process.env.PATH_CERT_KEY);
    }

    sign(xml, tag) {
        return new Promise((resolve, reject) => {
            pem.readPkcs12(process.env.PATH_CERT, { p12Password: process.env.PWD_CERT }, (err, cert) => {
                if (err) {
                    console.error("Error reading PKCS12:", err);
                    reject(err);
                    return;
                }

                // Obtém o certificado no formato correto para SignedXml
                const certificado = cert.cert.toString()
                    .replace('-----BEGIN CERTIFICATE-----', '').trim()
                    .replace('-----END CERTIFICATE-----', '').trim()
                    .replace(/(\r\n\t|\n|\r\t)/gm, "");

                // Configuração das opções de assinatura
                const options = {
                    implicitTransforms: ["http://www.w3.org/TR/2001/REC-xml-c14n-20010315"]
                };

                // Inicializa o SignedXml com as opções
                const sig = new SignedXml(null, options);

                // Adiciona a referência do XML que será assinado
                sig.addReference(`//*[local-name(.)='${tag}']`, [
                    'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
                    'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
                ]);

                // Define a chave privada e o provedor de informações da chave
                sig.signingKey = this.chavePrivada;
                sig.keyInfoProvider = new myKeyInfo(certificado);

                try {
                    console.log("Computing signature...");
                    // Calcula a assinatura do XML
                    sig.computeSignature(xml, { location: { reference: `//*[local-name(.)='${tag}']`, action: 'after' } });
                    console.log("Signature computed successfully.");
                    // Retorna o XML assinado
                    resolve(sig.getSignedXml());
                } catch (error) {
                    console.error("Error computing signature:", error);
                    reject(error);
                }
            });
        });
    }
}

module.exports = new Signature();
