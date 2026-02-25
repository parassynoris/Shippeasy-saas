const { mongoose, Schema, invoiceSchema, uuid, jwt, crypto, axios, azureStorage, inAppNotificationService, querystring, nodemailer, pdfScanner, ediController, OpenAI, objecdiff, sendMessage, getTextMessageInput, fs, _, simpleParser, connect, imapConfig, transporter, getChangedFields, removeIdField, recordLogAudit, encryptObject, decryptObject, isSubset, createInAppNotification, replacePlaceholders, generateRandomPassword, triggerPointExecute, insertIntoTally, getTransporter, getChildCompany} = require('./helper.controller')

exports.createLoadPlan = async (req, res, next) => {
    
    try {
        const { container, boxes } = req.body;
 
        if (!container || !boxes) {
            return res.status(400).json({ error: "Container and boxes data are required." });
        }
    
        let loadPlan = [];
        let x = 0, y = 0, z = 0; // Starting coordinates
    
        for (let box of boxes) {
            // Check if the box fits in the current row/column/level
            if (x + box.length > container.length) {
                x = 0;  // Move to the next row
                y += box.width; // Move to the next column
            }
            if (y + box.width > container.width) {
                y = 0;  // Reset column, move to the next layer
                z += box.height; // Stack the box on top
            }
            if (z + box.height > container.height) {
                return { error: "Container is full. Not all boxes fit." }; // Container is full
            }
    
            // Add the box to the load plan
            loadPlan.push({
                boxId: box.id,
                position: { x, y, z },
                dimensions: { length: box.length, width: box.width, height: box.height }
            });
    
            // Update x for the next box
            x += box.length;
        }

        if (loadPlan?.error) {
            return res.status(400).json(loadPlan);
        }
    
        return { container, loadPlan };
    } catch (error) {
        return res.status(400).json(error?.message);
    }
}

exports.calculateLoad = async (req, res, next) => {
    const { products, containers } = req.body;
    const totalLoad = {
        totalWeight: 0,
        totalVolume: 0,
        productTypeTotals: {
            box: { totalWeight: 0, totalVolume: 0 },
            bigbags: { totalWeight: 0, totalVolume: 0 },
            sacks: { totalWeight: 0, totalVolume: 0 },
            barrels: { totalWeight: 0, totalVolume: 0 },
            roll: { totalWeight: 0, totalVolume: 0 },
            pipes: { totalWeight: 0, totalVolume: 0 },
            bulk: { totalWeight: 0, totalVolume: 0 }
        },
        containerLoads: [],
        cargoAttributes: {}  // Initialize cargoAttributes
    };

    // Helper function to calculate volume based on product type
    function calculateVolume(product) {
        const { length, width, height, radius, diameter, type } = product;
        let volume = 0;

        switch (type) {
            case "box":
                volume = length * width * height;
                break;
            case "bigbags":
                volume = length * width * height;
                break;
            case "sacks":
                volume = length * width * height * 0.8;
                break;
            case "barrels":
                volume = Math.PI * Math.pow(diameter / 2, 2) * height;
                break;
            case "roll":
                volume = Math.PI * Math.pow(radius, 2) * width;
                break;
            case "pipes":
                volume = Math.PI * Math.pow(diameter / 2, 2) * length;
                break;
            case "bulk":
                volume = length * width * height * 1.1;
                break;
            default:
                throw new Error(`Unknown product type: ${type}`);
        }

        return volume;
    }

    // Process each product group
    products.forEach(group => {
        group.products.forEach(product => {
            const qty = parseInt(product.quantity);
            if (qty <= 0) return;

            const weight = parseFloat(product.weight);
            const { type, color, name, uid } = product;  // Assuming `color`, `name`, and `uid` properties are provided
            
            // Calculate volume based on product type
            const volume = calculateVolume(product);

            // Calculate total weight and volume for this product
            const itemTotalWeight = weight * qty;
            const itemTotalVolume = volume * qty;

            // Add to overall load
            totalLoad.totalWeight += itemTotalWeight;
            totalLoad.totalVolume += itemTotalVolume;

            // Add to specific product type total
            if (totalLoad.productTypeTotals[type]) {
                totalLoad.productTypeTotals[type].totalWeight += itemTotalWeight;
                totalLoad.productTypeTotals[type].totalVolume += itemTotalVolume;
            } else {
                totalLoad.productTypeTotals[type] = { totalWeight: itemTotalWeight, totalVolume: itemTotalVolume };
            }

            // Populate cargoAttributes for each unique product type
            if (!totalLoad.cargoAttributes[uid]) {
                totalLoad.cargoAttributes[uid] = {
                    name,
                    color,
                    volume,
                    weight,
                    type
                };
            }
        });
    });

    // Process each container to check capacity
    containers.forEach(container => {
        const maxWeight = parseFloat(container.maxh.replace(' Kgs', '')); // Convert max weight to number
        const maxVolume = parseFloat(container.cap.replace(' m3', '')); // Convert capacity to number

        // Determine if the total weight and volume fit within container's capacity
        const fitsWeight = totalLoad.totalWeight <= maxWeight;
        const fitsVolume = totalLoad.totalVolume <= maxVolume;

        // Add container load summary
        totalLoad.containerLoads.push({
            containerName: container.name,
            maxWeight,
            maxVolume,
            totalWeight: totalLoad.totalWeight,
            totalVolume: totalLoad.totalVolume,
            fits: fitsWeight && fitsVolume,
            message: fitsWeight && fitsVolume ? "Fits within capacity" : "Exceeds capacity",
            productTypeTotals: totalLoad.productTypeTotals  // Include product type-specific calculations
        });
    });

    // Send the totalLoad result in response
    res.send(totalLoad);
};