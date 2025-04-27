declare module "react-native" {
  import React from "react";

  // Types de base
  export type ViewStyle = any;
  export type TextStyle = any;
  export type ImageStyle = any;

  // Composants
  export const View: React.ComponentType<any>;
  export const Text: React.ComponentType<any>;
  export const TouchableOpacity: React.ComponentType<any>;
  export const ActivityIndicator: React.ComponentType<any>;
  export const Image: React.ComponentType<any>;
  export const ScrollView: React.ComponentType<any>;
  export const FlatList: React.ComponentType<any>;
  export const TextInput: React.ComponentType<any>;
  export const Button: React.ComponentType<any>;
  export const SafeAreaView: React.ComponentType<any>;
  export const StatusBar: any;
  export const Animated: any;
  export const PanResponder: any;
  export const Platform: {
    OS: "ios" | "android" | "web";
    select: (obj: any) => any;
  };

  // Utilitaires
  export const StyleSheet: {
    create: <T extends Record<string, any>>(styles: T) => T;
    hairlineWidth: number;
    absoluteFillObject: ViewStyle;
  };
  export const Dimensions: {
    get: (dim: "window" | "screen") => { width: number; height: number };
  };
  export const Easing: {
    linear: any;
    ease: any;
    out: (easing: any) => any;
    in: (easing: any) => any;
    inOut: (easing: any) => any;
  };
  export const Vibration: {
    vibrate: (pattern?: number | number[], repeat?: boolean) => void;
    cancel: () => void;
  };
  export const AppState: {
    currentState: string;
    addEventListener: (
      type: string,
      listener: (state: string) => void
    ) => { remove: () => void };
  };

  // Types pour les événements
  export type GestureResponderEvent = any;
  export type LayoutChangeEvent = any;
  export type ImageSourcePropType = any;
  export type ImageURISource = any;
  export type ScrollViewProps = any;

  // Types pour NetInfo
  export interface NetInfoState {
    type: string;
    isConnected: boolean;
    isInternetReachable: boolean | null;
    details: any;
  }

  export type NetInfoSubscription = () => void;

  // Hook useWindowDimensions
  export function useWindowDimensions(): {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
  };
}

declare module "@react-native-community/netinfo" {
  import { NetInfoState, NetInfoSubscription } from "react-native";

  interface NetInfoStateType {
    unknown: string;
    none: string;
    cellular: string;
    wifi: string;
    bluetooth: string;
    ethernet: string;
    wimax: string;
    vpn: string;
    other: string;
  }

  function addEventListener(
    listener: (state: NetInfoState) => void
  ): NetInfoSubscription;

  function fetch(): Promise<NetInfoState>;

  const NetInfo: {
    addEventListener: typeof addEventListener;
    fetch: typeof fetch;
  };

  export default NetInfo;
}

declare module "@react-native-async-storage/async-storage" {
  const AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
    mergeItem: (key: string, value: string) => Promise<void>;
    clear: () => Promise<void>;
    getAllKeys: () => Promise<string[]>;
    multiGet: (keys: string[]) => Promise<[string, string | null][]>;
    multiSet: (keyValuePairs: [string, string][]) => Promise<void>;
    multiRemove: (keys: string[]) => Promise<void>;
    multiMerge: (keyValuePairs: [string, string][]) => Promise<void>;
  };

  export default AsyncStorage;
}

declare module "framer-motion" {
  export const motion: {
    div: any;
  };
}
