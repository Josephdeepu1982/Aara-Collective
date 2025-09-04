const clampPageSize = (size: number, max = 100) => {
  return Math.max(1, Math.min(size, max));
};

export default clampPageSize;

//This function makes sure that the number of items you want to show per page stays within a safe and reasonable range.
//This function makes sure it’s at least 1 item and no more than 100 items.
//Math.max(1, ...) ensures atleast 1 item
//example: if someone asks for GET /products?page=2&pageSize=5000 -> backend only returns 100 products, not 5000.
