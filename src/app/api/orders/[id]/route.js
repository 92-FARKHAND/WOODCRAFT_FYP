import Order from "@/models/Order.model";
import Invoice from "@/models/Invoice.model";
import Material from "@/models/Material.model";
import Notification from "@/models/Notification.model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOpts";
import { apiHandler } from "@/lib/apiHandler";

export const PATCH = apiHandler(async (req, { params }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const { id } = (await params);
  const body = await req.json();

  // Check if user is admin or the assigned employee/customer
  const order = await Order.findById(id);
  if (!order) {
    throw new Error("Order not found");
  }

  const isAdmin = session.user.role === "admin";
  const isEmployee = session.user.role === "employee" && order.assignEmployeeId?.toString() === session.user.id;
  
  if (!isAdmin && !isEmployee) {
    throw new Error("Forbidden");
  }

  // Admins can update everything. Employees can only update status and usedMaterials.
  let updateData = {};
  if (isAdmin) {
    updateData = body;
  } else if (isEmployee) {
    if (body.status) updateData.status = body.status;
    if (body.usedMaterials) updateData.usedMaterials = body.usedMaterials;
  }

  // If usedMaterials or actualCost.labor is updated, recalculate the total
  if (updateData.usedMaterials || (isAdmin && body.actualCost?.labor !== undefined)) {
    const newUsedMaterials = updateData.usedMaterials || order.usedMaterials;
    const oldUsedMaterials = order.usedMaterials || [];

    // Calculate inventory updates if usedMaterials changed
    if (updateData.usedMaterials) {
      const materialMap = new Map();

      // Track old quantities (to be added back to inventory)
      oldUsedMaterials.forEach(item => {
        const id = item.materialId.toString();
        materialMap.set(id, (materialMap.get(id) || 0) + item.quantity);
      });

      // Subtract new quantities (to be removed from inventory)
      newUsedMaterials.forEach(item => {
        const id = item.materialId.toString();
        materialMap.set(id, (materialMap.get(id) || 0) - item.quantity);
      });

      // Apply changes to inventory
      for (const [materialId, delta] of materialMap.entries()) {
        if (delta !== 0) {
          const material = await Material.findById(materialId);
          if (material) {
            material.quantity += delta;
            await material.save();

            // Check for low stock and notify admin
            if (material.quantity <= material.minStockLevel) {
              await Notification.create({
                title: "Low Stock Alert",
                message: `Material "${material.name}" is low on stock. Current quantity: ${material.quantity} ${material.unit}.`,
                type: "low_stock",
                targetRole: "admin",
                relatedId: material._id,
                onModel: "Material"
              });
            }
          }
        }
      }
    }

    const materialCost = newUsedMaterials.reduce((sum, item) => sum + (item.priceAtTime * item.quantity), 0);
    const laborCost = (isAdmin && body.actualCost?.labor !== undefined) ? body.actualCost.labor : order.actualCost.labor;
    
    updateData.actualCost = {
      ...order.actualCost,
      material: materialCost,
      labor: laborCost,
      total: materialCost + laborCost
    };
    updateData.totalAmount = updateData.actualCost.total;
  }

  if (updateData.status === "Completed") {
    updateData.completedAt = new Date();
  }

  const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true })
    .populate("customerId", "name email contact address")
    .populate("assignEmployeeId", "name email contact")
    .populate("usedMaterials.materialId")
    .populate("serviceId");

  // Handle Invoice Generation (either manually via checkbox or automatically via Completion)
  const shouldGenerateInvoice = (updatedOrder.invoiceAvailable || updatedOrder.status === "Completed") && !updatedOrder.invoiceId;
  
  if (shouldGenerateInvoice) {
    const invoiceAmount = updatedOrder.actualCost?.total || updatedOrder.totalAmount || 0;
    
    const newInvoice = await Invoice.create({
      orderId: updatedOrder._id,
      customerId: updatedOrder.customerId,
      amount: invoiceAmount,
      status: 'unpaid'
    });

    updatedOrder.invoiceId = newInvoice._id;
    updatedOrder.invoiceAvailable = true;
    await updatedOrder.save();
  }

  return updatedOrder;
});

export const GET = apiHandler(async (req, { params }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  const { id } = (await params);
  const order = await Order.findById(id)
    .populate("customerId", "name email contact address")
    .populate("assignEmployeeId", "name email contact")
    .populate("usedMaterials.materialId")
    .populate("materialId")
    .populate("serviceId");

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
});
