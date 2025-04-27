import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Platform,
  ViewStyle,
  Easing,
} from "react-native";
import { motion } from "framer-motion";

const { width, height } = Dimensions.get("window");

// Types d'animation disponibles
export type TransitionType =
  | "fade"
  | "slide-horizontal"
  | "slide-vertical"
  | "scale"
  | "flip-x"
  | "flip-y"
  | "push-left"
  | "push-right"
  | "push-up"
  | "push-down"
  | "none";

interface TransitionConfig {
  type?: TransitionType;
  duration?: number;
  easing?: Animated.EasingFunction;
  delay?: number;
  initialDelay?: number; // Délai avant la première animation
}

interface ScreenTransitionProps {
  children: React.ReactNode;
  isActive?: boolean;
  style?: ViewStyle;
  config?: TransitionConfig;
  // Key pour forcer une ré-animation lorsque la clé change
  transitionKey?: string | number;
  // Callback lorsque la transition d'entrée est terminée
  onEnterComplete?: () => void;
  // Callback lorsque la transition de sortie est terminée
  onExitComplete?: () => void;
}

/**
 * Composant pour créer des transitions fluides entre écrans ou vues
 */
const ScreenTransition: React.FC<ScreenTransitionProps> = ({
  children,
  isActive = true,
  style,
  config = {},
  transitionKey,
  onEnterComplete,
  onExitComplete,
}) => {
  const {
    type = "fade",
    duration = 300,
    easing = Easing.out(Easing.ease),
    delay = 0,
    initialDelay = 0,
  } = config;

  // Valeurs d'animation
  const opacity = useRef(new Animated.Value(isActive ? 0 : 1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(isActive ? 0.8 : 1)).current;
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;

  // État pour suivre si la transition initiale a été exécutée
  const [hasAnimatedInitially, setHasAnimatedInitially] = useState(false);

  // Fonction pour obtenir les styles d'animation en fonction du type
  const getAnimationConfig = (
    entering: boolean
  ): Animated.CompositeAnimation[] => {
    const animations: Animated.CompositeAnimation[] = [];
    const transitionDuration = entering ? duration : duration * 0.8;
    const baseConfig = {
      toValue: entering ? 1 : 0,
      duration: transitionDuration,
      easing,
      useNativeDriver: true,
      delay: entering ? (hasAnimatedInitially ? delay : initialDelay) : 0,
    };

    // Ajouter des animations en fonction du type
    if (type === "fade" || type.includes("push")) {
      animations.push(Animated.timing(opacity, baseConfig));
    }

    if (
      type === "slide-horizontal" ||
      type === "push-left" ||
      type === "push-right"
    ) {
      const direction = type === "push-left" ? -1 : 1;
      animations.push(
        Animated.timing(translateX, {
          ...baseConfig,
          toValue: entering ? 0 : direction * width,
        })
      );
    }

    if (
      type === "slide-vertical" ||
      type === "push-up" ||
      type === "push-down"
    ) {
      const direction = type === "push-up" ? -1 : 1;
      animations.push(
        Animated.timing(translateY, {
          ...baseConfig,
          toValue: entering ? 0 : direction * height,
        })
      );
    }

    if (type === "scale") {
      animations.push(
        Animated.timing(scale, {
          ...baseConfig,
          toValue: entering ? 1 : 0.8,
        })
      );
    }

    if (type === "flip-x") {
      animations.push(
        Animated.timing(rotateX, {
          ...baseConfig,
          toValue: entering ? 0 : 1,
        })
      );
    }

    if (type === "flip-y") {
      animations.push(
        Animated.timing(rotateY, {
          ...baseConfig,
          toValue: entering ? 0 : 1,
        })
      );
    }

    return animations;
  };

  // Configurer les valeurs initiales des animations
  useEffect(() => {
    if (type === "fade") {
      opacity.setValue(isActive ? 0 : 1);
    } else if (type === "slide-horizontal") {
      translateX.setValue(isActive ? width : 0);
    } else if (type === "slide-vertical") {
      translateY.setValue(isActive ? height : 0);
    } else if (type === "scale") {
      scale.setValue(isActive ? 0.8 : 1);
    } else if (type === "flip-x") {
      rotateX.setValue(isActive ? 1 : 0);
    } else if (type === "flip-y") {
      rotateY.setValue(isActive ? 1 : 0);
    } else if (type === "push-left") {
      translateX.setValue(isActive ? width : 0);
      opacity.setValue(isActive ? 0 : 1);
    } else if (type === "push-right") {
      translateX.setValue(isActive ? -width : 0);
      opacity.setValue(isActive ? 0 : 1);
    } else if (type === "push-up") {
      translateY.setValue(isActive ? height : 0);
      opacity.setValue(isActive ? 0 : 1);
    } else if (type === "push-down") {
      translateY.setValue(isActive ? -height : 0);
      opacity.setValue(isActive ? 0 : 1);
    }
  }, [transitionKey, type]);

  // Démarrer l'animation lorsque isActive change
  useEffect(() => {
    const animations = getAnimationConfig(isActive);

    if (animations.length === 0) {
      // Pas d'animation à exécuter
      return;
    }

    // Exécuter toutes les animations en parallèle
    Animated.parallel(animations).start(({ finished }) => {
      if (finished) {
        if (isActive && onEnterComplete) {
          onEnterComplete();
        } else if (!isActive && onExitComplete) {
          onExitComplete();
        }

        if (!hasAnimatedInitially) {
          setHasAnimatedInitially(true);
        }
      }
    });
  }, [isActive, transitionKey]);

  // Construire les styles d'animation
  const getAnimatedStyle = () => {
    const animatedStyle: any = {};

    // Ajouter les transformations en fonction du type d'animation
    const transforms: any[] = [];

    if (
      type === "slide-horizontal" ||
      type.includes("push-left") ||
      type.includes("push-right")
    ) {
      transforms.push({ translateX });
    }

    if (
      type === "slide-vertical" ||
      type.includes("push-up") ||
      type.includes("push-down")
    ) {
      transforms.push({ translateY });
    }

    if (type === "scale") {
      transforms.push({ scale });
    }

    if (type === "flip-x") {
      transforms.push({
        rotateX: rotateX.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      });
    }

    if (type === "flip-y") {
      transforms.push({
        rotateY: rotateY.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "180deg"],
        }),
      });
    }

    if (transforms.length > 0) {
      animatedStyle.transform = transforms;
    }

    if (type === "fade" || type.includes("push")) {
      animatedStyle.opacity = opacity;
    }

    return animatedStyle;
  };

  // Logique pour Web vs React Native
  if (Platform.OS === "web") {
    // Mappings des options d'animation pour Framer Motion
    const framerVariants = {
      initial: {},
      animate: {},
      exit: {},
    };

    // Configuration des variantes en fonction du type d'animation
    if (type === "fade") {
      framerVariants.initial = { opacity: 0 };
      framerVariants.animate = { opacity: 1 };
      framerVariants.exit = { opacity: 0 };
    } else if (type === "slide-horizontal") {
      framerVariants.initial = { x: width, opacity: 0 };
      framerVariants.animate = { x: 0, opacity: 1 };
      framerVariants.exit = { x: -width, opacity: 0 };
    } else if (type === "slide-vertical") {
      framerVariants.initial = { y: height, opacity: 0 };
      framerVariants.animate = { y: 0, opacity: 1 };
      framerVariants.exit = { y: -height, opacity: 0 };
    } else if (type === "scale") {
      framerVariants.initial = { scale: 0.8, opacity: 0 };
      framerVariants.animate = { scale: 1, opacity: 1 };
      framerVariants.exit = { scale: 0.8, opacity: 0 };
    } else if (type === "flip-x") {
      framerVariants.initial = { rotateX: 90, opacity: 0 };
      framerVariants.animate = { rotateX: 0, opacity: 1 };
      framerVariants.exit = { rotateX: -90, opacity: 0 };
    } else if (type === "flip-y") {
      framerVariants.initial = { rotateY: 90, opacity: 0 };
      framerVariants.animate = { rotateY: 0, opacity: 1 };
      framerVariants.exit = { rotateY: -90, opacity: 0 };
    } else if (type === "push-left") {
      framerVariants.initial = { x: width, opacity: 0 };
      framerVariants.animate = { x: 0, opacity: 1 };
      framerVariants.exit = { x: -width, opacity: 0 };
    } else if (type === "push-right") {
      framerVariants.initial = { x: -width, opacity: 0 };
      framerVariants.animate = { x: 0, opacity: 1 };
      framerVariants.exit = { x: width, opacity: 0 };
    } else if (type === "push-up") {
      framerVariants.initial = { y: height, opacity: 0 };
      framerVariants.animate = { y: 0, opacity: 1 };
      framerVariants.exit = { y: -height, opacity: 0 };
    } else if (type === "push-down") {
      framerVariants.initial = { y: -height, opacity: 0 };
      framerVariants.animate = { y: 0, opacity: 1 };
      framerVariants.exit = { y: height, opacity: 0 };
    }

    // Configuration de la transition
    const transition = {
      duration: duration / 1000, // Convertir en secondes pour Framer
      ease: "easeOut",
      delay: (hasAnimatedInitially ? delay : initialDelay) / 1000,
    };

    return (
      <motion.div
        key={transitionKey}
        style={{ ...style }}
        initial="initial"
        animate={isActive ? "animate" : "exit"}
        exit="exit"
        variants={framerVariants}
        transition={transition}
        onAnimationComplete={() => {
          if (isActive && onEnterComplete) {
            onEnterComplete();
          } else if (!isActive && onExitComplete) {
            onExitComplete();
          }

          if (!hasAnimatedInitially) {
            setHasAnimatedInitially(true);
          }
        }}
      >
        {children}
      </motion.div>
    );
  }

  // Rendu pour React Native
  return (
    <Animated.View
      style={[
        styles.container,
        style,
        type !== "none" ? getAnimatedStyle() : undefined,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenTransition;
