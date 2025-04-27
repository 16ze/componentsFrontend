import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  Platform,
  ViewStyle,
  Vibration,
  LayoutChangeEvent,
} from "react-native";
import { motion } from "framer-motion";

interface DraggableProps {
  x?: number;
  y?: number;
  disabled?: boolean;
  onDragStart?: (event: any, gestureState: any) => void;
  onDragMove?: (event: any, gestureState: any) => void;
  onDragEnd?: (event: any, gestureState: any) => void;
  onDragRelease?: (event: any, gestureState: any, dropped: boolean) => void;
  bounds?: { top?: number; left?: number; right?: number; bottom?: number };
  snapTo?: { x: number; y: number }[];
  snapThreshold?: number;
  children: React.ReactNode;
  style?: ViewStyle;
  dragAreaStyle?: ViewStyle;
  initialPosition?: { x: number; y: number };
  enableHapticFeedback?: boolean;
  feedbackOnDragStart?: boolean;
  feedbackOnDragEnd?: boolean;
  feedbackOnSnap?: boolean;
  dragResistance?: number; // 0-1, 0 = no resistance, 1 = immovable
  dropTargets?: DropTarget[];
  animateOnMount?: boolean;
  mountAnimation?: {
    type?: "fade" | "scale" | "slide";
    duration?: number;
    delay?: number;
  };
  applyGravity?: boolean;
  gravityDelay?: number;
}

// Types pour les zones de drop
export interface DropTarget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onDrop?: (item: any) => void;
  snapOnDrop?: boolean;
}

