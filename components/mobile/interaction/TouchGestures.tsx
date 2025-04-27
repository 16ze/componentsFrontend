import React, { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableWithoutFeedback,
  Animated,
  StyleSheet,
  Platform,
  GestureResponderEvent,
  ViewStyle,
  Vibration,
} from "react-native";
import { motion } from "framer-motion";

// Types pour les gestes de toucher
interface BaseTouchProps {
  children: React.ReactNode;
  style?: ViewStyle;
  activeOpacity?: number;
  disabled?: boolean;
  disableAnimation?: boolean;
  disableHapticFeedback?: boolean;
}

// Props pour le double tap
interface DoubleTapProps extends BaseTouchProps {
  onDoubleTap: (event: GestureResponderEvent) => void;
  onSingleTap?: (event: GestureResponderEvent) => void;
  delay?: number;
  onTap?: (event: GestureResponderEvent) => void;
}

// Props pour le long press
interface LongPressProps extends BaseTouchProps {
  onLongPress: (event: GestureResponderEvent) => void;
  onPressOut?: (event: GestureResponderEvent) => void;
  onPressIn?: (event: GestureResponderEvent) => void;
  delayLongPress?: number;
  disableFeedback?: boolean;
  threshold?: number;
  longPressIndicator?: React.ReactNode;
  activationIndicatorScale?: number;
  onPress?: (event: GestureResponderEvent) => void;
}

