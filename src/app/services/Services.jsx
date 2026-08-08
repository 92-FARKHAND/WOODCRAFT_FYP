import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardAction
} from "@/components/ui/card";

export default function Services() {
  const services = [
    {
      title: "Inventory Management",
      description:
        "Track wood materials, stock levels, and supplier data in real time to prevent shortages and waste.",
      badge: "Core",
      image: "/Inventory.jpg",
    },
    {
      title: "Order Processing System",
      description:
        "Handle customer orders efficiently from request to delivery with full status tracking.",
      badge: "Business",
      image: "/orderProcessing.jpg",
    },
    {
      title: "Production Planning",
      description:
        "Organize cutting, shaping, and finishing workflows to maximize workshop productivity.",
      badge: "Operations",
      image: "/ProjectPlans.webp",
    },
    {
      title: "Client Management",
      description:
        "Maintain customer records, communication history, and order preferences in one place.",
      badge: "CRM",
      image: "/clientManagement.webp",
    },
    {
      title: "Analytics Dashboard",
      description:
        "Get insights on sales, production efficiency, and material usage with visual reports.",
      badge: "Insights",
      image: "/dashboard.avif",
    },
    {
      title: "Supplier Coordination",
      description:
        "Manage supplier relationships, pricing, and delivery schedules seamlessly.",
      badge: "Supply Chain",
      image: "/Supplier.jpg",
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-12 bg-muted/40">
      <div className="max-w-5xl mx-auto space-y-12">

        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">
            Our Services
          </h2>
          <p className="text-muted-foreground">
            Everything you need to manage and scale your woodcraft work.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card
              key={index}
              className="relative mx-auto w-full max-w-sm pt-0 overflow-hidden"
            >
              <div className="absolute inset-0 z-30 aspect-video bg-gray-900/20" />

              <img
                src={service.image}
                alt={service.title}
                className="relative z-20 aspect-video w-full object-cover brightness-75 "
              />

              <CardHeader>
                <CardAction>
                  <Badge variant="default">{service.badge}</Badge>
                </CardAction>

                <CardTitle>{service.title}</CardTitle>

                <CardDescription>
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardFooter />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}