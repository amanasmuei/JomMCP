"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: "What is JomMCP and how does it work?",
    answer: "JomMCP is an automated platform that converts your existing APIs into Model Context Protocol (MCP) servers. Simply upload your OpenAPI specification, and our AI-powered system generates optimized MCP server code, handles deployment, and provides ongoing monitoring and management."
  },
  {
    id: 2,
    question: "How long does it take to deploy an MCP server?",
    answer: "Most MCP servers are generated and deployed within 3-5 minutes. Complex APIs with multiple endpoints might take up to 10 minutes. Our system handles everything automatically, including code generation, testing, containerization, and deployment to our cloud infrastructure."
  },
  {
    id: 3,
    question: "What API formats do you support?",
    answer: "We support OpenAPI 3.0+ specifications (JSON and YAML), Swagger 2.0, and can also analyze REST APIs from their documentation. Our AI can parse and understand various API documentation formats to generate accurate MCP server implementations."
  },
  {
    id: 4,
    question: "Is my API data secure?",
    answer: "Absolutely. We implement enterprise-grade security including end-to-end encryption, secure API key management, VPC isolation, and SOC 2 compliance. Your API specifications and generated code are stored securely and never shared with third parties."
  },
  {
    id: 5,
    question: "Can I customize the generated MCP server code?",
    answer: "Yes! While our AI generates optimized code automatically, you can customize templates, add custom middleware, modify authentication flows, and extend functionality. Professional and Enterprise plans include advanced customization options and custom template creation."
  },
  {
    id: 6,
    question: "What happens if my API changes?",
    answer: "JomMCP can automatically detect API changes and update your MCP servers accordingly. You can set up webhooks or manually trigger updates when your API specification changes. We maintain version history and can rollback if needed."
  },
  {
    id: 7,
    question: "Do you provide monitoring and analytics?",
    answer: "Yes, we provide comprehensive monitoring including real-time performance metrics, error tracking, usage analytics, uptime monitoring, and custom alerts. Enterprise plans include advanced analytics and custom dashboards."
  },
  {
    id: 8,
    question: "Can I use my own infrastructure?",
    answer: "Enterprise customers can deploy MCP servers to their own infrastructure or hybrid cloud setups. We support deployment to AWS, GCP, Azure, and on-premise Kubernetes clusters while maintaining our management and monitoring capabilities."
  },
  {
    id: 9,
    question: "What support do you offer?",
    answer: "We provide different support levels based on your plan: community support for free users, priority email support for Professional users, and dedicated support managers with SLA guarantees for Enterprise customers. All plans include comprehensive documentation and tutorials."
  },
  {
    id: 10,
    question: "How does pricing work?",
    answer: "We offer a free tier for individual developers, Professional plans starting at $29/month for teams, and custom Enterprise pricing. All paid plans include a 14-day free trial. Pricing is based on the number of MCP servers and included features, not API calls or usage."
  }
];

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <section className="py-24 px-4 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/5 via-purple-950/5 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 backdrop-blur-sm mb-6">
              <HelpCircle className="w-4 h-4 mr-2" />
              Frequently Asked Questions
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-white">
              Got <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Questions</span>?
            </h2>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              Find answers to common questions about JomMCP, our features, and how to get started.
            </p>
          </motion.div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all duration-300 backdrop-blur-sm">
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-neutral-800/30 transition-colors"
                >
                  <span className="font-semibold text-white pr-8">
                    {faq.question}
                  </span>
                  <motion.div
                    animate={{ rotate: openItems.includes(faq.id) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openItems.includes(faq.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 border-t border-neutral-800">
                        <p className="text-neutral-300 leading-relaxed pt-4">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-neutral-400 mb-6">
              Our team is here to help. Get in touch with us for personalized assistance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
              >
                Contact Support
              </a>
              <a
                href="/docs"
                className="inline-flex items-center justify-center px-6 py-3 border border-neutral-700 text-neutral-300 font-medium rounded-lg hover:bg-neutral-800 hover:border-neutral-600 transition-all duration-200"
              >
                View Documentation
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}