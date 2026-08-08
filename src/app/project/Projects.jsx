import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProjectCard() {
  const projects = [
    {
      title: "Wood Inventory System",
      description:
        "Track raw wood materials, stock levels, and usage history in real time.",
      image: "/H-Img1.jpg",
      badge: "Inventory",
    },
    {
      title: "Order Management Portal",
      description:
        "Manage customer orders, production status, and delivery tracking.",
      image: "/H-Img2.jpg",
      badge: "Orders",
    },
    {
      title: "Production Workflow System",
      description:
        "Optimize woodworking production stages from cutting to finishing.",
      image: "/H-Img3.jpg",
      badge: "Workflow",
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-10">
      
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold">
            Our Projects
          </h2>
          <p className="text-muted-foreground">
            Key modules powering the Woodcraft Management System
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Card
              key={index}
              className="relative mx-auto w-full max-w-sm pt-0 overflow-hidden"
            >
              {/* Overlay */}
              <div className="absolute inset-0 z-30 aspect-video bg-gray-900/20" />

              <img
                src={project.image}
                alt={project.title}
                className="relative z-20 aspect-video w-full object-cover brightness-75 "
              />

              <CardHeader>
                <CardAction>
                  <Badge variant="default">{project.badge}</Badge>
                </CardAction>

                <CardTitle>{project.title}</CardTitle>

                <CardDescription>
                  {project.description}
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