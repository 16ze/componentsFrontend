import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  Platform,
  Vibration,
} from "react-native";
import { motion } from "framer-motion";

// Types pour les actions
export interface SwipeAction {
  type:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "info"
    | "custom";
  text?: string;
  icon?: React.ReactNode;
  onPress: () => void;
  backgroundColor?: string;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  threshold?: number; // Seuil de déclenchement en % de la largeur
}

interface SwipeToActionProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  actionWidth?: number;
  enabled?: boolean;
  friction?: number; // Résistance au glissement
  containerStyle?: ViewStyle;
  disableHapticFeedback?: boolean;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  resetAfterAction?: boolean;
  maxSwipeDistance?: number | "full";
}

// Couleurs par défaut pour les types d'actions
const ACTION_COLORS = {
  primary: { bg: "#007AFF", fg: "#FFFFFF" },
  secondary: { bg: "#5856D6", fg: "#FFFFFF" },
  danger: { bg: "#FF3B30", fg: "#FFFFFF" },
  success: { bg: "#34C759", fg: "#FFFFFF" },
  warning: { bg: "#FF9500", fg: "#FFFFFF" },
  info: { bg: "#5AC8FA", fg: "#FFFFFF" },
  custom: { bg: "#E5E5EA", fg: "#000000" },
};

