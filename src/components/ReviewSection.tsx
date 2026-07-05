"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    id: 1,
    name: "A*** K***",
    rating: 5,
    comment: "Bunganya cantik banget. Pacar saya suka banget! The best Ololeo Bucket ❤️",
  },
  {
    id: 2,
    name: "S****",
    rating: 5,
    comment: "Pesan untuk wisuda teman, bisa custom sesuai kemauan. Recommended!",
  },
  {
    id: 3,
    name: "C**** R****",
    rating: 5,
    comment: "Suka banget sama perpaduan warnanya, soft dan aesthetic. Harganya juga terjangkau untuk kualitas sepremium ini.",
  }
];

export default function ReviewSection() {
  return (
    <section className="py-24 bg-white dark:bg-card relative overflow-hidden" id="reviews">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-foreground mb-4">
            What Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Customers</span> Say
          </h2>
          <p className="text-gray-600 dark:text-muted-foreground max-w-2xl mx-auto text-lg">
            Don't just take our word for it. Here's what people love about our flower buckets.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-gradient-to-br from-white to-primary/5 dark:bg-none dark:bg-card p-8 rounded-3xl shadow-sm border border-primary/10 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-1 mb-4 text-yellow-400">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 dark:text-muted-foreground italic mb-6">"{review.comment}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                  {review.name.charAt(0)}
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-foreground">{review.name}</h4>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
