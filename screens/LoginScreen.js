import { StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import COLORS from '../constants/color'

const LoginScreen = ({navigation}) => {
  return (
    <View style={{flex: 1, backgroundColor: COLORS.blue}}>
      <Text>LoginScreen</Text>
      <Button title="Bấm zô" onPress={()=> navigation.navigate("Home")}/>

    </View>
  )
}

export default LoginScreen

const styles = StyleSheet.create({})