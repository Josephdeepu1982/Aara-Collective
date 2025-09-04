import "dotenv/config";

import app from "./app.js";

app.set("trust proxy", 1);

const PORT = Number(process.env.PORT || 4000);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
