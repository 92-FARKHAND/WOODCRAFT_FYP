"use client";
import React from "react";
import { Receipt, Download, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getStatusBadge = (status) => {
  switch (status) {
    case "unpaid":
      return (
        <Badge className="bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20">
          Unpaid
        </Badge>
      );
    case "partially_paid":
      return (
        <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20">
          Partially Paid
        </Badge>
      );
    case "paid":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Paid
        </Badge>
      );
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const InvoiceDetail = ({ invoice, isOpen, onClose }) => {
  const handleDownload = () => {
    window.print();
  };

  if (!invoice) return null;

  const balanceDue = invoice.amount - (invoice.amountPaid || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden rounded-2xl">

        {/* ── Header Bar ── */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b bg-muted/30">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Receipt className="h-5 w-5 text-primary shrink-0" />
            Invoice Details
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[75vh]">

          {/* ── Brand + Meta Row ── */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
              <h2 className="text-2xl font-black text-primary italic tracking-tighter leading-none">
                WOODCRAFT
              </h2>
              <p className="text-xs font-mono text-muted-foreground">
                INV-#{invoice._id.toUpperCase().slice(-8)}
              </p>
              <p className="text-xs text-muted-foreground">
                Issued: {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1.5 text-right">
              {getStatusBadge(invoice.status)}
              <p className="text-sm font-semibold leading-tight">Woodcraft Workshop</p>
              <p className="text-xs text-muted-foreground">Financial Department</p>
            </div>
          </div>

          {/* ── Client + Project Info ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
            {/* Client */}
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Client Information
              </p>
              <p className="font-bold text-base leading-tight">
                {invoice.customerId?.name || "N/A"}
              </p>
              <p className="text-sm text-muted-foreground">
                {invoice.customerId?.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {invoice.customerId?.contact}
              </p>
            </div>

            {/* Divider (vertical on sm+) */}
            <div className="sm:border-l sm:pl-4 border-border/50 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Project Reference
              </p>
              <p className="text-sm font-semibold leading-tight">
                Order ID: #
                {invoice.orderId?._id?.slice(-8).toUpperCase() ||
                  invoice.orderId?.slice(-8).toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground">
                Service:{" "}
                {invoice.orderId?.serviceId?.name ||
                  invoice.orderId?.serviceId?.serviceTitle ||
                  "Custom Project"}
              </p>
            </div>
          </div>

          {/* ── Line Items Table ── */}
          <div className="rounded-xl border border-border/50 overflow-hidden shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-xs font-bold uppercase tracking-wide">
                    Item Description
                  </TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wide text-right whitespace-nowrap w-[120px]">
                    Line Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Service Item */}
                <TableRow className="hover:bg-muted/20">
                  <TableCell className="py-4 whitespace-normal break-words">
                    <p className="font-semibold text-sm leading-tight break-words max-w-[400px]">
                      {invoice.orderId?.serviceId?.name ||
                        invoice.orderId?.serviceId?.serviceTitle ||
                        "Woodcrafting Service"}
                    </p>
                    <p className="text-xs text-muted-foreground italic mt-0.5 break-words max-w-[400px]">
                      Professional woodcraft project execution and craftsmanship.
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-sm whitespace-nowrap">
                    $ {(invoice.amount - (invoice.orderId?.usedMaterials?.reduce((acc, m) => acc + (m.priceAtTime * m.quantity), 0) || 0)).toFixed(3)}
                  </TableCell>
                </TableRow>

                {/* Materials Breakdown */}
                {invoice.orderId?.usedMaterials?.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/20 border-t border-border/30">
                    <TableCell className="py-3 whitespace-normal break-words">
                      <p className="font-medium text-sm break-words max-w-[400px]">
                        {item.materialId?.name || "Material"}
                      </p>
                      <p className="text-xs text-muted-foreground break-words max-w-[400px]">
                        Quantity: {item.quantity?.toFixed(3)} units @ $ {item.priceAtTime?.toFixed(3)}/unit
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm whitespace-nowrap">
                      $ {(item.priceAtTime * item.quantity).toFixed(3)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ── Summary Box ── */}
          <div className="flex justify-end">
            <div className="w-full sm:w-80 rounded-2xl bg-primary/5 border border-primary/15 overflow-hidden">
              <div className="px-5 py-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Invoiced</span>
                  <span className="font-mono font-semibold">
                    $ {Number(invoice.amount || 0).toFixed(3)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pb-3 border-b border-primary/15">
                  <span className="text-muted-foreground">Amount Received</span>
                  <span className="text-emerald-500 font-mono font-semibold">
                    − $ {Number(invoice.amountPaid || 0).toFixed(3)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black uppercase tracking-wide">
                    Balance Due
                  </span>
                  <span className="text-xl font-black text-primary font-mono leading-none">
                    $ {Number(balanceDue || 0).toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/20 flex flex-row items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="print:hidden">
            Close
          </Button>
          <Button size="sm" className="gap-2 shadow-sm shadow-primary/20 print:hidden" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>

        <style jsx global>{`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }
            body {
              background: #eee !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            body * {
              visibility: hidden;
            }
            /* Hide the overlay completely */
            div[data-state="open"].fixed.inset-0 {
              display: none !important;
            }
            /* Center the dialog on the printed page */
            [role="dialog"] {
              visibility: visible !important;
              position: absolute !important;
              left: 500 !important;
              right: 0 !important;
              top: 500 !important;
              margin: 0 auto !important;
              padding: 0 !important;
              width: 100% !important;
              height: auto !important;
              max-width: 768px !important;
              transform: none !important;
              box-shadow: none !important;
              border: none !important;
              background: white !important;
              color: black !important;
            }
            [role="dialog"] * {
              visibility: visible !important;
            }
            .print\:hidden {
              display: none !important;
            }
            /* Hide close button */
            button[aria-label="Close"], .lucide-x {
               display: none !important;
            }
            /* Allow scrolling content to expand fully */
            .overflow-y-auto {
              overflow: visible !important;
              max-height: none !important;
            }
            /* Force table layout to fit within the page */
            table {
              width: 100% !important;
              table-layout: fixed !important;
            }
            td, th {
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            .max-w-\\[400px\\] {
              max-width: none !important;
            }
          }
        `}</style>

      </DialogContent>
    </Dialog>
  );
};

export default InvoiceDetail;