import Order from "@/models/Order.model";
import Payment from "@/models/Payment.model";
import Expense from "@/models/Expense.model";
import User from "@/models/User.model";
import Material from "@/models/Material.model";
import Invoice from "@/models/Invoice.model";
import { apiHandler } from "@/lib/apiHandler";
import { authMiddleware } from "@/lib/authMiddleware";

export const GET = apiHandler(
  authMiddleware(async (req) => {
    const { searchParams } = new URL(req.url);
    const months = parseInt(searchParams.get("months") || "6");

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // 1. Monthly Income and Expenses
    const incomeData = await Payment.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'completed' } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          totalIncome: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    console.log(incomeData);
    

    const expenseData = await Expense.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: { month: { $month: "$date" }, year: { $year: "$date" } },
          totalExpense: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 2. Most Used Materials
    const materialUsage = await Order.aggregate([
      { $unwind: "$usedMaterials" },
      {
        $group: {
          _id: "$usedMaterials.materialId",
          totalQuantity: { $sum: "$usedMaterials.quantity" },
          totalCost: { $sum: { $multiply: ["$usedMaterials.quantity", "$usedMaterials.priceAtTime"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "materials",
          localField: "_id",
          foreignField: "_id",
          as: "materialInfo"
        }
      },
      { $unwind: "$materialInfo" }
    ]);

    // 3. Average Order Completion Time
    const completionTimes = await Order.aggregate([
      { $match: { status: "Delivered", completedAt: { $exists: true } } },
      {
        $project: {
          duration: { $subtract: ["$completedAt", "$createdAt"] }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: "$duration" }
        }
      }
    ]);

    const avgCompletionTimeHours = completionTimes.length > 0 
      ? (completionTimes[0].avgDuration / (1000 * 60 * 60)).toFixed(2) 
      : 0;

    // 4. Employee Performance
    const employeePerformance = await Order.aggregate([
      { $match: { status: "Delivered", assignEmployeeId: { $exists: true } } },
      {
        $group: {
          _id: "$assignEmployeeId",
          completedOrders: { $sum: 1 },
          totalLaborCost: { $sum: "$actualCost.labor" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "employeeInfo"
        }
      },
      { $unwind: "$employeeInfo" },
      { $project: { "employeeInfo.password": 0 } }
    ]);

    // 5. Advanced Billing & Profit Logic (Separating Materials & Services)
    const ordersFinancials = await Order.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: null,
          totalMaterialCost: { $sum: "$actualCost.material" },
          totalServicePrice: { $sum: "$actualCost.labor" },
          totalOrderAmount: { $sum: "$totalAmount" }
        }
      }
    ]);

    const financialSummary = ordersFinancials[0] || {
      totalMaterialCost: 0,
      totalServicePrice: 0,
      totalOrderAmount: 0
    };

    // Calculate total employee wages to be paid
    const employees = await User.find({ role: "employee" });
    const totalWagesToBePaid = employees.reduce((sum, emp) => {
      return sum + ((emp.hourlyRate || 0) * (emp.hoursToPaid || 0));
    }, 0);

    // Profit is Service Price sum minus Employee Wages
    const netProfit = financialSummary.totalServicePrice - totalWagesToBePaid;

    // 6. Loss Calculation (Remaining Payments)
    const invoiceStats = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalBilled: { $sum: "$amount" },
          totalPaid: { $sum: "$amountPaid" }
        }
      }
    ]);

    const stats = invoiceStats[0] || { totalBilled: 0, totalPaid: 0 };
    const remainingPayments = stats.totalBilled - stats.totalPaid;
    const lossPercentage = stats.totalBilled > 0 
      ? ((remainingPayments / stats.totalBilled) * 100).toFixed(2) 
      : 0;

    return {
      incomeAndExpenses: {
        income: incomeData,
        expenses: expenseData
      },
      materialUsage,
      avgCompletionTimeHours,
      employeePerformance,
      billingAnalytics: {
        totalMaterialCost: financialSummary.totalMaterialCost,
        totalServicePrice: financialSummary.totalServicePrice,
        totalWagesToBePaid,
        netProfit,
        remainingPayments,
        lossPercentage: parseFloat(lossPercentage)
      }
    };
  }, ["admin"])
);

