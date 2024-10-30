import { StyleSheet, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import React from 'react';
import COLORS from '../constants/color';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  const goToHome = () => {
    // Chuyển sang HomeScreen khi bấm vào
    navigation.replace('Home');
  };

  return (
    <TouchableOpacity style={styles.container} onPress={goToHome}>
      <Image
        source={require('../assets/VegetarianAssistantBackground.png')}
        resizeMode="cover"
        style={styles.backgroundImage}
      />
    </TouchableOpacity>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
});
