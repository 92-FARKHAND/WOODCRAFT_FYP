import User from "@/models/User.model";
import Expense from "@/models/Expense.model";
import { apiHandler } from "@/lib/apiHandler";
import { authMiddleware } from "@/lib/authMiddleware";

export const POST = apiHandler(
  authMiddleware(async (req, { params }) => {
    const { id } = params;

    const user = await User.findById(id);
    if (!user) {
      throw new Error("User not found");
    }

    const amountToPay = (user.hourlyRate || 0) * (user.hoursToPaid || 0);

    // 1. Create Expense Record
    if (amountToPay > 0) {
      await Expense.create({
        category: 'Wage',
        amount: amountToPay,
        description: `Wage payment for ${user.name} (${user.hoursToPaid} hours)`,
        referenceId: user._id,
        date: new Date()
      });
    }

    // Accumulate totalTime and reset hoursToPaid
    user.totalTime = (user.totalTime || 0) + (user.hoursToPaid || 0);
    user.hoursToPaid = 0;
    
    await user.save();

    return { 
      message: "Employee paid successfully", 
      amountPaid: amountToPay,
      totalTime: user.totalTime,
      hoursToPaid: user.hoursToPaid 
    };
  }, ["admin"])
);

