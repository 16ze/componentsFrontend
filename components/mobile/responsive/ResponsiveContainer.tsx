import React, { useState, useEffect } from "react";
import {
  View,
  Dimensions,
  ViewStyle,
  StyleSheet,
  Platform,
  ScaledSize,
  PixelRatio,
  StatusBar,
  useWindowDimensions,
} from "react-native";

// Types d'appareils
export type DeviceType = "phone" | "tablet" | "desktop";

// Orientation de l'écran
export type Orientation = "portrait" | "landscape";

// Breakpoints par défaut
export interface BreakpointConfig {
  phone: number;
  tablet: number;
  desktop: number;
}

// Configuration de la réactivité
export interface ResponsiveConfig {
  breakpoints?: Partial<BreakpointConfig>;
  enableDynamicScaling?: boolean;
  baseWidth?: number;
  baseHeight?: number;
  roundToNearestPixel?: boolean;
  includeStatusBar?: boolean;
}

// Valeurs par défaut
const DEFAULT_BREAKPOINTS: BreakpointConfig = {
  phone: 480,
  tablet: 768,
  desktop: 1024,
};

// Dimensions par défaut pour le calcul de la mise à l'échelle
// Basé sur un iPhone 8 en portrait
const DEFAULT_BASE_WIDTH = 375;
const DEFAULT_BASE_HEIGHT = 667;

// Props pour le composant responsif
interface ResponsiveContainerProps {
  children: React.ReactNode | ((props: ResponsiveInfo) => React.ReactNode);
  style?: ViewStyle;
  config?: ResponsiveConfig;
  phoneStyle?: ViewStyle;
  tabletStyle?: ViewStyle;
  desktopStyle?: ViewStyle;
  portraitStyle?: ViewStyle;
  landscapeStyle?: ViewStyle;
  onDimensionsChange?: (info: ResponsiveInfo) => void;
  minHeight?: number;
  forceDeviceType?: DeviceType;
  safeArea?: {
    top?: boolean;
    bottom?: boolean;
    left?: boolean;
    right?: boolean;
  };
}

// Information de réactivité passée au composant enfant
export interface ResponsiveInfo {
  width: number;
  height: number;
  deviceType: DeviceType;
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  scale: number;
  fontScale: number;
  breakpoints: BreakpointConfig;
  screenWidth: number;
  screenHeight: number;
  windowWidth: number;
  windowHeight: number;
  horizontalScale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  scaleFont: (size: number) => number;
  safeAreaInsets: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  devicePixelRatio: number;
}

