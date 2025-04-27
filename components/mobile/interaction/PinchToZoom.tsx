import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Platform,
  Image,
  ImageSourcePropType,
  ViewStyle,
  Dimensions,
  GestureResponderEvent,
  ImageURISource,
} from "react-native";
import { motion } from "framer-motion";

interface PinchToZoomProps {
  source: ImageSourcePropType;
  style?: ViewStyle;
  minScale?: number;
  maxScale?: number;
  initialScale?: number;
  doubleTapScale?: number;
  onZoomStart?: () => void;
  onZoomEnd?: (scale: number) => void;
  onZoomChange?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  disabled?: boolean;
  disableDoubleTap?: boolean;
  imageStyle?: ViewStyle;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  containerStyle?: ViewStyle;
  enablePanning?: boolean;
  enforceBoundaries?: boolean;
  children?: React.ReactNode;
  imageComponent?: React.ReactNode;
  rotationEnabled?: boolean;
  doubleTapTimeout?: number;
  maxOverflow?: number;
  resetOnClose?: boolean;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const PinchToZoom: React.FC<PinchToZoomProps> = ({
  source,
  style,
  minScale = 1,
  maxScale = 3,
  initialScale = 1,
  doubleTapScale = 2,
  onZoomStart,
  onZoomEnd,
  onZoomChange,
  onTap,
  onDoubleTap,
  disabled = false,
  disableDoubleTap = false,
  imageStyle,
  resizeMode = "contain",
  containerStyle,
  enablePanning = true,
  enforceBoundaries = true,
  children,
  imageComponent,
  rotationEnabled = false,
  doubleTapTimeout = 300,
  maxOverflow = 100,
  resetOnClose = true,
}) => {
  // Refs pour le pinch-to-zoom
  const scale = useRef(new Animated.Value(initialScale)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(initialScale);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const lastRotation = useRef(0);

  // State pour le double tap
  const [layoutReady, setLayoutReady] = useState(false);
  const [componentWidth, setComponentWidth] = useState(0);
  const [componentHeight, setComponentHeight] = useState(0);
  const [imageWidth, setImageWidth] = useState(0);
  const [imageHeight, setImageHeight] = useState(0);
  const lastTap = useRef<number | null>(null);

  // Dimensions de l'image
  useEffect(() => {
    // Si c'est une URI, récupérer les dimensions de l'image
    if (source && typeof source !== "number" && "uri" in source && source.uri) {
      Image.getSize(
        source.uri,
        (width, height) => {
          setImageWidth(width);
          setImageHeight(height);
        },
        (error) => {
          console.error(
            "Erreur lors du chargement des dimensions de l'image",
            error
          );
        }
      );
    }
  }, [source]);

  // PanResponder pour gérer les gestes
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Activer pour mouvements significatifs
        const { dx, dy, numberActiveTouches } = gestureState;
        return (
          !disabled &&
          (numberActiveTouches > 1 ||
            (enablePanning &&
              numberActiveTouches === 1 &&
              lastScale.current > minScale) ||
            Math.abs(dx) > 10 ||
            Math.abs(dy) > 10)
        );
      },

      onPanResponderGrant: (_, gestureState) => {
        // Gestion des taps simples et doubles
        const now = Date.now();
        const { numberActiveTouches } = gestureState;

        if (numberActiveTouches === 1) {
          if (
            lastTap.current &&
            now - lastTap.current < doubleTapTimeout &&
            !disableDoubleTap
          ) {
            // Double tap
            lastTap.current = null;

            if (onDoubleTap) {
              onDoubleTap();
            }

            // Toggle zoom sur double tap
            const newScale =
              lastScale.current > minScale + 0.1 ? minScale : doubleTapScale;

            Animated.parallel([
              Animated.spring(scale, {
                toValue: newScale,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.spring(translateX, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.spring(translateY, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
            ]).start(() => {
              lastScale.current = newScale;
              lastTranslateX.current = 0;
              lastTranslateY.current = 0;

              if (onZoomEnd) {
                onZoomEnd(newScale);
              }
            });
          } else {
            // Tap simple
            lastTap.current = now;
            if (onTap) {
              onTap();
            }
          }
        }

        // Notification du début du zoom
        if (numberActiveTouches > 1 && onZoomStart) {
          onZoomStart();
        }
      },

      onPanResponderMove: (event, gestureState) => {
        const { numberActiveTouches } = gestureState;

        if (
          numberActiveTouches === 1 &&
          lastScale.current > minScale &&
          enablePanning
        ) {
          // Panning (déplacement)
          const newTranslateX = lastTranslateX.current + gestureState.dx;
          const newTranslateY = lastTranslateY.current + gestureState.dy;

          // Appliquer les limites de déplacement si nécessaire
          if (enforceBoundaries) {
            const maxTranslateX =
              Math.max(
                0,
                (componentWidth * lastScale.current - componentWidth) / 2
              ) + maxOverflow;
            const maxTranslateY =
              Math.max(
                0,
                (componentHeight * lastScale.current - componentHeight) / 2
              ) + maxOverflow;

            translateX.setValue(
              Math.min(maxTranslateX, Math.max(-maxTranslateX, newTranslateX))
            );
            translateY.setValue(
              Math.min(maxTranslateY, Math.max(-maxTranslateY, newTranslateY))
            );
          } else {
            translateX.setValue(newTranslateX);
            translateY.setValue(newTranslateY);
          }
        }
        // Pinch to zoom (avec 2 doigts)
        else if (numberActiveTouches > 1) {
          const touches = event.nativeEvent.touches;

          // Calculer la distance entre les deux touches
          const touch1 = touches[0];
          const touch2 = touches[1];

          const distance = Math.sqrt(
            Math.pow(touch2.pageX - touch1.pageX, 2) +
              Math.pow(touch2.pageY - touch1.pageY, 2)
          );

          // Calculer la rotation si activée
          if (rotationEnabled) {
            const angle =
              (Math.atan2(
                touch2.pageY - touch1.pageY,
                touch2.pageX - touch1.pageX
              ) *
                180) /
              Math.PI;

            // Appliquer la rotation par rapport à la dernière rotation
            rotation.setValue(lastRotation.current + angle / 10);
          }

          // Calculer la nouvelle échelle (limiter entre minScale et maxScale)
          const initialDistance = Math.sqrt(
            Math.pow(
              gestureState.x0 -
                (event.nativeEvent.touches[0].pageX - gestureState.dx),
              2
            ) +
              Math.pow(
                gestureState.y0 -
                  (event.nativeEvent.touches[0].pageY - gestureState.dy),
                2
              )
          );

          const newScale = Math.min(
            maxScale,
            Math.max(minScale, lastScale.current * (distance / initialDistance))
          );

          scale.setValue(newScale);

          // Callback sur le changement d'échelle
          if (onZoomChange) {
            onZoomChange(newScale);
          }
        }
      },

      onPanResponderRelease: () => {
        // Mémoriser les valeurs actuelles pour la prochaine interaction
        lastScale.current = scale._value;
        lastTranslateX.current = translateX._value;
        lastTranslateY.current = translateY._value;
        lastRotation.current = rotation._value;

        if (enforceBoundaries) {
          // S'assurer que l'image reste dans les limites après le relâchement
          const maxTranslateX = Math.max(
            0,
            (componentWidth * lastScale.current - componentWidth) / 2
          );
          const maxTranslateY = Math.max(
            0,
            (componentHeight * lastScale.current - componentHeight) / 2
          );

          // Si l'échelle est revenue au minimum, recentrer l'image
          if (lastScale.current <= minScale) {
            Animated.parallel([
              Animated.spring(translateX, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.spring(translateY, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.spring(scale, {
                toValue: minScale,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.spring(rotation, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
            ]).start(() => {
              lastScale.current = minScale;
              lastTranslateX.current = 0;
              lastTranslateY.current = 0;
              lastRotation.current = 0;
            });
          }
          // Sinon, s'assurer que l'image ne dépasse pas trop les bords
          else if (
            Math.abs(translateX._value) > maxTranslateX ||
            Math.abs(translateY._value) > maxTranslateY
          ) {
            const newTranslateX = Math.min(
              maxTranslateX,
              Math.max(-maxTranslateX, translateX._value)
            );
            const newTranslateY = Math.min(
              maxTranslateY,
              Math.max(-maxTranslateY, translateY._value)
            );

            Animated.parallel([
              Animated.spring(translateX, {
                toValue: newTranslateX,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
              Animated.spring(translateY, {
                toValue: newTranslateY,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
              }),
            ]).start(() => {
              lastTranslateX.current = newTranslateX;
              lastTranslateY.current = newTranslateY;
            });
          }
        }

        // Notification de fin de zoom
        if (onZoomEnd) {
          onZoomEnd(scale._value);
        }
      },
    })
  ).current;

  // Réinitialiser le zoom
  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: minScale,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(rotation, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      lastScale.current = minScale;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
      lastRotation.current = 0;
    });
  };

  // Réinitialiser lors du démontage si nécessaire
  useEffect(() => {
    return () => {
      if (resetOnClose) {
        resetZoom();
      }
    };
  }, [resetOnClose]);

  // Style principal pour les transformations
  const transformStyle = {
    transform: [
      { scale },
      { translateX },
      { translateY },
      {
        rotate: rotation.interpolate({
          inputRange: [-360, 360],
          outputRange: ["-360deg", "360deg"],
        }),
      },
    ],
  };

  // Adapté pour le web avec Framer Motion
  if (Platform.OS === "web") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          ...(containerStyle as any),
        }}
      >
        <motion.div
          style={{
            width: "100%",
            height: "100%",
            touchAction: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            ...(style as any),
          }}
          drag={enablePanning && !disabled}
          dragConstraints={{
            top: -200,
            left: -200,
            right: 200,
            bottom: 200,
          }}
          dragElastic={0.2}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
          whileTap={{ cursor: "grabbing" }}
          initial={{ scale: initialScale }}
          onTap={(e) => {
            if (disabled) return;

            const now = Date.now();
            if (
              lastTap.current &&
              now - lastTap.current < doubleTapTimeout &&
              !disableDoubleTap
            ) {
              lastTap.current = null;
              if (onDoubleTap) onDoubleTap();
            } else {
              lastTap.current = now;
              if (onTap) onTap();
            }
          }}
        >
          {imageComponent ? (
            imageComponent
          ) : (
            <motion.img
              src={(source as ImageURISource).uri}
              style={{
                width: "100%",
                height: "100%",
                objectFit: resizeMode,
                ...(imageStyle as any),
              }}
              dragConstraints={{
                top: -200,
                left: -200,
                right: 200,
                bottom: 200,
              }}
              drag={false}
            />
          )}
          {children}
        </motion.div>
      </div>
    );
  }

  // Rendu pour mobile
  return (
    <View
      style={[styles.container, containerStyle]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setComponentWidth(width);
        setComponentHeight(height);
        setLayoutReady(true);
      }}
    >
      <Animated.View
        style={[styles.content, style, transformStyle]}
        {...(layoutReady ? panResponder.panHandlers : {})}
      >
        {imageComponent ? (
          imageComponent
        ) : (
          <Image
            source={source}
            style={[
              styles.image,
              {
                width: componentWidth,
                height: componentHeight,
                resizeMode,
              },
              imageStyle,
            ]}
          />
        )}
        {children}
      </Animated.View>
    </View>
  );
};

// Pour les cartes
export const MapZoomable: React.FC<PinchToZoomProps> = (props) => {
  // Version spécialisée pour les cartes interactives
  return (
    <PinchToZoom
      {...props}
      enforceBoundaries={false}
      maxScale={5}
      resizeMode="cover"
      enablePanning={true}
      rotationEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    flex: 1,
  },
});

export default PinchToZoom;
