export default function About() {
  return (
    <section className="w-full py-20 px-6 md:px-12 bg-muted/40">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT - Content */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            About Our Woodcraft Management System
          </h2>

          <p className="text-muted-foreground text-lg leading-relaxed">
            Our platform is designed to simplify and modernize the way woodcraft
            businesses operate. From raw material tracking to final product delivery,
            we provide a centralized system that enhances efficiency and reduces
            manual effort.
          </p>

          <p className="text-muted-foreground text-lg leading-relaxed">
            Whether you're managing a small workshop or a large-scale production unit,
            our system helps you stay organized, track inventory in real-time,
            manage customer orders, and optimize production workflows seamlessly.
          </p>

          <div className="flex gap-4">
            <div className="bg-background border rounded-xl p-4 flex-1">
              <h3 className="font-semibold text-xl">Efficiency</h3>
              <p className="text-sm text-muted-foreground">
                Automate daily operations
              </p>
            </div>

            <div className="bg-background border rounded-xl p-4 flex-1">
              <h3 className="font-semibold text-xl">Accuracy</h3>
              <p className="text-sm text-muted-foreground">
                Real-time tracking system
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT - Visual Block */}
        <div className="relative">
          <div className="rounded-2xl overflow-hidden shadow-lg">
            <img
              src="/About.jpg"
              alt="Woodcraft workshop"
              className="w-full h-[400px] object-cover"
            />
          </div>

          {/* Floating stats card */}
          <div className="absolute -bottom-6 -left-6 bg-background border rounded-xl p-4 shadow-md">
            <p className="text-2xl font-bold">500+</p>
            <p className="text-sm text-muted-foreground">
              Projects Managed
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}