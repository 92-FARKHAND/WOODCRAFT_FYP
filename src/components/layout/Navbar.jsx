"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  const navLinks = [
    { label: "About Us", href: "#about", id: "about" },
    { label: "Projects", href: "#projects", id: "projects" },
    { label: "Services", href: "#services", id: "services" },
    { label: "Testimonials", href: "#testimonials", id: "testimonials" },
  ];

  const linkClass = (id) =>
    `transition-all duration-300 hover:text-primary relative py-1 ${
      activeSection === id ? "text-primary font-bold" : "text-muted-foreground"
    }`;

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px", // Trigger when section is roughly in upper-middle of screen
      threshold: 0,
    };

    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    navLinks.forEach((link) => {
      const element = document.getElementById(link.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center justify-evenly px-8">
        <ul className="flex gap-8 text-md font-medium">
          {navLinks.map((link) => (
            <li key={link.id}>
              <Link href={link.href} className={linkClass(link.id)}>
                {link.label}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-left-2 duration-300" />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Mobile Hamburger */}
      <div className="md:hidden">
        <button 
          onClick={() => setOpen((prev) => !prev)}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="fixed top-[73px] inset-x-0 z-40 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 text-xl font-medium h-[calc(100vh-73px)] border-b transition-all duration-300 animate-in fade-in zoom-in-95">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`${linkClass(link.id)} text-2xl`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}