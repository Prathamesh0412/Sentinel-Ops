import { motion } from 'framer-motion'

// Animation variants for reusable components
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
}

export const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      duration: 0.4,
    },
  },
  hover: {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 17,
    },
  },
}

export const slideInFromLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
}

export const slideInFromRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
}

export const slideInFromTop = {
  hidden: { opacity: 0, y: -50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
}

export const slideInFromBottom = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
}

export const fadeInScale = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
    },
  },
}

export const pulseAnimation = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const glowPulse = {
  initial: { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.5)' },
  animate: {
    boxShadow: [
      '0 0 0 0 rgba(59, 130, 246, 0.5)',
      '0 0 0 10px rgba(59, 130, 246, 0)',
      '0 0 0 0 rgba(59, 130, 246, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
}

export const counterAnimation = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 10,
    },
  },
}

export const pageTransition = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12,
      duration: 0.6,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
    },
  },
}

// HOC for animated components
export const withMotion = (Component, variants = itemVariants) => {
  return motion(Component)
}

// Animated container component
export const AnimatedContainer = ({ children, className = '', variants = containerVariants }) => (
  <motion.div
    className={className}
    initial="hidden"
    animate="visible"
    variants={variants}
  >
    {children}
  </motion.div>
)

// Animated card component
export const AnimatedCard = ({ children, className = '', variants = cardVariants, whileHover = true }) => (
  <motion.div
    className={className}
    variants={variants}
    whileHover={whileHover ? 'hover' : undefined}
  >
    {children}
  </motion.div>
)

// Animated list item
export const AnimatedListItem = ({ children, className = '', index = 0 }) => (
  <motion.li
    className={className}
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay: index * 0.1 }}
  >
    {children}
  </motion.li>
)

// Stagger children animation
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Icon hover animations
export const iconHover = {
  hover: {
    rotate: [0, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: 'easeInOut',
    },
  },
}

export const iconBounce = {
  hover: {
    y: [-5, 0, -5],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

// Button press animation
export const buttonPress = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.05 },
}

// Progress bar animation
export const progressAnimation = {
  initial: { width: 0 },
  animate: { width: '100%' },
  transition: {
    duration: 1.5,
    ease: 'easeOut',
  },
}