const SwipeToAction: React.FC<SwipeToActionProps> = ({
  children,
  leftActions = [],
  rightActions = [],
  actionWidth = 80,
  enabled = true,
  friction = 0.8,
  containerStyle,
  disableHapticFeedback = false,
  onSwipeStart,
  onSwipeEnd,
  onSwipeLeft,
  onSwipeRight,
  resetAfterAction = true,
  maxSwipeDistance = "full",
}) => {
  // Valeur d'animation pour la position X
  const translateX = useRef(new Animated.Value(0)).current;
  // Position actuelle pour les calculs
  const translateXValue = useRef(0);
  // État actif
  const isActive = useRef(false);
  // Largeur du composant
  const viewWidth = useRef(0);

  // Feedback haptique
  const triggerHapticFeedback = () => {
    if (disableHapticFeedback) return;

    if (Platform.OS === "ios") {
      // Sur iOS, utiliser une vibration légère
      Vibration.vibrate(10);
    } else {
      // Sur Android, vibration standard
      Vibration.vibrate(20);
    }
  };

  // Configurer le PanResponder pour gérer les gestes de balayage
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Activer uniquement pour les mouvements horizontaux significatifs
        return (
          enabled && Math.abs(gestureState.dx) > Math.abs(gestureState.dy * 2)
        );
      },
      onPanResponderGrant: () => {
        isActive.current = true;
        translateXValue.current = 0;

        if (onSwipeStart) {
          onSwipeStart();
        }
      },
      onPanResponderMove: (_, gestureState) => {
        let newTranslateX = gestureState.dx;

        // Appliquer une friction pour rendre le glissement plus résistant
        if (newTranslateX > 0) {
          // Glissement vers la droite
          if (leftActions.length === 0) {
            // Si pas d'actions à gauche, limiter fortement
            newTranslateX = Math.min(20, newTranslateX);
          } else {
            // Calculer la distance max pour les actions de gauche
            const maxLeftDistance =
              maxSwipeDistance === "full"
                ? leftActions.length * actionWidth
                : Math.min(
                    leftActions.length * actionWidth,
                    maxSwipeDistance as number
                  );

            // Appliquer la friction pour ralentir le mouvement au-delà du seuil
            if (newTranslateX > maxLeftDistance) {
              const excess = newTranslateX - maxLeftDistance;
              newTranslateX = maxLeftDistance + excess * friction;
            }
          }
        } else {
          // Glissement vers la gauche
          if (rightActions.length === 0) {
            // Si pas d'actions à droite, limiter fortement
            newTranslateX = Math.max(-20, newTranslateX);
          } else {
            // Calculer la distance max pour les actions de droite
            const maxRightDistance =
              maxSwipeDistance === "full"
                ? -rightActions.length * actionWidth
                : Math.max(
                    -rightActions.length * actionWidth,
                    -(maxSwipeDistance as number)
                  );

            // Appliquer la friction pour ralentir le mouvement au-delà du seuil
            if (newTranslateX < maxRightDistance) {
              const excess = newTranslateX - maxRightDistance;
              newTranslateX = maxRightDistance + excess * friction;
            }
          }
        }

        translateX.setValue(newTranslateX);
        translateXValue.current = newTranslateX;
      },
      onPanResponderRelease: (_, gestureState) => {
        isActive.current = false;

        // Déterminer l'action à effectuer
        const { dx, vx } = gestureState;

        // Seuil d'activation pour chaque action (par défaut 50% de la largeur de l'action)
        const activeLeftActions = leftActions.filter(
          (_, index) => dx > (index + 0.5) * actionWidth
        );
        const activeRightActions = rightActions.filter(
          (_, index) => -dx > (index + 0.5) * actionWidth
        );

        // Vérifier si une action peut être déclenchée
        if (activeLeftActions.length > 0) {
          // Déclencher l'action la plus à droite (dernière atteinte)
          const actionToTrigger =
            activeLeftActions[activeLeftActions.length - 1];

          // Feedback haptique
          triggerHapticFeedback();

          // Exécuter l'action
          actionToTrigger.onPress();

          if (onSwipeRight) {
            onSwipeRight();
          }

          // Réinitialiser après l'action si requis
          if (resetAfterAction) {
            resetPosition();
          } else {
            // Sinon, laisser en position ouverte
            snapToLeftActions(activeLeftActions.length);
          }
        } else if (activeRightActions.length > 0) {
          // Déclencher l'action la plus à gauche (dernière atteinte)
          const actionToTrigger =
            activeRightActions[activeRightActions.length - 1];

          // Feedback haptique
          triggerHapticFeedback();

          // Exécuter l'action
          actionToTrigger.onPress();

          if (onSwipeLeft) {
            onSwipeLeft();
          }

          // Réinitialiser après l'action si requis
          if (resetAfterAction) {
            resetPosition();
          } else {
            // Sinon, laisser en position ouverte
            snapToRightActions(activeRightActions.length);
          }
        } else {
          // Si pas d'action déclenchée, réinitialiser la position
          // avec une vélocité pour snap back plus naturel
          const velocity = vx * 200; // Ajuster la force du snap
          if (Math.abs(dx) > 20) {
            // Petit seuil pour éviter snap inutile
            if (dx > 0 && leftActions.length > 0 && Math.abs(velocity) > 0.5) {
              // Snap vers le premier groupe d'actions de gauche
              snapToLeftActions(1);
            } else if (
              dx < 0 &&
              rightActions.length > 0 &&
              Math.abs(velocity) > 0.5
            ) {
              // Snap vers le premier groupe d'actions de droite
              snapToRightActions(1);
            } else {
              // Retour à la position initiale
              resetPosition();
            }
          } else {
            resetPosition();
          }
        }

        if (onSwipeEnd) {
          onSwipeEnd();
        }
      },
    })
  ).current;

  // Réinitialiser la position
  const resetPosition = () => {
    Animated.spring(translateX, {
      toValue: 0,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Snap vers les actions de gauche
  const snapToLeftActions = (count: number) => {
    Animated.spring(translateX, {
      toValue: count * actionWidth,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Snap vers les actions de droite
  const snapToRightActions = (count: number) => {
    Animated.spring(translateX, {
      toValue: -count * actionWidth,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Méthode pour fermer (reset) depuis l'extérieur
  const close = () => {
    resetPosition();
  };

  // Rendu des actions de gauche
  const renderLeftActions = () => {
    if (!leftActions || leftActions.length === 0) return null;

    return (
      <View style={[styles.actionsContainer, styles.leftActionsContainer]}>
        {leftActions.map((action, index) => {
          const {
            type = "primary",
            text,
            icon,
            backgroundColor,
            color,
            style,
            textStyle,
          } = action;

          // Styles par défaut pour ce type d'action
          const defaultBg = backgroundColor || ACTION_COLORS[type].bg;
          const defaultColor = color || ACTION_COLORS[type].fg;

          return (
            <Animated.View
              key={`left-${index}`}
              style={[
                styles.actionButton,
                {
                  backgroundColor: defaultBg,
                  width: actionWidth,
                  // Décaler les actions en fonction de la position du swipe
                  opacity: translateX.interpolate({
                    inputRange: [
                      0,
                      (index + 0.5) * actionWidth,
                      (index + 1) * actionWidth,
                    ],
                    outputRange: [0, 0.5, 1],
                    extrapolate: "clamp",
                  }),
                  transform: [
                    {
                      translateX: translateX.interpolate({
                        inputRange: [0, (index + 1) * actionWidth],
                        outputRange: [-index * actionWidth, 0],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                },
                style,
              ]}
            >
              <TouchableOpacity
                style={styles.actionContent}
                onPress={() => {
                  action.onPress();
                  if (resetAfterAction) resetPosition();
                  triggerHapticFeedback();
                }}
              >
                {icon && <View style={styles.actionIcon}>{icon}</View>}
                {text && (
                  <Text
                    style={[
                      styles.actionText,
                      { color: defaultColor },
                      textStyle,
                    ]}
                  >
                    {text}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  // Rendu des actions de droite
  const renderRightActions = () => {
    if (!rightActions || rightActions.length === 0) return null;

    return (
      <View style={[styles.actionsContainer, styles.rightActionsContainer]}>
        {rightActions.map((action, index) => {
          const {
            type = "primary",
            text,
            icon,
            backgroundColor,
            color,
            style,
            textStyle,
          } = action;

          // Styles par défaut pour ce type d'action
          const defaultBg = backgroundColor || ACTION_COLORS[type].bg;
          const defaultColor = color || ACTION_COLORS[type].fg;

          return (
            <Animated.View
              key={`right-${index}`}
              style={[
                styles.actionButton,
                {
                  backgroundColor: defaultBg,
                  width: actionWidth,
                  // Décaler les actions en fonction de la position du swipe
                  opacity: translateX.interpolate({
                    inputRange: [
                      -(index + 1) * actionWidth,
                      -(index + 0.5) * actionWidth,
                      0,
                    ],
                    outputRange: [1, 0.5, 0],
                    extrapolate: "clamp",
                  }),
                  transform: [
                    {
                      translateX: translateX.interpolate({
                        inputRange: [-(index + 1) * actionWidth, 0],
                        outputRange: [0, index * actionWidth],
                        extrapolate: "clamp",
                      }),
                    },
                  ],
                },
                style,
              ]}
            >
              <TouchableOpacity
                style={styles.actionContent}
                onPress={() => {
                  action.onPress();
                  if (resetAfterAction) resetPosition();
                  triggerHapticFeedback();
                }}
              >
                {icon && <View style={styles.actionIcon}>{icon}</View>}
                {text && (
                  <Text
                    style={[
                      styles.actionText,
                      { color: defaultColor },
                      textStyle,
                    ]}
                  >
                    {text}
                  </Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  // Adaptation pour le Web avec Framer Motion si nécessaire
  if (Platform.OS === "web") {
    // Calculs des valeurs pour Framer Motion
    const maxLeftDistance = leftActions.length * actionWidth;
    const maxRightDistance = -rightActions.length * actionWidth;

    // Logique de drag sur le web
    const handleDragEnd = (info: any) => {
      const { offset, velocity } = info;
      const dx = offset.x;

      // Mêmes calculs que dans PanResponder mais adaptés à Framer Motion
      const activeLeftActions = leftActions.filter(
        (_, index) => dx > (index + 0.5) * actionWidth
      );
      const activeRightActions = rightActions.filter(
        (_, index) => -dx > (index + 0.5) * actionWidth
      );

      if (activeLeftActions.length > 0) {
        // Déclencher l'action la plus à droite
        const actionToTrigger = activeLeftActions[activeLeftActions.length - 1];
        actionToTrigger.onPress();

        if (onSwipeRight) onSwipeRight();
      } else if (activeRightActions.length > 0) {
        // Déclencher l'action la plus à gauche
        const actionToTrigger =
          activeRightActions[activeRightActions.length - 1];
        actionToTrigger.onPress();

        if (onSwipeLeft) onSwipeLeft();
      }

      if (onSwipeEnd) onSwipeEnd();
    };

    // Rendu avec Framer Motion sur le web
    return (
      <div style={{ position: "relative", ...(containerStyle as any) }}>
        {renderLeftActions()}

        <motion.div
          drag="x"
          dragConstraints={{ left: maxRightDistance, right: maxLeftDistance }}
          dragElastic={friction}
          onDragStart={() => onSwipeStart && onSwipeStart()}
          onDragEnd={handleDragEnd}
          style={{
            width: "100%",
            position: "relative",
            zIndex: 1,
            touchAction: "none",
          }}
        >
          {children}
        </motion.div>

        {renderRightActions()}
      </div>
    );
  }

  // Rendu pour les plateformes natives
  return (
    <View
      style={[styles.container, containerStyle]}
      onLayout={(event) => {
        viewWidth.current = event.nativeEvent.layout.width;
      }}
    >
      {renderLeftActions()}

      <Animated.View
        style={[
          styles.contentContainer,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>

      {renderRightActions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    position: "relative",
  },
  contentContainer: {
    zIndex: 1,
    backgroundColor: "white", // Fond par défaut du contenu
  },
  actionsContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    flexDirection: "row",
  },
  leftActionsContainer: {
    left: 0,
  },
  rightActionsContainer: {
    right: 0,
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  actionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  actionText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  actionIcon: {
    marginBottom: 5,
  },
});

export default SwipeToAction;
