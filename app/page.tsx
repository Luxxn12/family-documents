"use client" // This component needs to be a Client Component for Framer Motion

import { LandingHeader } from "@/components/landing-header"; // Import the new LandingHeader
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"; // Import motion from framer-motion
import {
    ClockIcon,
    FolderKanbanIcon,
    SearchIcon,
    Share2Icon,
    ShieldCheckIcon,
    UploadCloudIcon,
    UserRoundPlus,
} from "lucide-react"
import Link from "next/link"

// Framer Motion Variants
const fadeInUpVariants: any = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
}

const staggerContainerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const itemVariants: any = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <LandingHeader /> 
      <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-32 lg:pt-48 lg:pb-48 flex items-center justify-center text-center bg-gradient-to-br from-background to-card overflow-hidden">
        <div className="container px-4 md:px-6 z-10 space-y-8">
          <motion.h1
            className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
          >
            Manage Your Family Documents with <span className="text-accent">Ease & Security</span>
          </motion.h1>
          <motion.p
            className="max-w-3xl mx-auto text-base text-muted-foreground sm:text-lg md:text-xl"
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
            transition={{ ...fadeInUpVariants.visible.transition, delay: 0.2 }}
          >
            The trusted platform to store, organize, and share your family's important documents. Access anytime,
            anywhere, with leading security.
          </motion.p>
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUpVariants}
            transition={{ ...fadeInUpVariants.visible.transition, delay: 0.4 }}
          >
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Link href="/login">Get Started Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border text-foreground hover:bg-muted px-8 py-6 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 bg-transparent"
            >
              <Link href="#how-it-works">Learn More</Link>
            </Button>
          </motion.div>
        </div>
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-1000"></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-56 h-56 bg-secondary rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-3000"></div>
        </div>
      </section>
      <motion.section
        id="how-it-works"
        className="py-20 md:py-32 bg-background text-foreground"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainerVariants}
      >
        <div className="container px-4 md:px-6 text-center space-y-12">
          <motion.h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl" variants={fadeInUpVariants}>
            Simple Steps to Get Started
          </motion.h2>
          <motion.p
            className="max-w-2xl mx-auto text-base text-muted-foreground sm:text-lg md:text-xl"
            variants={fadeInUpVariants}
            transition={{ ...fadeInUpVariants.visible.transition, delay: 0.2 }}
          >
            Follow these easy steps to secure and organize your family's important documents.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            <motion.div
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border border-border bg-card shadow-md"
              variants={itemVariants}
            >
              <div className="relative flex items-center justify-center size-16 rounded-full bg-accent/10 text-accent mb-4">
                <UserRoundPlus className="h-8 w-8" />
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold text-lg border-2 border-card">
                  1
                </span>
              </div>
              <h3 className="text-xl font-semibold">Create Your Account</h3>
              <p className="text-muted-foreground">
                Sign up in minutes to get started with your secure document management.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border border-border bg-card shadow-md"
              variants={itemVariants}
            >
              <div className="relative flex items-center justify-center size-16 rounded-full bg-accent/10 text-accent mb-4">
                <UploadCloudIcon className="h-8 w-8" />
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold text-lg border-2 border-card">
                  2
                </span>
              </div>
              <h3 className="text-xl font-semibold">Upload Your Documents</h3>
              <p className="text-muted-foreground">
                Securely upload all your important files, from PDFs to photos, with ease.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border border-border bg-card shadow-md"
              variants={itemVariants}
            >
              <div className="relative flex items-center justify-center size-16 rounded-full bg-accent/10 text-accent mb-4">
                <FolderKanbanIcon className="h-8 w-8" />
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full size-8 flex items-center justify-center font-bold text-lg border-2 border-card">
                  3
                </span>
              </div>
              <h3 className="text-xl font-semibold">Organize & Share</h3>
              <p className="text-muted-foreground">
                Categorize your documents in nested folders and share them securely with family members.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>
      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-card text-card-foreground">
        <div className="container px-4 md:px-6 text-center space-y-12">
          <motion.h2
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            initial="hidden"
            whileInView="visible" // Animate when in view
            viewport={{ once: true, amount: 0.5 }} // Only animate once
            variants={fadeInUpVariants}
          >
            Our Key Features
          </motion.h2>
          <motion.p
            className="max-w-2xl mx-auto text-base text-muted-foreground sm:text-lg md:text-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInUpVariants}
            transition={{ ...fadeInUpVariants.visible.transition, delay: 0.2 }}
          >
            Designed for simplicity and security, Family Docs offers everything you need for efficient document
            management.
          </motion.p>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }} // Animate when 20% of the container is in view
            variants={staggerContainerVariants}
          >
            <motion.div
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border border-border bg-background shadow-md"
              variants={itemVariants}
            >
              <ShieldCheckIcon className="h-12 w-12 text-accent" />
              <h3 className="text-xl font-semibold">Guaranteed Security</h3>
              <p className="text-muted-foreground">
                Your documents are protected with advanced encryption and strict access controls.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border border-border bg-background shadow-md"
              variants={itemVariants}
            >
              <FolderKanbanIcon className="h-12 w-12 text-accent" />
              <h3 className="text-xl font-semibold">Easy Organization</h3>
              <p className="text-muted-foreground">
                Organize your files in nested folders and quickly find what you need.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border border-border bg-background shadow-md"
              variants={itemVariants}
            >
              <Share2Icon className="h-12 w-12 text-accent" />
              <h3 className="text-xl font-semibold">Secure Sharing</h3>
              <p className="text-muted-foreground">
                Share documents with specific family members with customizable permissions.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border border-border bg-background shadow-md"
              variants={itemVariants}
            >
              <SearchIcon className="h-12 w-12 text-accent" />
              <h3 className="text-xl font-semibold">Quick Search</h3>
              <p className="text-muted-foreground">Find any document in seconds with powerful search features.</p>
            </motion.div>
            <motion.div
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border border-border bg-background shadow-md"
              variants={itemVariants}
            >
              <ClockIcon className="h-12 w-12 text-accent" />
              <h3 className="text-xl font-semibold">Activity Log</h3>
              <p className="text-muted-foreground">
                Track all changes and document access with detailed activity logs.
              </p>
            </motion.div>
            <motion.div
              className="flex flex-col items-center space-y-4 p-6 rounded-lg border border-border bg-background shadow-md"
              variants={itemVariants}
            >
              <UploadCloudIcon className="h-12 w-12 text-accent" />
              <h3 className="text-xl font-semibold">Multi-File Upload</h3>
              <p className="text-muted-foreground">
                Supports various file formats, from PDFs to Office documents and images.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-card to-background text-center text-foreground">
        <div className="container px-4 md:px-6 space-y-8">
          <motion.h2
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInUpVariants}
          >
            Ready to Organize Your Documents?
          </motion.h2>
          <motion.p
            className="max-w-3xl mx-auto text-base text-muted-foreground sm:text-lg md:text-xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInUpVariants}
            transition={{ ...fadeInUpVariants.visible.transition, delay: 0.2 }}
          >
            Join Family Docs today and experience the ease of family document management.
          </motion.p>
          <motion.div
            className="flex flex-col gap-4 sm:flex-row sm:justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInUpVariants}
            transition={{ ...fadeInUpVariants.visible.transition, delay: 0.4 }}
          >
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Link href="/register">Sign Up for Free</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-border text-foreground hover:bg-muted px-8 py-6 text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-105 bg-transparent"
            >
              <Link href="/login">Already Have an Account? Login</Link>
            </Button>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-8 bg-background text-muted-foreground text-center border-t border-border">
        <div className="container px-4 md:px-6">
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeInUpVariants}
            transition={{ ...fadeInUpVariants.visible.transition, delay: 0.2 }}
          >
            &copy; {new Date().getFullYear()} Family Docs. All rights reserved.
          </motion.p>
        </div>
      </footer>
    </div>
  )
}
