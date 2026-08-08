import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">

        <div className="grid md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              WoodCraft System
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A complete management solution for woodcraft businesses.
              Manage inventory, orders, production, and clients in one place.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-foreground cursor-pointer">Home</li>
              <li className="hover:text-foreground cursor-pointer">About</li>
              <li className="hover:text-foreground cursor-pointer">Projects</li>
              <li className="hover:text-foreground cursor-pointer">Services</li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">Services</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Inventory Management</li>
              <li>Order Processing</li>
              <li>Production System</li>
              <li>Analytics Dashboard</li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>support@woodcraft.com</li>
              <li>+92 300 1234567</li>
              <li>Islamabad, Pakistan</li>
            </ul>

            {/* Social Icons */}
            <div className="flex gap-3 pt-2 text-muted-foreground">
              <Facebook size={18} className="hover:text-foreground cursor-pointer" />
              <Twitter size={18} className="hover:text-foreground cursor-pointer" />
              <Instagram size={18} className="hover:text-foreground cursor-pointer" />
              <Linkedin size={18} className="hover:text-foreground cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} WoodCraft System. All rights reserved.</p>

          <div className="flex gap-6 mt-3 md:mt-0">
            <span className="hover:text-foreground cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-foreground cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}