const Draggable: React.FC<DraggableProps> = ({
  x = 0,
  y = 0,
  disabled = false,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDragRelease,
  bounds,
  snapTo,
  snapThreshold = 50,
  children,
  style,
  dragAreaStyle,
  initialPosition,
  enableHapticFeedback = true,
  feedbackOnDragStart = true,
  feedbackOnDragEnd = true,
  feedbackOnSnap = true,
  dragResistance = 0,
  dropTargets = [],
  animateOnMount = false,
  mountAnimation = { type: "fade", duration: 300, delay: 0 },
  applyGravity = false,
  gravityDelay = 500,
}) => {
  // États et refs pour le positionnement
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const pan = useRef(new Animated.ValueXY(initialPosition || { x, y })).current;
  const previousPosition = useRef({
    x: initialPosition?.x || x,
    y: initialPosition?.y || y,
  });
  const isCurrentlyActive = useRef(false);

  // Animation pour le feedback visuel
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(animateOnMount ? 0 : 1)).current;
  const lastDropTarget = useRef<DropTarget | null>(null);

  // Timer pour l'effet de gravité
  const gravityTimer = useRef<NodeJS.Timeout | null>(null);

  // Animation au montage
  useEffect(() => {
    if (animateOnMount) {
      const { type, duration, delay } = mountAnimation;

      if (type === "fade") {
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        }).start();
      } else if (type === "scale") {
        opacity.setValue(1);
        const initialScale = new Animated.Value(0.5);
        scale.setValue(0.5);

        Animated.timing(scale, {
          toValue: 1,
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        }).start();
      } else if (type === "slide") {
        opacity.setValue(1);
        const initialPos = new Animated.ValueXY({
          x: initialPosition?.x || x - 50,
          y: initialPosition?.y || y,
        });
        pan.setValue({
          x: initialPosition?.x || x - 50,
          y: initialPosition?.y || y,
        });

        Animated.timing(pan, {
          toValue: { x: initialPosition?.x || x, y: initialPosition?.y || y },
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        }).start();
      }
    }
  }, []);

  // Feedback haptique à différents moments
  const triggerHapticFeedback = (type: "start" | "end" | "snap") => {
    if (!enableHapticFeedback) return;

    if (
      (type === "start" && feedbackOnDragStart) ||
      (type === "end" && feedbackOnDragEnd) ||
      (type === "snap" && feedbackOnSnap)
    ) {
      if (Platform.OS === "ios") {
        // Vibration légère sur iOS
        Vibration.vibrate(10);
      } else {
        // Vibration standard sur Android
        Vibration.vibrate(20);
      }
    }
  };

  // Trouver la zone de drop sous l'élément
  const findDropTarget = (x: number, y: number): DropTarget | null => {
    const elementCenterX = x + dimensions.width / 2;
    const elementCenterY = y + dimensions.height / 2;

    for (const target of dropTargets) {
      if (
        elementCenterX >= target.x &&
        elementCenterX <= target.x + target.width &&
        elementCenterY >= target.y &&
        elementCenterY <= target.y + target.height
      ) {
        return target;
      }
    }

    return null;
  };

  // Calculer le snap le plus proche
  const findClosestSnap = (x: number, y: number) => {
    if (!snapTo || snapTo.length === 0) return null;

    let closestSnap = null;
    let closestDistance = Infinity;

    snapTo.forEach((snap) => {
      const distance = Math.sqrt(
        Math.pow(snap.x - x, 2) + Math.pow(snap.y - y, 2)
      );
      if (distance < closestDistance && distance <= snapThreshold) {
        closestSnap = snap;
        closestDistance = distance;
      }
    });

    return closestSnap;
  };

  // Appliquer l'effet de gravité
  const applyGravityEffect = () => {
    if (!applyGravity) return;

    const currentPosition = { x: pan.x._value, y: pan.y._value };

    // Déterminer les limites
    const maxY =
      bounds?.bottom !== undefined
        ? bounds.bottom - dimensions.height
        : window.innerHeight - dimensions.height;

    // Si on n'est pas déjà au fond, appliquer la gravité
    if (currentPosition.y < maxY) {
      Animated.timing(pan, {
        toValue: { x: currentPosition.x, y: maxY },
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        previousPosition.current = { x: currentPosition.x, y: maxY };
      });
    }
  };

  // PanResponder pour gérer le drag
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,

      onPanResponderGrant: (evt, gestureState) => {
        // Annuler le timer de gravité si actif
        if (gravityTimer.current) {
          clearTimeout(gravityTimer.current);
          gravityTimer.current = null;
        }

        // Marquer comme actif
        isCurrentlyActive.current = true;

        // Animation de scale au début du drag
        Animated.spring(scale, {
          toValue: 1.1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }).start();

        // Mémoriser la position actuelle
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
        pan.setValue({ x: 0, y: 0 });

        // Callback et feedback
        if (onDragStart) {
          onDragStart(evt, gestureState);
        }

        triggerHapticFeedback("start");
      },

      onPanResponderMove: (evt, gestureState) => {
        // Appliquer résistance si définie
        const dx =
          dragResistance > 0
            ? gestureState.dx * (1 - dragResistance)
            : gestureState.dx;
        const dy =
          dragResistance > 0
            ? gestureState.dy * (1 - dragResistance)
            : gestureState.dy;

        // Appliquer le mouvement en tenant compte des limites
        let newX = dx;
        let newY = dy;

        if (bounds) {
          // Calculer les nouvelles coordonnées potentielles
          const potentialX = previousPosition.current.x + dx;
          const potentialY = previousPosition.current.y + dy;

          // Vérifier les limites et ajuster si nécessaire
          if (bounds.left !== undefined && potentialX < bounds.left) {
            newX = bounds.left - previousPosition.current.x;
          }
          if (
            bounds.right !== undefined &&
            potentialX + dimensions.width > bounds.right
          ) {
            newX = bounds.right - dimensions.width - previousPosition.current.x;
          }
          if (bounds.top !== undefined && potentialY < bounds.top) {
            newY = bounds.top - previousPosition.current.y;
          }
          if (
            bounds.bottom !== undefined &&
            potentialY + dimensions.height > bounds.bottom
          ) {
            newY =
              bounds.bottom - dimensions.height - previousPosition.current.y;
          }
        }

        pan.setValue({ x: newX, y: newY });

        // Vérifier les zones de drop pendant le mouvement
        const currentX = previousPosition.current.x + pan.x._value;
        const currentY = previousPosition.current.y + pan.y._value;
        const currentTarget = findDropTarget(currentX, currentY);

        if (currentTarget !== lastDropTarget.current) {
          if (currentTarget) {
            // Entrer dans une nouvelle zone de drop
            triggerHapticFeedback("snap");
          }
          lastDropTarget.current = currentTarget;
        }

        // Callback
        if (onDragMove) {
          onDragMove(evt, {
            ...gestureState,
            moveX: currentX,
            moveY: currentY,
            dropTarget: currentTarget,
          });
        }
      },

      onPanResponderRelease: (evt, gestureState) => {
        // Animation de retour à l'échelle normale
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }).start();

        // Récupérer la position finale
        pan.flattenOffset();
        const finalPosition = {
          x: previousPosition.current.x + pan.x._value,
          y: previousPosition.current.y + pan.y._value,
        };

        // Vérifier si on est sur une zone de drop
        const dropTarget = findDropTarget(finalPosition.x, finalPosition.y);
        let dropped = false;

        if (dropTarget) {
          dropped = true;
          // Exécuter le callback de drop
          if (dropTarget.onDrop) {
            dropTarget.onDrop({
              id: dropTarget.id,
              position: finalPosition,
            });
          }

          // Snapper à la zone si demandé
          if (dropTarget.snapOnDrop) {
            const targetCenter = {
              x: dropTarget.x + dropTarget.width / 2 - dimensions.width / 2,
              y: dropTarget.y + dropTarget.height / 2 - dimensions.height / 2,
            };

            Animated.spring(pan, {
              toValue: targetCenter,
              friction: 7,
              tension: 40,
              useNativeDriver: true,
            }).start(() => {
              previousPosition.current = targetCenter;
            });

            triggerHapticFeedback("snap");
          }
        }
        // Sinon, chercher un snap
        else {
          const closestSnap = findClosestSnap(finalPosition.x, finalPosition.y);

          if (closestSnap) {
            // Snapper vers le point le plus proche
            Animated.spring(pan, {
              toValue: closestSnap,
              friction: 7,
              tension: 40,
              useNativeDriver: true,
            }).start(() => {
              previousPosition.current = closestSnap;
            });

            triggerHapticFeedback("snap");
          } else {
            // Mémoriser la nouvelle position
            previousPosition.current = finalPosition;

            // Appliquer la gravité après un délai
            if (applyGravity) {
              gravityTimer.current = setTimeout(() => {
                applyGravityEffect();
              }, gravityDelay);
            }
          }
        }

        // Callbacks
        if (onDragEnd) {
          onDragEnd(evt, gestureState);
        }

        if (onDragRelease) {
          onDragRelease(evt, gestureState, dropped);
        }

        triggerHapticFeedback("end");
        isCurrentlyActive.current = false;
      },
    })
  ).current;

  // Gérer le changement de dimensions
  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  };

  // Styles et transformations
  const animatedStyle = {
    transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }],
    opacity,
  };

  // Rendu pour le web avec Framer Motion
  if (Platform.OS === "web") {
    return (
      <motion.div
        style={{
          position: "absolute",
          left: initialPosition?.x || x,
          top: initialPosition?.y || y,
          ...(style as any),
          userSelect: "none",
          touchAction: "none",
        }}
        drag={!disabled}
        dragMomentum={false}
        dragConstraints={bounds as any}
        dragElastic={dragResistance}
        whileDrag={{ scale: 1.1 }}
        initial={
          animateOnMount
            ? {
                opacity: 0,
                scale: mountAnimation.type === "scale" ? 0.5 : 1,
                x: mountAnimation.type === "slide" ? -50 : 0,
              }
            : undefined
        }
        animate={{
          opacity: 1,
          scale: 1,
          x: 0,
        }}
        transition={{
          duration: mountAnimation.duration
            ? mountAnimation.duration / 1000
            : 0.3,
          delay: mountAnimation.delay ? mountAnimation.delay / 1000 : 0,
        }}
        onDragStart={(event, info) => {
          if (onDragStart) onDragStart(event, info);
          if (enableHapticFeedback && feedbackOnDragStart) {
            // Utiliser l'API de vibration du navigateur si disponible
            if ("navigator" in window && "vibrate" in navigator) {
              navigator.vibrate(10);
            }
          }
        }}
        onDrag={(event, info) => {
          if (onDragMove) {
            // Vérifier les zones de drop pendant le mouvement
            const currentTarget = findDropTarget(info.point.x, info.point.y);

            if (currentTarget !== lastDropTarget.current) {
              if (currentTarget && enableHapticFeedback && feedbackOnSnap) {
                if ("navigator" in window && "vibrate" in navigator) {
                  navigator.vibrate(10);
                }
              }
              lastDropTarget.current = currentTarget;
            }

            onDragMove(event, {
              ...info,
              dropTarget: currentTarget,
            });
          }
        }}
        onDragEnd={(event, info) => {
          if (onDragEnd) onDragEnd(event, info);

          // Vérifier si on est sur une zone de drop
          const dropTarget = findDropTarget(info.point.x, info.point.y);
          let dropped = false;

          if (dropTarget) {
            dropped = true;
            if (dropTarget.onDrop) {
              dropTarget.onDrop({
                id: dropTarget.id,
                position: { x: info.point.x, y: info.point.y },
              });
            }
          }

          if (onDragRelease) {
            onDragRelease(event, info, dropped);
          }

          if (enableHapticFeedback && feedbackOnDragEnd) {
            if ("navigator" in window && "vibrate" in navigator) {
              navigator.vibrate(10);
            }
          }
        }}
      >
        {children}
      </motion.div>
    );
  }

  // Rendu pour les plateformes mobiles (React Native)
  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          left: initialPosition?.x || x,
          top: initialPosition?.y || y,
        },
        animatedStyle,
      ]}
      {...panResponder.panHandlers}
      onLayout={onLayout}
    >
      {children}
    </Animated.View>
  );
};

