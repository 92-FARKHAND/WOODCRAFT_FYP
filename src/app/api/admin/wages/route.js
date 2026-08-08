import User from "@/models/User.model";
import Expense from "@/models/Expense.model";
import { apiHandler } from "@/lib/apiHandler";
import { authMiddleware } from "@/lib/authMiddleware";

export const GET = apiHandler(
  authMiddleware(async (req) => {
    // Fetch all employees
    const employees = await User.find({ role: "employee" })
      .select("name email hourlyRate hoursToPaid wage contact status workStatus")
      .lean();

    // Calculate wages on the fly and return
    const employeesWithWages = employees.map((emp) => {
      const hourlyRate = emp.hourlyRate || 0;
      const hoursToPaid = emp.hoursToPaid || 0;
      const calculatedWage = hourlyRate * hoursToPaid;

      return {
        ...emp,
        calculatedWage: calculatedWage,
      };
    });

    return employeesWithWages;
  }, ["admin"])
);

export const POST = apiHandler(
  authMiddleware(async (req) => {
    const { employeeId } = await req.json();

    if (!employeeId) {
      throw new Error("Employee ID is required");
    }

    const employee = await User.findById(employeeId);
    if (!employee || employee.role !== "employee") {
      throw new Error("Employee not found");
    }

    const amount = (employee.hourlyRate || 0) * (employee.hoursToPaid || 0);

    if (amount <= 0) {
      throw new Error("No pending wages to pay for this employee");
    }

    // 1. Create Expense Record
    await Expense.create({
      category: "Wage",
      amount: amount,
      description: `Wage payment for ${employee.name} (${employee.hoursToPaid} hours)`,
      date: new Date(),
      referenceId: employee._id
    });

    // 2. Reset Employee Hours
    employee.hoursToPaid = 0;
    await employee.save();

    return { message: "Wage payment processed successfully", amount };
  }, ["admin"])
);

