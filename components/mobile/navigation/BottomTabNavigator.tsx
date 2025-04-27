import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

// Types pour les items de navigation
export interface TabItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  route: string;
  badge?: number;
}

interface BottomTabNavigatorProps {
  tabs: TabItem[];
  activeTintColor?: string;
  inactiveTintColor?: string;
  backgroundColor?: string;
  animationType?: "slide" | "fade" | "scale" | "none";
  badgeColor?: string;
}

const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({
  tabs,
  activeTintColor = "#007AFF",
  inactiveTintColor = "#8E8E93",
  backgroundColor = "#FFFFFF",
  animationType = "slide",
  badgeColor = "#FF3B30",
}) => {
  const router = useRouter();
  const pathname = usePathname();

  // Animation pour le tab actif
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Trouver l'index du tab actif basé sur le pathname
    const index = tabs.findIndex((tab) => pathname.includes(tab.route));
    if (index !== -1) {
      setActiveTabIndex(index);
      // Animer la transition
      Animated.timing(animatedValue, {
        toValue: index,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [pathname, tabs]);

  const getAnimationStyle = (index: number) => {
    if (animationType === "none" || Platform.OS === "web") return {};

    if (animationType === "slide") {
      return {
        transform: [
          {
            translateY: animatedValue.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [8, 0, 8],
              extrapolate: "clamp",
            }),
          },
        ],
      };
    }

    if (animationType === "fade") {
      return {
        opacity: animatedValue.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0.7, 1, 0.7],
          extrapolate: "clamp",
        }),
      };
    }

    if (animationType === "scale") {
      return {
        transform: [
          {
            scale: animatedValue.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0.8, 1.1, 0.8],
              extrapolate: "clamp",
            }),
          },
        ],
      };
    }

    return {};
  };

  const handleTabPress = (route: string, index: number) => {
    setActiveTabIndex(index);
    router.push(route);
  };

  // Composant adaptable pour web/natif
  const TabItem = ({ item, index }: { item: TabItem; index: number }) => {
    const isActive = index === activeTabIndex;
    const color = isActive ? activeTintColor : inactiveTintColor;

    // Utiliser Framer Motion sur le web, et Animated sur natif
    if (Platform.OS === "web") {
      return (
        <motion.div
          whileTap={{ scale: 0.95 }}
          style={styles.tabItemContainer}
          initial={false}
          animate={{
            y: isActive ? -5 : 0,
            scale: isActive ? 1.05 : 1,
          }}
          transition={{ duration: 0.2 }}
        >
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => handleTabPress(item.route, index)}
          >
            <View
              style={[styles.iconContainer, { opacity: isActive ? 1 : 0.7 }]}
            >
              {React.cloneElement(item.icon as React.ReactElement, { color })}
              {item.badge && item.badge > 0 && (
                <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                  <Text style={styles.badgeText}>
                    {item.badge > 99 ? "99+" : item.badge}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.label, { color }]}>{item.label}</Text>
          </TouchableOpacity>
        </motion.div>
      );
    }

    return (
      <Animated.View
        style={[styles.tabItemContainer, getAnimationStyle(index)]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => handleTabPress(item.route, index)}
        >
          <View style={styles.iconContainer}>
            {React.cloneElement(item.icon as React.ReactElement, { color })}
            {item.badge && item.badge > 0 && (
              <View style={[styles.badge, { backgroundColor: badgeColor }]}>
                <Text style={styles.badgeText}>
                  {item.badge > 99 ? "99+" : item.badge}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.label, { color }]}>{item.label}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {tabs.map((item, index) => (
        <TabItem key={item.key} item={item} index={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 65,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  tabItemContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  iconContainer: {
    position: "relative",
  },
  label: {
    fontSize: 10,
    marginTop: 3,
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
});

export default BottomTabNavigator;
