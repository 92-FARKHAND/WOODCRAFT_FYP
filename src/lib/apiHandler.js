import { NextResponse } from "next/server";
import dbConnect from "./db";

export const apiHandler = (controller) => async (req, context) => {
  try {
    await dbConnect();
    const data = await controller(req, context);
    const sanitized = JSON.parse(JSON.stringify(data));

    return NextResponse.json({ success: true, data: sanitized });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Something went wrong",
      },
      { status: 500 }
    );
  }
};