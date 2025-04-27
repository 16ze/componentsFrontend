import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Animated,
  PanResponder,
  RefreshControl,
  StyleSheet,
  Platform,
  ViewStyle,
  ScrollViewProps,
} from "react-native";
import { motion } from "framer-motion";

interface PullToRefreshProps extends Omit<ScrollViewProps, "refreshControl"> {
  onRefresh: () => Promise<void>;
  refreshing?: boolean;
  pullDistance?: number;
  refreshingOffset?: number;
  maxPullDistance?: number;
  refreshIndicator?: React.ReactNode;
  customAnimation?: "spinner" | "wave" | "dots" | "custom";
  customAnimationComponent?: React.ReactNode;
  animationColor?: string;
  style?: ViewStyle;
  children: React.ReactNode;
  pullAnimationDuration?: number;
  releaseAnimationDuration?: number;
  ScrollViewComponent?: React.ComponentType<any>;
  headerHeight?: number;
  onPullProgress?: (progress: number) => void;
  bounceEffectEnabled?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  refreshing = false,
  pullDistance = 100,
  refreshingOffset = 60,
  maxPullDistance = 150,
  refreshIndicator,
  customAnimation = "spinner",
  customAnimationComponent,
  animationColor = "#007AFF",
  style,
  children,
  pullAnimationDuration = 200,
  releaseAnimationDuration = 300,
  ScrollViewComponent = ScrollView,
  headerHeight = 0,
  onPullProgress,
  bounceEffectEnabled = true,
  ...scrollViewProps
}) => {
  // State et refs pour gérer l'état du pull-to-refresh
  const [refreshState, setRefreshState] = useState("idle"); // 'idle', 'pulling', 'refreshing', 'releasing'
  const [pullValue, setPullValue] = useState(0);
  const isPulling = useRef(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const pullY = useRef(new Animated.Value(0)).current;
  const initialY = useRef(0);
  const isRefreshing = useRef(refreshing);

  // Animations
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  // Mettre à jour isRefreshing.current quand refreshing change
  useEffect(() => {
    isRefreshing.current = refreshing;
    if (refreshing) {
      setRefreshState("refreshing");
      // Animer l'indicateur pendant le rafraîchissement
      startRefreshingAnimation();
    } else if (refreshState === "refreshing") {
      // Animer le retour à l'état de repos
      Animated.timing(pullY, {
        toValue: 0,
        duration: releaseAnimationDuration,
        useNativeDriver: true,
      }).start(() => {
        setRefreshState("idle");
        stopRefreshingAnimation();
      });
    }
  }, [refreshing]);

  // Animation de rotation pour le spinner
  const startRefreshingAnimation = () => {
    if (customAnimation === "spinner") {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else if (customAnimation === "wave" || customAnimation === "dots") {
      // Animation pour "wave" et "dots"
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(scaleValue, {
            toValue: 0.5,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  };

  const stopRefreshingAnimation = () => {
    spinValue.stopAnimation();
    scaleValue.stopAnimation();
    opacityValue.stopAnimation();
  };

  // Gérer le refresh
  const handleRefresh = async () => {
    if (refreshState === "refreshing") return;

    setRefreshState("refreshing");
    try {
      await onRefresh();
    } catch (error) {
      console.error("Erreur lors du rafraîchissement:", error);
    }
  };

  // Configuration du PanResponder pour les gestes de tirage
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Activer uniquement si le scroll est au top et qu'on tire vers le bas
        const { dy, y } = gestureState;
        initialY.current = y;
        return !isRefreshing.current && dy > 5 && scrollY.__getValue() === 0;
      },
      onPanResponderGrant: () => {
        isPulling.current = true;
        setRefreshState("pulling");
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isPulling.current) return;

        // Calculer la distance de tirage avec résistance
        const pullDistance = Math.min(gestureState.dy * 0.5, maxPullDistance);
        const pullProgress = Math.min(pullDistance / maxPullDistance, 1);

        // Mettre à jour l'état et la valeur d'animation
        setPullValue(pullDistance);
        pullY.setValue(pullDistance);
        opacityValue.setValue(pullProgress);

        // Callback pour la progression du tirage
        if (onPullProgress) {
          onPullProgress(pullProgress);
        }
      },
      onPanResponderRelease: () => {
        isPulling.current = false;

        // Si tiré suffisamment, déclencher le rafraîchissement
        if (pullValue >= pullDistance) {
          setRefreshState("releasing");

          // Animer l'indicateur à la position de rafraîchissement
          Animated.timing(pullY, {
            toValue: refreshingOffset,
            duration: releaseAnimationDuration,
            useNativeDriver: true,
          }).start(() => {
            handleRefresh();
          });
        } else {
          // Sinon, revenir à la position initiale
          Animated.timing(pullY, {
            toValue: 0,
            duration: pullAnimationDuration,
            useNativeDriver: true,
          }).start(() => {
            setRefreshState("idle");
          });
        }
      },
    })
  ).current;

  // Rendu de l'indicateur personnalisé
  const renderCustomIndicator = () => {
    if (customAnimationComponent) {
      return (
        <Animated.View
          style={[
            styles.indicatorContainer,
            {
              transform: [
                {
                  translateY: Animated.add(
                    pullY,
                    new Animated.Value(-refreshingOffset)
                  ),
                },
              ],
              opacity: opacityValue,
            },
          ]}
        >
          {customAnimationComponent}
        </Animated.View>
      );
    }

    if (customAnimation === "spinner") {
      // Animation de spinner
      const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "360deg"],
      });

      return (
        <Animated.View
          style={[
            styles.indicatorContainer,
            {
              transform: [
                {
                  translateY: Animated.add(
                    pullY,
                    new Animated.Value(-refreshingOffset)
                  ),
                },
                { rotate: spin },
              ],
              opacity: opacityValue,
            },
          ]}
        >
          <View style={[styles.spinner, { borderColor: animationColor }]} />
        </Animated.View>
      );
    }

    if (customAnimation === "wave") {
      // Animation de vague
      return (
        <Animated.View
          style={[
            styles.indicatorContainer,
            {
              transform: [
                {
                  translateY: Animated.add(
                    pullY,
                    new Animated.Value(-refreshingOffset)
                  ),
                },
              ],
              opacity: opacityValue,
            },
          ]}
        >
          <View style={styles.waveContainer}>
            {[0, 1, 2, 3, 4].map((i) => {
              const delay = i * 0.1;

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveDot,
                    {
                      backgroundColor: animationColor,
                      transform: [
                        {
                          translateY: scaleValue.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0, -10, 0],
                            // Décaler l'animation pour chaque point
                            extrapolate: "clamp",
                          }),
                        },
                      ],
                    },
                  ]}
                />
              );
            })}
          </View>
        </Animated.View>
      );
    }

    if (customAnimation === "dots") {
      // Animation de points
      return (
        <Animated.View
          style={[
            styles.indicatorContainer,
            {
              transform: [
                {
                  translateY: Animated.add(
                    pullY,
                    new Animated.Value(-refreshingOffset)
                  ),
                },
              ],
              opacity: opacityValue,
            },
          ]}
        >
          <View style={styles.dotsContainer}>
            {[0, 1, 2].map((i) => {
              const delay = i * 0.2;

              return (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: animationColor,
                      transform: [
                        {
                          scale: scaleValue.interpolate({
                            inputRange: [0, 0.3 + delay, 0.7 - delay, 1],
                            outputRange: [0.5, 1, 1, 0.5],
                            extrapolate: "clamp",
                          }),
                        },
                      ],
                    },
                  ]}
                />
              );
            })}
          </View>
        </Animated.View>
      );
    }

    // Indicateur par défaut
    return (
      <Animated.View
        style={[
          styles.indicatorContainer,
          {
            transform: [
              {
                translateY: Animated.add(
                  pullY,
                  new Animated.Value(-refreshingOffset)
                ),
              },
            ],
            opacity: opacityValue,
          },
        ]}
      >
        {refreshIndicator || (
          <View style={[styles.spinner, { borderColor: animationColor }]} />
        )}
      </Animated.View>
    );
  };

  // Adapter pour plateformes web
  if (Platform.OS === "web") {
    // Pour le web, on utilise Framer Motion
    return (
      <motion.div
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
          position: "relative",
          ...(style as any),
        }}
      >
        {/* Indicateur de rafraîchissement pour le web */}
        <motion.div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: -50,
            height: 50,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: refreshing ? 1 : 0,
            y: refreshing ? 50 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          {/* Animation web personnalisée */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {customAnimation === "spinner" && (
              <motion.div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  border: `2px solid ${animationColor}`,
                  borderTopColor: "transparent",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}

            {customAnimation === "dots" && (
              <div style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: animationColor,
                    }}
                    animate={{
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            )}

            {customAnimation === "wave" && (
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  height: 20,
                  alignItems: "center",
                }}
              >
                {[0, 1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    style={{
                      width: 4,
                      height: 12,
                      borderRadius: 2,
                      backgroundColor: animationColor,
                    }}
                    animate={{
                      height: ["40%", "100%", "40%"],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            )}

            {customAnimationComponent && customAnimationComponent}
          </div>
        </motion.div>

        {/* Contenu de scroll pour le web */}
        <div
          style={{
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            if (target.scrollTop === 0 && !refreshing) {
              // Pour le web, on peut implémenter un détecteur de "pull" via touch events
              // mais c'est plus simple d'utiliser le refresh control natif pour mobile
            }
          }}
        >
          {children}
        </div>
      </motion.div>
    );
  }

  // Rendu pour mobile
  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
      {/* Indicateur de rafraîchissement personnalisé */}
      {renderCustomIndicator()}

      {/* ScrollView natif avec RefreshControl par défaut */}
      <ScrollViewComponent
        {...scrollViewProps}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={[
          scrollViewProps.contentContainerStyle,
          { paddingTop: headerHeight },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            progressViewOffset={headerHeight}
            tintColor={animationColor}
            colors={[animationColor]}
            style={{ opacity: customAnimation === "custom" ? 0 : 1 }}
          />
        }
      >
        {children}
      </ScrollViewComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  indicatorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  spinner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderTopColor: "transparent",
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 20,
  },
  waveDot: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginHorizontal: 2,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },
});

export default PullToRefresh;
