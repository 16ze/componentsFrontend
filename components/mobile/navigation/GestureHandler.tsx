import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "next/navigation";

const { width, height } = Dimensions.get("window");

// Configuration des gestes
export interface GestureConfig {
  // Distance minimale requise pour que le geste soit considéré valide
  minDistance?: number;
  // Vitesse minimale pour que le geste soit considéré comme un swipe
  minVelocity?: number;
  // Direction de balayage pour retour (left to right ou right to left)
  backDirection?: "left-to-right" | "right-to-left";
  // Callback personnalisé pour le geste de retour, si non fourni, utilise router.back()
  onBackGesture?: () => void;
  // Callback personnalisé pour le geste vers l'avant
  onForwardGesture?: () => void;
  // Callback pour tout geste reconnu avec informations sur le geste
  onGestureDetected?: (gestureInfo: {
    direction: string;
    distance: number;
    velocity: number;
  }) => void;
  // Zone active pour les gestes de bord (en pixels ou en pourcentage de l'écran)
  edgeHitWidth?: number;
  // Activer ou désactiver les gestes
  enabled?: boolean;
  // Activer l'animation pendant le geste
  enableAnimation?: boolean;
}

interface GestureHandlerProps {
  children: React.ReactNode;
  config?: GestureConfig;
  style?: any;
}

// Composant principal
const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  config = {},
  style,
}) => {
  const {
    minDistance = 60,
    minVelocity = 0.3,
    backDirection = "left-to-right",
    onBackGesture,
    onForwardGesture,
    onGestureDetected,
    edgeHitWidth = 30,
    enabled = true,
    enableAnimation = true,
  } = config;

  const router = useRouter();
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  // Réinitialiser l'animation
  const resetAnimation = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Configuration du PanResponder
  const panResponder = useRef(
    PanResponder.create({
      // Ne démarrer la reconnaissance de geste que lorsque enabled est true
      onStartShouldSetPanResponder: (_, gestureState) => {
        if (!enabled) return false;

        // Pour les gestes de bord, vérifier si le geste commence à la bordure
        const { dx, dy, moveX, moveY } = gestureState;

        // Si le geste commence à la bordure gauche
        if (backDirection === "left-to-right" && moveX < edgeHitWidth) {
          return true;
        }

        // Si le geste commence à la bordure droite
        if (backDirection === "right-to-left" && moveX > width - edgeHitWidth) {
          return true;
        }

        return false;
      },

      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!enabled) return false;

        // Détecter des mouvements significatifs
        const { dx, dy, moveX } = gestureState;
        const draggedLeft = dx < -minDistance;
        const draggedRight = dx > minDistance;

        // Permettre les gestes horizontaux plus que verticaux
        return (draggedLeft || draggedRight) && Math.abs(dx) > Math.abs(dy);
      },

      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState;

        if (!enableAnimation) return;

        // Animer en fonction de la direction
        if (backDirection === "left-to-right") {
          // Limiter le déplacement à la largeur de l'écran
          const newX = Math.max(0, Math.min(dx, width));
          translateX.setValue(newX);
          opacity.setValue(1 - newX / (width * 2));
        } else {
          // Pour right-to-left
          const newX = Math.min(0, Math.max(dx, -width));
          translateX.setValue(newX);
          opacity.setValue(1 + newX / (width * 2));
        }
      },

      onPanResponderRelease: (_, gestureState) => {
        const { dx, vx } = gestureState;
        const velocity = Math.abs(vx);

        // Notifier l'application du geste détecté
        if (onGestureDetected) {
          onGestureDetected({
            direction: dx > 0 ? "right" : "left",
            distance: Math.abs(dx),
            velocity,
          });
        }

        // Vérifier si le geste est suffisant pour une action
        const isValidGesture =
          Math.abs(dx) > minDistance || velocity > minVelocity;

        if (!isValidGesture) {
          resetAnimation();
          return;
        }

        // Déterminer le type de geste (back ou forward)
        const isBackGesture =
          (backDirection === "left-to-right" && dx > 0) ||
          (backDirection === "right-to-left" && dx < 0);

        const isForwardGesture =
          (backDirection === "left-to-right" && dx < 0) ||
          (backDirection === "right-to-left" && dx > 0);

        // Exécuter l'action appropriée
        if (isBackGesture) {
          if (onBackGesture) {
            onBackGesture();
          } else {
            router.back();
          }
        } else if (isForwardGesture && onForwardGesture) {
          onForwardGesture();
        }

        // Réinitialiser l'animation après l'action
        resetAnimation();
      },
    })
  ).current;

  // Effet pour désactiver le débordement du body sur le web
  useEffect(() => {
    if (Platform.OS === "web") {
      // Empêcher le scroll du corps pendant l'utilisation des gestes
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "";
      };
    }
  }, []);

  // Style pour l'animation
  const animatedStyle = {
    transform: [{ translateX }],
    opacity,
  };

  // Rendu du composant
  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[styles.content, enableAnimation ? animatedStyle : undefined]}
        {...(enabled ? panResponder.panHandlers : {})}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default GestureHandler;