// Composant DoubleTap
export const DoubleTap: React.FC<DoubleTapProps> = ({
  children,
  onDoubleTap,
  onSingleTap,
  onTap,
  delay = 300,
  style,
  activeOpacity = 0.7,
  disabled = false,
  disableAnimation = false,
  disableHapticFeedback = false,
}) => {
  // Refs et state pour le double tap
  const lastTap = useRef<number | null>(null);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const opacity = useRef(new Animated.Value(1)).current;

  // Animation d'appui
  const animateTap = () => {
    if (disableAnimation) return;

    Animated.sequence([
      Animated.timing(opacity, {
        toValue: activeOpacity,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Feedback haptique
  const triggerHaptic = () => {
    if (disableHapticFeedback) return;

    if (Platform.OS === "ios") {
      Vibration.vibrate(10);
    } else {
      Vibration.vibrate(20);
    }
  };

  // Gestionnaire d'appui
  const handlePress = (event: GestureResponderEvent) => {
    if (disabled) return;

    // Animation
    animateTap();

    // Notifier l'appui simple tout le temps
    if (onTap) {
      onTap(event);
    }

    const now = Date.now();

    if (lastTap.current && now - lastTap.current < delay) {
      // C'est un double tap
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }

      lastTap.current = null;

      // Feedback haptique
      triggerHaptic();

      // Appeler le callback
      onDoubleTap(event);
    } else {
      // Premier appui ou délai écoulé
      lastTap.current = now;

      // Configurer le timer pour l'appui simple
      if (onSingleTap) {
        if (timer.current) {
          clearTimeout(timer.current);
        }

        timer.current = setTimeout(() => {
          if (lastTap.current) {
            onSingleTap(event);
            lastTap.current = null;
          }
          timer.current = null;
        }, delay);
      }
    }
  };

  // Nettoyer le timer lors du démontage
  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  // Adaptation pour le web
  if (Platform.OS === "web") {
    return (
      <motion.div
        style={{
          cursor: disabled ? "default" : "pointer",
          ...(style as any),
        }}
        whileTap={!disableAnimation ? { scale: 0.95 } : undefined}
        onClick={(e: any) => {
          if (disabled) return;

          const now = Date.now();

          if (lastTap.current && now - lastTap.current < delay) {
            // Double tap
            if (timer.current) {
              clearTimeout(timer.current);
              timer.current = null;
            }

            lastTap.current = null;
            onDoubleTap(e);
          } else {
            // Premier appui ou délai écoulé
            lastTap.current = now;

            if (onSingleTap) {
              if (timer.current) {
                clearTimeout(timer.current);
              }

              timer.current = setTimeout(() => {
                if (lastTap.current) {
                  onSingleTap(e);
                  lastTap.current = null;
                }
                timer.current = null;
              }, delay);
            }
          }

          if (onTap) {
            onTap(e);
          }
        }}
      >
        {children}
      </motion.div>
    );
  }

  // Rendu pour mobile
  return (
    <TouchableWithoutFeedback onPress={handlePress} disabled={disabled}>
      <Animated.View style={[style, { opacity }]}>{children}</Animated.View>
    </TouchableWithoutFeedback>
  );
};

// Composant LongPress
export const LongPress: React.FC<LongPressProps> = ({
  children,
  onLongPress,
  onPressOut,
  onPressIn,
  onPress,
  delayLongPress = 500,
  style,
  activeOpacity = 0.7,
  disabled = false,
  disableAnimation = false,
  disableFeedback = false,
  disableHapticFeedback = false,
  threshold = 5,
  longPressIndicator,
  activationIndicatorScale = 1.2,
}) => {
  // Refs et state
  const [pressing, setPressing] = useState(false);
  const [longPressActive, setLongPressActive] = useState(false);
  const pressStartTime = useRef(0);
  const pressStartPosition = useRef({ x: 0, y: 0 });
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const indicatorScale = useRef(new Animated.Value(0)).current;
  const indicatorOpacity = useRef(new Animated.Value(0)).current;

  // Animation de pression
  const animatePress = (pressed: boolean) => {
    if (disableAnimation) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: pressed ? activeOpacity : 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: pressed ? 0.97 : 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animation de l'indicateur de pression longue
  const animateLongPressIndicator = (show: boolean) => {
    if (disableAnimation || !longPressIndicator) return;

    Animated.parallel([
      Animated.timing(indicatorScale, {
        toValue: show ? activationIndicatorScale : 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(indicatorOpacity, {
        toValue: show ? 0.8 : 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Feedback haptique
  const triggerHaptic = () => {
    if (disableHapticFeedback) return;

    if (Platform.OS === "ios") {
      Vibration.vibrate(15);
    } else {
      Vibration.vibrate(25);
    }
  };

  // Débuter la pression
  const handlePressIn = (event: GestureResponderEvent) => {
    if (disabled) return;

    // Mémoriser les coordonnées initiales
    pressStartPosition.current = {
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    };

    pressStartTime.current = Date.now();
    setPressing(true);

    // Animation
    animatePress(true);

    // Callback
    if (onPressIn) {
      onPressIn(event);
    }

    // Déclencher le minuteur pour la pression longue
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    longPressTimer.current = setTimeout(() => {
      setLongPressActive(true);
      triggerHaptic();

      // Animation de l'indicateur
      animateLongPressIndicator(true);

      if (onLongPress) {
        onLongPress(event);
      }
    }, delayLongPress);
  };

  // Mouvement pendant la pression
  const handlePressMove = (event: GestureResponderEvent) => {
    if (!pressing || disabled) return;

    // Calculer la distance
    const currentX = event.nativeEvent.pageX;
    const currentY = event.nativeEvent.pageY;
    const startX = pressStartPosition.current.x;
    const startY = pressStartPosition.current.y;

    const distance = Math.sqrt(
      Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
    );

    // Si dépassement du seuil, annuler la pression longue
    if (distance > threshold && longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Fin de la pression
  const handlePressOut = (event: GestureResponderEvent) => {
    if (disabled) return;

    // Annuler le timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Calculer la durée de la pression
    const pressDuration = Date.now() - pressStartTime.current;

    // Déterminer si c'est un appui simple (et pas long press)
    if (!longPressActive && pressDuration < delayLongPress && onPress) {
      onPress(event);
    }

    // Réinitialiser l'état
    setPressing(false);
    setLongPressActive(false);

    // Animations
    animatePress(false);
    animateLongPressIndicator(false);

    // Callback
    if (onPressOut) {
      onPressOut(event);
    }
  };

  // Nettoyer le timer lors du démontage
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Style pour l'animation
  const animatedStyle = {
    transform: [{ scale }],
    opacity,
  };

  // Style pour l'indicateur
  const indicatorAnimatedStyle = {
    transform: [{ scale: indicatorScale }],
    opacity: indicatorOpacity,
  };

  // Rendu pour le web
  if (Platform.OS === "web") {
    return (
      <motion.div
        style={{
          position: "relative",
          cursor: disabled ? "default" : "pointer",
          ...(style as any),
        }}
        whileTap={
          !disableAnimation
            ? { scale: 0.97, opacity: activeOpacity }
            : undefined
        }
        onMouseDown={(e: any) => {
          if (disabled) return;

          pressStartTime.current = Date.now();
          pressStartPosition.current = { x: e.clientX, y: e.clientY };
          setPressing(true);

          if (onPressIn) {
            onPressIn(e as any);
          }

          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
          }

          longPressTimer.current = setTimeout(() => {
            setLongPressActive(true);

            if (onLongPress) {
              onLongPress(e as any);
            }
          }, delayLongPress);
        }}
        onMouseMove={(e: any) => {
          if (!pressing || disabled) return;

          const distance = Math.sqrt(
            Math.pow(e.clientX - pressStartPosition.current.x, 2) +
              Math.pow(e.clientY - pressStartPosition.current.y, 2)
          );

          if (distance > threshold && longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }}
        onMouseUp={(e: any) => {
          if (disabled) return;

          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }

          const pressDuration = Date.now() - pressStartTime.current;

          if (!longPressActive && pressDuration < delayLongPress && onPress) {
            onPress(e as any);
          }

          setPressing(false);
          setLongPressActive(false);

          if (onPressOut) {
            onPressOut(e as any);
          }
        }}
      >
        {children}

        {longPressIndicator && (
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: longPressActive ? 0.8 : 0,
              scale: longPressActive ? activationIndicatorScale : 0,
            }}
            transition={{ duration: 0.15 }}
          >
            {longPressIndicator}
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Rendu pour mobile
  return (
    <View
      style={[styles.container, style]}
      onTouchStart={handlePressIn}
      onTouchMove={handlePressMove}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <Animated.View
        style={[styles.content, disableAnimation ? undefined : animatedStyle]}
      >
        {children}
      </Animated.View>

      {longPressIndicator && (
        <Animated.View
          style={[
            styles.indicatorContainer,
            disableAnimation ? undefined : indicatorAnimatedStyle,
          ]}
          pointerEvents="none"
        >
          {longPressIndicator}
        </Animated.View>
      )}
    </View>
  );
};

// Combinaison des deux gestures
interface MultiTouchProps extends DoubleTapProps, LongPressProps {
  onTripleTap?: (event: GestureResponderEvent) => void;
  tripleTapDelay?: number;
}

// Composant combinant double tap et long press
export const MultiTouch: React.FC<MultiTouchProps> = (props) => {
  const {
    children,
    onDoubleTap,
    onLongPress,
    onSingleTap,
    onPress,
    onPressIn,
    onPressOut,
    onTripleTap,
    delay = 300,
    delayLongPress = 500,
    tripleTapDelay = 300,
    style,
    activeOpacity = 0.7,
    disabled = false,
    disableAnimation = false,
    disableFeedback = false,
    disableHapticFeedback = false,
    ...restProps
  } = props;

  // Refs pour compter les taps
  const tapCount = useRef(0);
  const tapTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const pressStartTime = useRef(0);
  const pressStartPosition = useRef({ x: 0, y: 0 });
  const isLongPress = useRef(false);

  // Animation
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Feedback haptique
  const triggerHaptic = () => {
    if (disableHapticFeedback) return;

    if (Platform.OS === "ios") {
      Vibration.vibrate(10);
    } else {
      Vibration.vibrate(20);
    }
  };

  // Animation de pression
  const animatePress = (pressed: boolean) => {
    if (disableAnimation) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: pressed ? activeOpacity : 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: pressed ? 0.97 : 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Gestion du press in
  const handlePressIn = (event: GestureResponderEvent) => {
    if (disabled) return;

    // Enregistrer le début de la pression
    pressStartTime.current = Date.now();
    pressStartPosition.current = {
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    };

    // Animation
    animatePress(true);

    // Callback
    if (onPressIn) {
      onPressIn(event);
    }

    // Timer pour le long press
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    isLongPress.current = false;

    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        isLongPress.current = true;
        triggerHaptic();
        onLongPress(event);
      }, delayLongPress);
    }
  };

  // Gestion du press out
  const handlePressOut = (event: GestureResponderEvent) => {
    if (disabled) return;

    // Annuler le timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    // Animation
    animatePress(false);

    // Callback
    if (onPressOut) {
      onPressOut(event);
    }

    // Si c'était un long press, on ne compte pas le tap
    if (isLongPress.current) {
      return;
    }

    // Incrémenter le compteur de taps
    tapCount.current += 1;

    // Si c'est le premier tap, démarrer le timer
    if (tapCount.current === 1) {
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }

      tapTimer.current = setTimeout(() => {
        if (tapCount.current === 1 && onSingleTap) {
          onSingleTap(event);
        }
        tapCount.current = 0;
        tapTimer.current = null;
      }, delay);
    }
    // Si c'est le deuxième tap
    else if (tapCount.current === 2) {
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }

      // Si on attend un triple tap, on configure un timer
      if (onTripleTap) {
        tapTimer.current = setTimeout(() => {
          if (tapCount.current === 2 && onDoubleTap) {
            onDoubleTap(event);
          }
          tapCount.current = 0;
          tapTimer.current = null;
        }, tripleTapDelay);
      }
      // Sinon on déclenche directement le double tap
      else {
        if (onDoubleTap) {
          triggerHaptic();
          onDoubleTap(event);
        }
        tapCount.current = 0;
        tapTimer.current = null;
      }
    }
    // Si c'est le troisième tap
    else if (tapCount.current === 3) {
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
      }

      if (onTripleTap) {
        triggerHaptic();
        onTripleTap(event);
      }
      tapCount.current = 0;
    }

    // Appeler onPress si ce n'est pas un long press
    if (onPress && !isLongPress.current) {
      onPress(event);
    }
  };

  // Mouvement pendant la pression
  const handlePressMove = (event: GestureResponderEvent) => {
    if (disabled) return;

    // Calculer la distance
    const currentX = event.nativeEvent.pageX;
    const currentY = event.nativeEvent.pageY;
    const startX = pressStartPosition.current.x;
    const startY = pressStartPosition.current.y;

    const distance = Math.sqrt(
      Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
    );

    // Si dépassement du seuil, annuler la pression longue et le tap
    if (distance > 10) {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
        tapTimer.current = null;
        tapCount.current = 0;
      }
    }
  };

  // Nettoyer les timers lors du démontage
  useEffect(() => {
    return () => {
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Style pour l'animation
  const animatedStyle = {
    transform: [{ scale }],
    opacity,
  };

  // Pour le web
  if (Platform.OS === "web") {
    return (
      <motion.div
        style={{
          position: "relative",
          cursor: disabled ? "default" : "pointer",
          ...(style as any),
        }}
        whileTap={
          !disableAnimation
            ? { scale: 0.97, opacity: activeOpacity }
            : undefined
        }
        onMouseDown={(e: any) => handlePressIn(e as any)}
        onMouseUp={(e: any) => handlePressOut(e as any)}
        onMouseMove={(e: any) => handlePressMove(e as any)}
        onMouseLeave={(e: any) => {
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
          animatePress(false);
        }}
      >
        {children}
      </motion.div>
    );
  }

  // Pour mobile
  return (
    <View
      style={[styles.container, style]}
      onTouchStart={handlePressIn}
      onTouchMove={handlePressMove}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <Animated.View
        style={[styles.content, disableAnimation ? undefined : animatedStyle]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  content: {
    width: "100%",
    height: "100%",
  },
  indicatorContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});

// Exporter les composants
export default {
  DoubleTap,
  LongPress,
  MultiTouch,
};