/**
 * HOC ResponsiveContainer pour rendre les composants réactifs
 * en fonction de la taille et de l'orientation de l'écran
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  config = {},
  phoneStyle,
  tabletStyle,
  desktopStyle,
  portraitStyle,
  landscapeStyle,
  onDimensionsChange,
  minHeight,
  forceDeviceType,
  safeArea = {
    top: true,
    bottom: true,
    left: true,
    right: true,
  },
}) => {
  // Récupérer les dimensions actuelles via hook
  const windowDims = useWindowDimensions();
  const screenDims = Dimensions.get("screen");

  // États pour les dimensions et l'orientation
  const [dimensions, setDimensions] = useState<{
    window: ScaledSize;
    screen: ScaledSize;
  }>({
    window: Dimensions.get("window"),
    screen: Dimensions.get("screen"),
  });

  // Configurer les breakpoints
  const breakpoints: BreakpointConfig = {
    ...DEFAULT_BREAKPOINTS,
    ...config.breakpoints,
  };

  // Configuration pour la mise à l'échelle
  const {
    enableDynamicScaling = true,
    baseWidth = DEFAULT_BASE_WIDTH,
    baseHeight = DEFAULT_BASE_HEIGHT,
    roundToNearestPixel = true,
    includeStatusBar = true,
  } = config;

  // Calculer les dimensions de la fenêtre
  const { width: windowWidth, height: windowHeight } = dimensions.window;
  const { width: screenWidth, height: screenHeight } = dimensions.screen;

  // Hauteur réelle en tenant compte de la barre d'état
  const statusBarHeight = StatusBar.currentHeight || 0;
  const effectiveHeight = includeStatusBar
    ? windowHeight
    : Platform.OS === "android"
    ? windowHeight - statusBarHeight
    : windowHeight;

  // Déterminer le type d'appareil
  const detectDeviceType = (): DeviceType => {
    // Si forcé, utiliser cette valeur
    if (forceDeviceType) return forceDeviceType;

    const smallerDimension = Math.min(windowWidth, windowHeight);

    if (smallerDimension < breakpoints.phone) return "phone";
    if (smallerDimension < breakpoints.tablet) return "tablet";
    return "desktop";
  };

  // Déterminer l'orientation
  const detectOrientation = (): Orientation => {
    return windowWidth < windowHeight ? "portrait" : "landscape";
  };

  // Valeurs calculées
  const deviceType = detectDeviceType();
  const orientation = detectOrientation();
  const isPortrait = orientation === "portrait";
  const isLandscape = orientation === "landscape";

  // États booléens pour le type d'appareil
  const isPhone = deviceType === "phone";
  const isTablet = deviceType === "tablet";
  const isDesktop = deviceType === "desktop";

  // Facteurs d'échelle
  const pixelRatio = PixelRatio.get();

  // Calculer l'échelle avec le rapport de dimension de base
  const widthScale = windowWidth / baseWidth;
  const heightScale = effectiveHeight / baseHeight;

  // Fonctions utilitaires pour la mise à l'échelle
  const horizontalScale = (size: number): number => {
    if (!enableDynamicScaling) return size;
    const scaled = size * widthScale;
    return roundToNearestPixel
      ? PixelRatio.roundToNearestPixel(scaled)
      : scaled;
  };

  const verticalScale = (size: number): number => {
    if (!enableDynamicScaling) return size;
    const scaled = size * heightScale;
    return roundToNearestPixel
      ? PixelRatio.roundToNearestPixel(scaled)
      : scaled;
  };

  // Échelle adaptée à la fois à la largeur et à la hauteur
  const moderateScale = (size: number, factor = 0.5): number => {
    if (!enableDynamicScaling) return size;
    const scale = widthScale + (heightScale - widthScale) * factor;
    const scaled = size * scale;
    return roundToNearestPixel
      ? PixelRatio.roundToNearestPixel(scaled)
      : scaled;
  };

  // Échelle pour les polices
  const fontScale = PixelRatio.getFontScale();
  const scaleFont = (size: number): number => {
    if (!enableDynamicScaling) return size;
    return PixelRatio.roundToNearestPixel(size * widthScale) / fontScale;
  };

  // Valeurs d'inserts pour les zones de sécurité
  const safeAreaInsets = {
    top: safeArea.top ? (Platform.OS === "ios" ? 44 : statusBarHeight) : 0,
    right: safeArea.right ? (isLandscape && Platform.OS === "ios" ? 44 : 0) : 0,
    bottom: safeArea.bottom ? (Platform.OS === "ios" ? 34 : 0) : 0,
    left: safeArea.left ? (isLandscape && Platform.OS === "ios" ? 44 : 0) : 0,
  };

  // Écouter les changements de dimensions
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      "change",
      ({ window, screen }) => {
        setDimensions({ window, screen });
      }
    );

    return () => {
      // Désabonnement pour éviter les fuites de mémoire
      subscription?.remove?.();
    };
  }, []);

  // Informations responsives à transmettre
  const responsiveInfo: ResponsiveInfo = {
    width: windowWidth,
    height: windowHeight,
    deviceType,
    orientation,
    isPortrait,
    isLandscape,
    isPhone,
    isTablet,
    isDesktop,
    scale: Math.min(widthScale, heightScale),
    fontScale,
    breakpoints,
    screenWidth,
    screenHeight,
    windowWidth,
    windowHeight,
    horizontalScale,
    verticalScale,
    moderateScale,
    scaleFont,
    safeAreaInsets,
    devicePixelRatio: pixelRatio,
  };

  // Notifier les changements
  useEffect(() => {
    if (onDimensionsChange) {
      onDimensionsChange(responsiveInfo);
    }
  }, [windowWidth, windowHeight, orientation]);

  // Appliquer les styles en fonction du type d'appareil et de l'orientation
  const deviceTypeStyle = isPhone
    ? phoneStyle
    : isTablet
    ? tabletStyle
    : desktopStyle;

  const orientationStyle = isPortrait ? portraitStyle : landscapeStyle;

  // Style final combiné
  const combinedStyle = [
    styles.container,
    style,
    deviceTypeStyle,
    orientationStyle,
    minHeight && { minHeight },
  ];

  // Rendu du contenu
  return (
    <View style={combinedStyle}>
      {typeof children === "function" ? children(responsiveInfo) : children}
    </View>
  );
};

// Styles par défaut
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// HOC withResponsive pour envelopper des composants
export function withResponsive<P extends {}>(
  WrappedComponent: React.ComponentType<P & ResponsiveInfo>,
  config?: ResponsiveConfig
) {
  // Retourner un composant avec les props étendues
  return (props: P & { responsiveConfig?: ResponsiveConfig }) => {
    const mergedConfig = {
      ...config,
      ...props.responsiveConfig,
    };

    return (
      <ResponsiveContainer config={mergedConfig}>
        {(responsiveInfo) => (
          <WrappedComponent {...props} {...responsiveInfo} />
        )}
      </ResponsiveContainer>
    );
  };
}

// Hook useResponsive pour utiliser les valeurs responsives dans un composant fonctionnel
export function useResponsive(config?: ResponsiveConfig): ResponsiveInfo {
  // États pour les dimensions et l'orientation
  const [dimensions, setDimensions] = useState({
    window: Dimensions.get("window"),
    screen: Dimensions.get("screen"),
  });

  // Configurer les breakpoints
  const breakpoints: BreakpointConfig = {
    ...DEFAULT_BREAKPOINTS,
    ...config?.breakpoints,
  };

  // Configuration pour la mise à l'échelle
  const {
    enableDynamicScaling = true,
    baseWidth = DEFAULT_BASE_WIDTH,
    baseHeight = DEFAULT_BASE_HEIGHT,
    roundToNearestPixel = true,
    includeStatusBar = true,
  } = config || {};

  // Calculer les dimensions de la fenêtre
  const { width: windowWidth, height: windowHeight } = dimensions.window;
  const { width: screenWidth, height: screenHeight } = dimensions.screen;

  // Hauteur réelle en tenant compte de la barre d'état
  const statusBarHeight = StatusBar.currentHeight || 0;
  const effectiveHeight = includeStatusBar
    ? windowHeight
    : Platform.OS === "android"
    ? windowHeight - statusBarHeight
    : windowHeight;

  // Déterminer le type d'appareil
  const detectDeviceType = (): DeviceType => {
    const smallerDimension = Math.min(windowWidth, windowHeight);

    if (smallerDimension < breakpoints.phone) return "phone";
    if (smallerDimension < breakpoints.tablet) return "tablet";
    return "desktop";
  };

  // Déterminer l'orientation
  const detectOrientation = (): Orientation => {
    return windowWidth < windowHeight ? "portrait" : "landscape";
  };

  // Valeurs calculées
  const deviceType = detectDeviceType();
  const orientation = detectOrientation();
  const isPortrait = orientation === "portrait";
  const isLandscape = orientation === "landscape";

  // États booléens pour le type d'appareil
  const isPhone = deviceType === "phone";
  const isTablet = deviceType === "tablet";
  const isDesktop = deviceType === "desktop";

  // Facteurs d'échelle
  const pixelRatio = PixelRatio.get();

  // Calculer l'échelle avec le rapport de dimension de base
  const widthScale = windowWidth / baseWidth;
  const heightScale = effectiveHeight / baseHeight;

  // Fonctions utilitaires pour la mise à l'échelle
  const horizontalScale = (size: number): number => {
    if (!enableDynamicScaling) return size;
    const scaled = size * widthScale;
    return roundToNearestPixel
      ? PixelRatio.roundToNearestPixel(scaled)
      : scaled;
  };

  const verticalScale = (size: number): number => {
    if (!enableDynamicScaling) return size;
    const scaled = size * heightScale;
    return roundToNearestPixel
      ? PixelRatio.roundToNearestPixel(scaled)
      : scaled;
  };

  // Échelle adaptée à la fois à la largeur et à la hauteur
  const moderateScale = (size: number, factor = 0.5): number => {
    if (!enableDynamicScaling) return size;
    const scale = widthScale + (heightScale - widthScale) * factor;
    const scaled = size * scale;
    return roundToNearestPixel
      ? PixelRatio.roundToNearestPixel(scaled)
      : scaled;
  };

  // Échelle pour les polices
  const fontScale = PixelRatio.getFontScale();
  const scaleFont = (size: number): number => {
    if (!enableDynamicScaling) return size;
    return PixelRatio.roundToNearestPixel(size * widthScale) / fontScale;
  };

  // Valeurs d'inserts pour les zones de sécurité
  const safeAreaInsets = {
    top: Platform.OS === "ios" ? 44 : statusBarHeight,
    right: isLandscape && Platform.OS === "ios" ? 44 : 0,
    bottom: Platform.OS === "ios" ? 34 : 0,
    left: isLandscape && Platform.OS === "ios" ? 44 : 0,
  };

  // Écouter les changements de dimensions
  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      "change",
      ({ window, screen }) => {
        setDimensions({ window, screen });
      }
    );

    return () => {
      // Désabonnement pour éviter les fuites de mémoire
      subscription?.remove?.();
    };
  }, []);

  // Retourner les informations responsives
  return {
    width: windowWidth,
    height: windowHeight,
    deviceType,
    orientation,
    isPortrait,
    isLandscape,
    isPhone,
    isTablet,
    isDesktop,
    scale: Math.min(widthScale, heightScale),
    fontScale,
    breakpoints,
    screenWidth,
    screenHeight,
    windowWidth,
    windowHeight,
    horizontalScale,
    verticalScale,
    moderateScale,
    scaleFont,
    safeAreaInsets,
    devicePixelRatio: pixelRatio,
  };
}

export default ResponsiveContainer;
