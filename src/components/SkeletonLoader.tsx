import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../constants/colors';
import { scale } from '../utils/responsive';

interface SkeletonLoaderProps {
  count?: number;
  height?: number;
  width?: string | number;
  style?: any;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 3,
  height = scale(16),
  width = '100%',
  style,
}) => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.skeleton,
            {
              height,
              width,
              opacity,
              marginBottom: index < count - 1 ? scale(8) : 0,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: scale(6),
  },
});

export default SkeletonLoader;
