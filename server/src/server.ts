import "dotenv/config";
import { app } from "./app.js";
import adminRoutes from "./routes/admin.routes";

const PORT = Number(process.env.PORT) || 5000;

app.use("/api/admin", adminRoutes);

app.listen(PORT, () => {
  console.log(`FoodieFind server running on http://localhost:${PORT}`);
});

