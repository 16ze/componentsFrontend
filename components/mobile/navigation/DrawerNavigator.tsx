import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  ImageBackground,
  Image,
} from "react-native";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Types pour les items du drawer
export interface DrawerSubItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  route: string;
  badge?: number | string;
}

export interface DrawerItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  route?: string;
  badge?: number | string;
  subItems?: DrawerSubItem[];
}

interface DrawerNavigatorProps {
  items: DrawerItem[];
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  backgroundColor?: string;
  itemColor?: string;
  activeItemColor?: string;
  activeBgColor?: string;
  drawerWidth?: number | string;
  isOpen?: boolean;
  onClose?: () => void;
  avatarUrl?: string;
  userName?: string;
  userEmail?: string;
  backgroundImage?: string;
}

const { width, height } = Dimensions.get("window");

const DrawerNavigator: React.FC<DrawerNavigatorProps> = ({
  items,
  headerComponent,
  footerComponent,
  backgroundColor = "#FFFFFF",
  itemColor = "#333333",
  activeItemColor = "#007AFF",
  activeBgColor = "rgba(0, 122, 255, 0.1)",
  drawerWidth = Platform.OS === "web" ? 300 : width * 0.75,
  isOpen = false,
  onClose,
  avatarUrl,
  userName,
  userEmail,
  backgroundImage,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<{
    [key: string]: boolean;
  }>({});
  const drawerAnimation = React.useRef(
    new Animated.Value(isOpen ? 0 : -width)
  ).current;

  // Gérer les animations d'ouverture et fermeture
  useEffect(() => {
    Animated.timing(drawerAnimation, {
      toValue: isOpen ? 0 : -width,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isOpen]);

  // Gérer l'expansion/collapse des items avec sous-menus
  const toggleSubMenu = (key: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Navigation vers une route
  const navigateTo = (route: string) => {
    router.push(route);
    if (onClose) onClose();
  };

  // Vérifier si un item est actif
  const isActive = (route?: string, subItems?: DrawerSubItem[]) => {
    if (route && pathname.includes(route)) return true;
    if (subItems) {
      return subItems.some((item) => pathname.includes(item.route));
    }
    return false;
  };

  // Rendu des sous-items
  const renderSubItems = (subItems: DrawerSubItem[], parentKey: string) => {
    const isParentExpanded = expandedItems[parentKey];

    if (!isParentExpanded) return null;

    return (
      <View style={styles.subItemsContainer}>
        {subItems.map((item) => {
          const isItemActive = pathname.includes(item.route);

          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.subItem,
                isItemActive && { backgroundColor: activeBgColor },
              ]}
              onPress={() => navigateTo(item.route)}
            >
              {item.icon && (
                <View style={styles.subItemIcon}>
                  {React.cloneElement(item.icon as React.ReactElement, {
                    color: isItemActive ? activeItemColor : itemColor,
                    size: 16,
                  })}
                </View>
              )}
              <Text
                style={[
                  styles.subItemLabel,
                  { color: isItemActive ? activeItemColor : itemColor },
                ]}
              >
                {item.label}
              </Text>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  // Rendu d'un item principal
  const renderItem = (item: DrawerItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isItemActive = isActive(item.route, item.subItems);
    const isExpanded = expandedItems[item.key];

    // Calculer la rotation de l'icône d'expansion
    const arrowRotation = isExpanded ? "180deg" : "0deg";

    return (
      <View key={item.key}>
        <TouchableOpacity
          style={[
            styles.item,
            isItemActive && { backgroundColor: activeBgColor },
          ]}
          onPress={() => {
            if (hasSubItems) {
              toggleSubMenu(item.key);
            } else if (item.route) {
              navigateTo(item.route);
            }
          }}
        >
          <View style={styles.itemIconContainer}>
            {React.cloneElement(item.icon as React.ReactElement, {
              color: isItemActive ? activeItemColor : itemColor,
              size: 24,
            })}
          </View>
          <Text
            style={[
              styles.itemLabel,
              { color: isItemActive ? activeItemColor : itemColor },
            ]}
          >
            {item.label}
          </Text>

          {item.badge && !hasSubItems && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}

          {hasSubItems && (
            <View style={styles.expandIcon}>
              <View
                style={{
                  transform: [{ rotate: arrowRotation }],
                  width: 20,
                  height: 20,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 12, color: itemColor }}>▼</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>

        {hasSubItems && renderSubItems(item.subItems!, item.key)}
      </View>
    );
  };

  // Rendu du header par défaut si aucun custom n'est fourni
  const renderDefaultHeader = () => {
    if (headerComponent) return headerComponent;

    return (
      <View style={styles.headerContainer}>
        {backgroundImage ? (
          <ImageBackground
            source={{ uri: backgroundImage }}
            style={styles.headerBackground}
            resizeMode="cover"
          >
            <View style={styles.headerContent}>
              {avatarUrl && (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              )}
              {userName && <Text style={styles.userName}>{userName}</Text>}
              {userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
            </View>
          </ImageBackground>
        ) : (
          <View
            style={[styles.headerContent, { backgroundColor: activeBgColor }]}
          >
            {avatarUrl && (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            )}
            {userName && <Text style={styles.userName}>{userName}</Text>}
            {userEmail && <Text style={styles.userEmail}>{userEmail}</Text>}
          </View>
        )}
      </View>
    );
  };

  // Contenu principal du drawer
  const drawerContent = (
    <View style={[styles.container, { width: drawerWidth, backgroundColor }]}>
      {renderDefaultHeader()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map(renderItem)}
      </ScrollView>

      {footerComponent && <View style={styles.footer}>{footerComponent}</View>}
    </View>
  );

  // Overlay pour fermer le drawer en cliquant à l'extérieur
  const overlay = (
    <TouchableOpacity
      style={[
        styles.overlay,
        {
          opacity: drawerAnimation.interpolate({
            inputRange: [-width, 0],
            outputRange: [0, 0.5],
            extrapolate: "clamp",
          }),
        },
      ]}
      activeOpacity={1}
      onPress={onClose}
    />
  );

  // Rendu adapté pour web et mobile
  if (Platform.OS === "web") {
    return (
      <motion.div
        initial={{ x: -width }}
        animate={{ x: isOpen ? 0 : -width }}
        transition={{ duration: 0.25 }}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#000",
              zIndex: 999,
            }}
            onClick={onClose}
          />
        )}
        {drawerContent}
      </motion.div>
    );
  }

  return (
    <Animated.View
      style={[
        styles.drawerContainer,
        {
          transform: [
            {
              translateX: drawerAnimation,
            },
          ],
        },
      ]}
    >
      {overlay}
      {drawerContent}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 1000,
    flexDirection: "row",
  },
  container: {
    flex: 1,
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
    width: width,
    height: height,
  },
  headerContainer: {
    height: 160,
    justifyContent: "flex-end",
  },
  headerBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  headerContent: {
    padding: 16,
    height: 160,
    justifyContent: "flex-end",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginHorizontal: 8,
    marginVertical: 2,
  },
  itemIconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  expandIcon: {
    paddingLeft: 8,
  },
  subItemsContainer: {
    paddingLeft: 36,
    paddingBottom: 8,
  },
  subItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginHorizontal: 8,
    marginVertical: 1,
  },
  subItemIcon: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  subItemLabel: {
    flex: 1,
    fontSize: 13,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  footer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
});

export default DrawerNavigator;
