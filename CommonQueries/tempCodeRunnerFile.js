async function getProductsByYear(db,year) {
  const products = await db.collection('products').find({ launch_year: year }).toArray();
  return products;
}

(async () => {
    const products = await getProductsByYear(2025); // example year
    console.log(products);
  })();