"use client";

import { useSession } from "next-auth/react";
import {
  Wallet,
  Clock,
  DollarSign,
  Receipt,
  ArrowUpRight,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useGetMyWagesQuery } from "@/redux/api/billingApi";

export default function PaymentsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const { data: wages, isLoading: isLoadingWages } = useGetMyWagesQuery();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const myWage = (user?.hourlyRate || 0) * (user?.hoursToPaid || 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Earnings
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your work hours, hourly rate, and pending payments.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <EarningsCard 
          title="Pending Wages" 
          value={`$ ${myWage.toLocaleString()}`} 
          icon={<Wallet className="text-emerald-500" />}
          description={`For ${user?.hoursToPaid || 0} pending hours`}
          isPrimary={true}
        />
        <EarningsCard 
          title="Hourly Rate" 
          value={`$ ${user?.hourlyRate || 0}`} 
          icon={<DollarSign className="text-blue-500" />}
          description="Fixed rate per work hour"
        />
        <EarningsCard 
          title="Total Time" 
          value={`${user?.totalTime || 0} hrs`} 
          icon={<Clock className="text-amber-500" />}
          description="Cumulative lifetime hours"
        />
      </div>

      <Card className="border-none shadow-2xl bg-card/30 backdrop-blur-md overflow-hidden">
        <CardHeader className="border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                Recent Payment History
              </CardTitle>
              <CardDescription>Records of your successfully processed wage payments.</CardDescription>
            </div>
            <Badge variant="outline" className="bg-background">Live Updates</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoadingWages ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : wages && wages.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[150px]">Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wages.map((wage) => (
                    <TableRow key={wage._id} className="hover:bg-muted/20 transition-colors border-border/40">
                      <TableCell className="font-medium">
                        {new Date(wage.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>{wage.description}</TableCell>
                      <TableCell className="text-right font-black text-emerald-600">
                        $ {wage.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <Wallet className="h-10 w-10 opacity-20" />
              </div>
              <h3 className="text-lg font-semibold text-foreground/80">No payment records found</h3>
              <p className="text-sm max-w-xs text-center mt-1">
                Your payment history will automatically appear here once an administrator processes your wages.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EarningsCard({ title, value, icon, description, isPrimary }) {
  return (
    <Card className={`border-none shadow-xl relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 ${isPrimary ? 'bg-primary/5' : 'bg-card/40 backdrop-blur-sm'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="p-2.5 rounded-xl bg-background border border-border group-hover:border-primary/50 transition-all duration-300">
            {icon}
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">{title}</span>
          <span className="text-3xl font-black tracking-tight">{value}</span>
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500/50" />
            {description}
          </p>
        </div>
      </CardContent>
      {/* Decorative gradient */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-3xl transition-all duration-500 ${isPrimary ? 'bg-primary/10 group-hover:bg-primary/20' : 'bg-primary/5 group-hover:bg-primary/10'}`} />
    </Card>
  );
}
