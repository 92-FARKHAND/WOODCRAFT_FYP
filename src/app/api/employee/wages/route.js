import Expense from "@/models/Expense.model";
import { apiHandler } from "@/lib/apiHandler";
import { authMiddleware } from "@/lib/authMiddleware";

export const GET = apiHandler(
  authMiddleware(async (req) => {
    const employeeId = req.user.id;

    const wages = await Expense.find({
      category: "Wage",
      referenceId: employeeId
    }).sort({ date: -1 });

    return wages;
  }, ["employee"])
);
