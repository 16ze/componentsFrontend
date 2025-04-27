import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "next/navigation";

interface ContextualHeaderProps {
  title?: string;
  leftComponent?: React.ReactNode;
  rightComponent?: React.ReactNode;
  transparent?: boolean;
  dynamicBackground?: boolean;
  backgroundColor?: string;
  textColor?: string;
  onBackPress?: () => void;
  elevated?: boolean;
  scrollY?: Animated.Value;
  subtitle?: string;
  largeTitle?: boolean;
  backButton?: boolean;
  centerTitle?: boolean;
  sticky?: boolean;
  height?: number;
}

const { width } = Dimensions.get("window");
const DEFAULT_HEADER_HEIGHT = 56;
const LARGE_HEADER_HEIGHT = 120;

/**
 * Barre de navigation contextuelle qui peut être transparente ou colorée
 * en fonction de la page ou du défilement
 */
const ContextualHeader: React.FC<ContextualHeaderProps> = ({
  title,
  leftComponent,
  rightComponent,
  transparent = false,
  dynamicBackground = false,
  backgroundColor = "#ffffff",
  textColor = transparent ? "#ffffff" : "#000000",
  onBackPress,
  elevated = true,
  scrollY,
  subtitle,
  largeTitle = false,
  backButton = true,
  centerTitle = false,
  sticky = false,
  height = largeTitle ? LARGE_HEADER_HEIGHT : DEFAULT_HEADER_HEIGHT,
}) => {
  const router = useRouter();
  const [scrollOffset, setScrollOffset] = useState(0);

  // Animation pour l'opacité du background dynamique
  const backgroundOpacity = useRef(
    new Animated.Value(transparent ? 0 : 1)
  ).current;
  // Animation pour l'élévation
  const elevation = useRef(new Animated.Value(elevated ? 1 : 0)).current;

  // Animation pour le titre large
  const titleScale = useRef(new Animated.Value(largeTitle ? 1.5 : 1)).current;
  const titlePosY = useRef(new Animated.Value(largeTitle ? 20 : 0)).current;
  const titlePosX = useRef(new Animated.Value(0)).current;

  // Surveillance du défilement pour l'effet dynamique
  useEffect(() => {
    if (scrollY && dynamicBackground) {
      const listener = scrollY.addListener(({ value }) => {
        // Calculer l'opacité en fonction du défilement
        const newOpacity = Math.min(1, value / 80);
        backgroundOpacity.setValue(newOpacity);

        // Calcul pour l'animation du titre large
        if (largeTitle) {
          const scale = Math.max(1, 1.5 - (value / 100) * 0.5);
          titleScale.setValue(scale);

          const posY = Math.max(0, 20 - value / 4);
          titlePosY.setValue(posY);

          if (centerTitle) {
            // Déplacer progressivement le titre du côté gauche vers le centre
            const targetX = value > 60 ? width / 8 : 0;
            titlePosX.setValue(targetX);
          }
        }

        // Mettre à jour le state pour d'autres calculs si nécessaire
        setScrollOffset(value);
      });

      return () => {
        scrollY.removeListener(listener);
      };
    }
  }, [scrollY, dynamicBackground]);

  // Calcul de la hauteur dynamique pour le header large
  const dynamicHeight = React.useMemo(() => {
    if (!largeTitle || !scrollY) return height;

    return scrollY.interpolate({
      inputRange: [0, 100],
      outputRange: [LARGE_HEADER_HEIGHT, DEFAULT_HEADER_HEIGHT],
      extrapolate: "clamp",
    });
  }, [largeTitle, scrollY, height]);

  // Gérer le retour en arrière
  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  // Rendu par défaut pour le bouton retour
  const renderBackButton = () => {
    if (!backButton) return null;

    return (
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBackPress}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <View style={[styles.backIcon, { borderColor: textColor }]} />
      </TouchableOpacity>
    );
  };

  // Composant gauche - soit back button soit custom component
  const renderLeftComponent = () => {
    if (leftComponent) return leftComponent;
    return renderBackButton();
  };

  // Composant titre
  const renderTitle = () => {
    const titleComponent = (
      <Animated.View
        style={[
          styles.titleContainer,
          largeTitle && styles.largeTitleContainer,
          centerTitle && styles.centeredTitleContainer,
          {
            transform: [
              { scale: titleScale },
              { translateY: titlePosY },
              { translateX: titlePosX },
            ],
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.title,
            largeTitle && styles.largeTitle,
            { color: textColor },
          ]}
          numberOfLines={1}
        >
          {title}
        </Animated.Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: textColor + "99" }]}>
            {subtitle}
          </Text>
        )}
      </Animated.View>
    );

    return titleComponent;
  };

  // Style pour le conteneur principal
  const containerStyle = [
    styles.container,
    {
      height: !largeTitle || !scrollY ? height : dynamicHeight,
      backgroundColor:
        transparent || dynamicBackground ? "transparent" : backgroundColor,
    },
    elevated && styles.elevated,
    sticky && styles.sticky,
  ];

  // Style pour le background dynamique
  const dynamicBackgroundStyle = {
    backgroundColor,
    opacity: backgroundOpacity,
  };

  return (
    <>
      {/* Ajuster le fond de la barre d'état sur iOS */}
      {Platform.OS === "ios" && (
        <Animated.View
          style={[
            styles.statusBar,
            dynamicBackground ? dynamicBackgroundStyle : { backgroundColor },
            transparent && { backgroundColor: "transparent" },
          ]}
        />
      )}

      <Animated.View style={containerStyle}>
        {/* Fond dynamique qui s'affiche progressivement lors du défilement */}
        {dynamicBackground && (
          <Animated.View
            style={[styles.dynamicBackground, dynamicBackgroundStyle]}
          />
        )}

        {/* Contenu du header */}
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContent}>
            {/* Côté gauche : back ou personnalisé */}
            <View style={styles.leftContainer}>{renderLeftComponent()}</View>

            {/* Titre au centre ou en style large */}
            {renderTitle()}

            {/* Côté droit : composant personnalisé */}
            <View style={styles.rightContainer}>{rightComponent}</View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
    zIndex: 1000,
  },
  statusBar: {
    height: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
    width: "100%",
    position: "absolute",
    top: 0,
    zIndex: 999,
  },
  safeArea: {
    flex: 1,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  elevated: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sticky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  dynamicBackground: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  leftContainer: {
    width: 60,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  rightContainer: {
    width: 60,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  centeredTitleContainer: {
    alignItems: "center",
  },
  largeTitleContainer: {
    paddingBottom: 10,
    paddingLeft: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "600",
  },
  largeTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  backButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: {
    width: 10,
    height: 10,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "45deg" }],
  },
});

export default ContextualHeader;
