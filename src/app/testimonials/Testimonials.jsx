import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Ahmed Raza",
      role: "Workshop Owner",
      image: "https://avatar.vercel.sh/ahmed",
      feedback:
        "This system completely changed how I manage my wood inventory and orders. Everything is now organized and fast.",
    },
    {
      name: "Sara Khan",
      role: "Operations Manager",
      image: "https://avatar.vercel.sh/sara",
      feedback:
        "Production tracking is much easier now. We reduced delays and improved delivery time significantly.",
    },
    {
      name: "Usman Ali",
      role: "Business Owner",
      image: "https://avatar.vercel.sh/usman",
      feedback:
        "The analytics dashboard gives me real insights into my business. Highly recommended for woodcraft businesses.",
    },
  ];

  return (
    <section className="w-full py-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-12">

        <div className="text-center space-y-2">
          <h2 className="text-3xl md:text-4xl font-bold">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground">
            Real feedback from woodcraft business owners using our system
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6 space-y-4">

                {/* Stars */}
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{t.feedback}"
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <Avatar>
                    <AvatarImage src={t.image} />
                    <AvatarFallback>
                      {t.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.role}
                    </p>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}