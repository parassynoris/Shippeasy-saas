const { BlobServiceClient } = require("@azure/storage-blob");

const connectionString = process.env.AZURE_CONNECTION_STRING || process.env.AZURE_STORAGE_CONNECTION_STRING;

let blobServiceClient = null;
if (connectionString) {
    try {
        blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    } catch (err) {
        console.error('Azure Blob Storage client initialization failed — check AZURE_STORAGE_CONNECTION_STRING:', err.message);
    }
}

const containerName = process.env.AZURE_CONTAINER_NAME || "ship-docs";

async function streamToString(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data.toString());
        });
        readableStream.on("end", () => {
            resolve(chunks.join(""));
        });
        readableStream.on("error", reject);
    });
}
exports.uploadFile = async (name, document, isPublic = false) => {
    // Get a reference to a container
    let containerClient;

    if (isPublic)
        containerClient = blobServiceClient.getContainerClient("public-bl");
    else
        containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = isPublic ? name : encodeURIComponent(name);

    // Get a reference to a block blob
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);


    try {
        const uploadBlobResponse = await blockBlobClient.upload(document.buffer, document.size || document.length);
        return { "status": 200, "requestId": uploadBlobResponse.requestId, "name": blockBlobClient.name }
    } catch (error) {
        return { "status": 500, "error": error }
    }
}
exports.uploadAuditLog = async (id, document) => {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobName = `${id}_${Math.floor(Date.now() / 1000)}.json`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const dataToBeUploaded = JSON.stringify(document, null, 2)

    try {
        const uploadBlobResponse = await blockBlobClient.upload(dataToBeUploaded, dataToBeUploaded.length);
        return { "status": 200, "requestId": uploadBlobResponse.requestId, "name": blockBlobClient.name }
    } catch (error) {
        return { "status": 500, "error": e }
    }
}
exports.downloadAudioLog = async (blobName) => {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const downloadBlockBlobResponse = await blockBlobClient.download();
    const downloadedContent = await streamToString(downloadBlockBlobResponse.readableStreamBody);
    const jsonData = JSON.parse(downloadedContent);
    return jsonData
}
exports.downloadAttchmentFile = async (blobName) => {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const outputFile = 'output.txt';

    const fs = require('fs');

    await blockBlobClient.downloadToFile(outputFile);

    const fileContent = fs.readFileSync(outputFile);

    return fileContent.toString('base64');
}
exports.downloadAttchmentFileBatchAttachment = async (blobName) => {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const outputFile = 'output.txt';

    const fs = require('fs');

    await blockBlobClient.downloadToFile(outputFile);

    const fileContent = fs.readFileSync(outputFile);

    return fileContent
}

exports.downloadFile = async (blobName, isPublic = false) => {
    let containerClient;

    if (isPublic)
        containerClient = blobServiceClient.getContainerClient("public-bl");
    else
        containerClient = blobServiceClient.getContainerClient(containerName);

    const blockBlobClient = containerClient.getBlockBlobClient(encodeURIComponent(blobName));

    const downloadResponse = await blockBlobClient.download()
    
    return downloadResponse;
}