// Wrapper DragArea avec contexte pour gérer des multiples éléments draggables
interface DragAreaProps {
  children: React.ReactNode;
  style?: ViewStyle;
  bounds?: { top: number; left: number; right: number; bottom: number };
  dropTargets?: DropTarget[];
  onDragStart?: (id: string, event: any, gestureState: any) => void;
  onDragEnd?: (id: string, event: any, gestureState: any) => void;
  onDrop?: (
    itemId: string,
    targetId: string,
    event: any,
    position: { x: number; y: number }
  ) => void;
}

export const DragArea: React.FC<DragAreaProps> = ({
  children,
  style,
  bounds,
  dropTargets = [],
  onDragStart,
  onDragEnd,
  onDrop,
}) => {
  // État pour suivre les zones de drop
  const [targets, setTargets] = useState<DropTarget[]>(dropTargets);

  // Mettre à jour les zones de drop si elles changent
  useEffect(() => {
    setTargets(dropTargets);
  }, [dropTargets]);

  // Rendu pour le web
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          position: "relative",
          ...(style as any),
        }}
      >
        {/* Rendu des zones de drop (optionnel pour visualisation) */}
        {targets.map((target) => (
          <div
            key={target.id}
            style={{
              position: "absolute",
              left: target.x,
              top: target.y,
              width: target.width,
              height: target.height,
              border: "1px dashed rgba(0,0,0,0.2)",
              borderRadius: 4,
              pointerEvents: "none",
              zIndex: -1,
            }}
          />
        ))}
        {children}
      </div>
    );
  }

  // Rendu pour mobile
  return (
    <View style={[styles.dragArea, style]}>
      {/* Rendu des zones de drop (optionnel pour visualisation) */}
      {targets.map((target) => (
        <View
          key={target.id}
          style={[
            styles.dropTarget,
            {
              left: target.x,
              top: target.y,
              width: target.width,
              height: target.height,
            },
          ]}
        />
      ))}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
  dragArea: {
    position: "relative",
    flex: 1,
  },
  dropTarget: {
    position: "absolute",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(0,0,0,0.2)",
    borderRadius: 4,
    zIndex: -1,
  },
});

export default Draggable;
