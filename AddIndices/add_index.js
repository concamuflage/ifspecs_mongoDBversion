async function addIndexes(db) {
    try {
        await db.collection('products').createIndex({ brand: 1 });
        console.log('Index created for brand');
    } catch (err) {
        console.error('Error creating index for brand:', err);
    }

    try {
        await db.collection('products').createIndex({ "quickSpec.RAM size": 1 });
        console.log('Index created for quickSpec.RAM size');
    } catch (err) {
        console.error('Error creating index for quickSpec.RAM size:', err);
    }

    try {
        await db.collection('products').createIndex({ "quickSpec.Chipset": 1 });
        console.log('Index created for quickSpec.Chipset');
    } catch (err) {
        console.error('Error creating index for quickSpec.Chipset:', err);
    }

    try {
        await db.collection('products').createIndex({ "quickSpec.Display size": 1 });
        console.log('Index created for quickSpec.Display size');
    } catch (err) {
        console.error('Error creating index for quickSpec.Display size:', err);
    }

    try {
        await db.collection('products').createIndex({ "quickSpec.Display resolution": 1 });
        console.log('Index created for quickSpec.Display resolution');
    } catch (err) {
        console.error('Error creating index for quickSpec.Display resolution:', err);
    }

    try {
        await db.collection('products').createIndex({ "detailSpec.Platform.Chipset": 1 });
        console.log('Index created for detailSpec.Platform.Chipset');
    } catch (err) {
        console.error('Error creating index for detailSpec.Platform.Chipset:', err);
    }

    try {
        await db.collection('products').createIndex({ "detailSpec.Platform.CPU": 1 });
        console.log('Index created for detailSpec.Platform.CPU');
    } catch (err) {
        console.error('Error creating index for detailSpec.Platform.CPU:', err);
    }

    try {
        await db.collection('products').createIndex({ "detailSpec.Platform.GPU": 1 });
        console.log('Index created for detailSpec.Platform.GPU');
    } catch (err) {
        console.error('Error creating index for detailSpec.Platform.GPU:', err);
    }


}


module.exports = addIndexes