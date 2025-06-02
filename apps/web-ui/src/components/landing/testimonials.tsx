"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
  companyLogo?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Lead Developer",
    company: "TechFlow Solutions",
    content: "JomMCP transformed our API integration workflow. What used to take weeks now takes minutes. The auto-generation is incredibly accurate and the deployment process is seamless.",
    rating: 5,
    avatar: "/api/placeholder/64/64",
    companyLogo: "/api/placeholder/120/40"
  },
  {
    id: 2,
    name: "Marcus Rodriguez",
    role: "DevOps Engineer",
    company: "CloudScale Inc",
    content: "The monitoring and analytics features are game-changing. We can track performance across all our MCP servers in real-time. The platform scales beautifully with our growing infrastructure.",
    rating: 5,
    avatar: "/api/placeholder/64/64",
    companyLogo: "/api/placeholder/120/40"
  },
  {
    id: 3,
    name: "Emily Johnson",
    role: "CTO",
    company: "StartupVenture",
    content: "As a startup, speed is crucial. JomMCP allowed us to deploy production-ready MCP servers in hours instead of weeks. The cost savings and time efficiency are remarkable.",
    rating: 5,
    avatar: "/api/placeholder/64/64",
    companyLogo: "/api/placeholder/120/40"
  },
  {
    id: 4,
    name: "David Kim",
    role: "Senior Backend Engineer",
    company: "Enterprise Corp",
    content: "The security features and enterprise-grade infrastructure give us confidence in production. Documentation generation and SDK creation save our team countless hours.",
    rating: 5,
    avatar: "/api/placeholder/64/64",
    companyLogo: "/api/placeholder/120/40"
  },
  {
    id: 5,
    name: "Lisa Wang",
    role: "Product Manager",
    company: "InnovateTech",
    content: "The intuitive interface makes it easy for non-technical team members to understand our API ecosystem. The real-time collaboration features have improved our workflow significantly.",
    rating: 5,
    avatar: "/api/placeholder/64/64",
    companyLogo: "/api/placeholder/120/40"
  },
  {
    id: 6,
    name: "Alex Thompson",
    role: "Full Stack Developer",
    company: "WebCraft Agency",
    content: "JomMCP handles all the complex server setup while I focus on building great products. The automated testing and deployment pipeline is incredibly robust.",
    rating: 5,
    avatar: "/api/placeholder/64/64",
    companyLogo: "/api/placeholder/120/40"
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/5 via-purple-950/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 backdrop-blur-sm mb-6">
              <Star className="w-4 h-4 mr-2 fill-current" />
              Trusted by 10,000+ Developers
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Loved by <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Developers</span> Worldwide
            </h2>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              See what developers and teams are saying about their experience with JomMCP
            </p>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 h-full backdrop-blur-sm hover:border-neutral-700 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5">
                {/* Quote Icon */}
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Quote className="w-4 h-4 text-white fill-current" />
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-neutral-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-sm text-neutral-400">{testimonial.role}</div>
                    <div className="text-sm text-blue-400">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">4.9/5</div>
              <div className="text-neutral-400 text-sm">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-neutral-400 text-sm">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-neutral-400 text-sm">MCP Servers Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">99.9%</div>
              <div className="text-neutral-400 text-sm">Platform Uptime</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}