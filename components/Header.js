import React from 'react'
import { SafeAreaView, StyleSheet, View, Text, Dimensions, Pressable, StatusBar } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/color';
import FONTS from '../constants/font';

export default function Header({ title, rightIcon, leftIcon ,onPress, onPressRight, colorText, colorBackground, colorLeftIcon, colorRightIcon }) {
    return (
        <SafeAreaView>
            <View style={[styles.top,{backgroundColor: colorBackground || COLORS.orange}]}>
                <View style={{flexDirection: 'row'}}>
                <Pressable onPress={onPress}>
                    <View style={{ height: 50, width: 50, marginLeft: 20, justifyContent: 'center', alignItems: "center" }}>
                        <Icon name={leftIcon ? leftIcon : "arrow-back-outline"} size={28} color={colorLeftIcon || COLORS.green  } />
                    </View>
                </Pressable>
                <View style={{ justifyContent: 'center', marginLeft: 10, }}>                   
                        <Text style={[styles.textTitle, {color: colorText || COLORS.white}]}>{title}</Text>
                </View>
                </View>
                <Pressable onPress={onPressRight}>
                <View 
                    style={{ 
                        marginRight: 20, 
                        width:40, 
                        height: 40,
                        justifyContent: 'center' }}>
                        <Icon name={rightIcon} size={30} color={colorRightIcon || COLORS.green} />
                </View>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    top: {
        marginTop: StatusBar.currentHeight,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.orange,
        height: 80
    },
    textTitle: {
        fontSize: 20,
        color: COLORS.white,
        fontFamily: FONTS.bold
    },
});


