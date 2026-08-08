import Expense from "@/models/Expense.model";
import { apiHandler } from "@/lib/apiHandler";
import { authMiddleware } from "@/lib/authMiddleware";

export const GET = apiHandler(
  authMiddleware(async (req) => {
    const expenses = await Expense.find().sort({ date: -1 });
    return expenses;
  }, ["admin"])
);

export const POST = apiHandler(
  authMiddleware(async (req) => {
    const body = await req.json();
    const expense = await Expense.create(body);
    return expense;
  }, ["admin"])
);
