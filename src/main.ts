import express from "express";
import transactionRoutes from "./routes/transactions";

const app = express();

app.use(express.json());

//Routes
app.use(transactionRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

export default app;
