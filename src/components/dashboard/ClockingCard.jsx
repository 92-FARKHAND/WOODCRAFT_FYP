"use client";

import { useClockInMutation, useClockOutMutation } from "@/redux/api/userApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, Timer } from "lucide-react";
import { toast } from "react-hot-toast";
import { useSession } from "next-auth/react";

export function ClockingCard() {
  const { data: session, update } = useSession();
  const [clockIn, { isLoading: isClockingIn }] = useClockInMutation();
  const [clockOut, { isLoading: isClockingOut }] = useClockOutMutation();

  const isWorking = session?.user?.workStatus === "Working";
  const hasValidHourlyRate = (session?.user?.hourlyRate ?? 0) > 0;

  const handleClockIn = async () => {
    try {
      await clockIn().unwrap();
      toast.success("Clocked in successfully");
      await update(); // Update session to reflect new workStatus
    } catch (err) {
      toast.error(err?.data?.error || "Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut().unwrap();
      toast.success("Clocked out successfully");
      await update(); // Update session to reflect new workStatus and hours
    } catch (err) {
      toast.error(err?.data?.error || "Failed to clock out");
    }
  };

  if (session?.user?.role !== "employee") return null;

  return (
    <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-indigo-500/10 via-background to-purple-500/10 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Session Tracking</CardTitle>
        <Timer className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2.5 w-2.5 rounded-full ${isWorking ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
                <p className="text-lg font-bold">{isWorking ? "Working" : "Idle"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Hours to Paid</p>
              <p className="text-lg font-bold">{(session?.user?.hoursToPaid || 0).toFixed(2)}h</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleClockIn}
              disabled={!hasValidHourlyRate || isWorking || isClockingIn}
              className="w-full bg-green-600 hover:bg-green-700 text-white transition-all active:scale-95"
            >
              <Play className="mr-2 h-4 w-4" />
             {!hasValidHourlyRate
               ? "Set Rate"
               : isClockingIn
               ? "Clocking In..."
               : "Clock In"
               }
            </Button>
            <Button
              onClick={handleClockOut}
              disabled={!isWorking || isClockingOut}
              variant="destructive"
              className="w-full transition-all active:scale-95"
            >
              <Square className="mr-2 h-4 w-4" />
              Clock Out
            </Button>
          </div>
          
          <div className="pt-2 border-t border-border/50">
             <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Lifetime Total</span>
                <span className="font-mono font-medium">{(session?.user?.totalTime || 0).toFixed(2)}h</span>
             </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
