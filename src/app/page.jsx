"use client";

import Header from "@/components/layout/Header";
import Nav from "@/components/layout/Navbar";
import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import About from "./about/AboutUs";
import { ProjectCard } from "./project/Projects";
import Services from "./services/Services";
import Testimonials from "./testimonials/Testimonials";
import Footer from "@/components/layout/Footer";

export default function Page() {
  const images = [
    "/H-Img1.jpg",
    "/H-Img2.jpg",
    "/H-Img3.jpg",
  ];

  return (
    <>
      <Header wrapNav>
        <Nav />
      </Header>

      {/*Hero section*/}
      <section className="w-full min-h-screen flex items-center px-6 md:px-12 mt-12 lg:mt-0">
        <div className="grid md:grid-cols-2 gap-10 items-center w-full">

          {/* LEFT - Content */}
          <div className="text-center md:text-left space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Smart Woodcraft Management System
            </h1>

            <p className="text-lg text-muted-foreground">
              Streamline your woodworking business with powerful tools for
              inventory tracking, order management, production planning, and
              client handling — all in one place.
            </p>

            <div className="flex gap-4 justify-center md:justify-start">
              <Link
                href="/Auth"
                className="bg-primary text-white px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 inline-block"
              >
                Get Started
              </Link>
              <button className="border px-6 py-3 rounded-xl hover:bg-muted transition-colors">
                Learn More
              </button>
            </div>
          </div>
          {/* RIGHT - Carousel */}
          <div className="w-full">
            <Carousel className="w-full max-w-lg mx-auto">
              <CarouselContent>
                {images.map((src, index) => (
                  <CarouselItem key={index}>
                    <div className="p-1">
                      <Image
                        src={src}
                        alt={`Woodcraft ${index}`}
                        width={600}
                        height={300}
                        className="rounded-2xl w-full h-[300px] object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>

        </div>
      </section>
      <section id="about">
        <About />
      </section>

      <section id="projects">
        <ProjectCard />
      </section>

      <section id="services">
        <Services />
      </section>

      <section id="testimonials">
        <Testimonials />
      </section>

      <Footer />
    </>
  );
}

