import React from "react";
import { View, Modal, StyleSheet, Text } from "react-native";
import { MaterialIndicator, DotIndicator } from "react-native-indicators";
import COLORS from "../constants/color";
// const LoadingModal = (props) => {
//   return (
//     <Modal
//       animationType="fade"
//       transparent={true}
//       visible={props.modalVisible}
//       statusBarTranslucent={true}
//     >
//       <View style={styles.centeredView}>
//         <View
//           style={[
//             styles.modalView,
//             props.modalStyle,
//             props.darkMode && { backgroundColor: "#121212" },
//           ]}
//         >
//           <MaterialIndicator size={50} color={props.color || COLORS.green} />
//           {/* {props.task ?
//                         <Text style={[styles.modalText,props.fontFamily && {fontFamily:props.fontFamily}]}>{props.task}</Text>
//                         :
//                         <Text style={[styles.modalText,props.fontFamily && {fontFamily:props.fontFamily},props.darkMode && {color:'white'} ,props.textStyle]}>{props.title} Loading...</Text>
//                     } */}
//         </View>
//       </View>
//     </Modal>
//   );
// };

const LoadingModal = (props) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.modalVisible}
      statusBarTranslucent={true}
    >
      <View
        style={[
          styles.centeredView,
          props.hasBackdrop === false && { backgroundColor: "transparent" },
        ]}
      >
        <View
          style={[
            styles.modalView,
            props.modalStyle,
            props.darkMode && { backgroundColor: "#121212" },
          ]}
        >
          {/* <MaterialIndicator size={50} color={props.color || COLORS.green} /> */}
          <DotIndicator
            size={10}
            color={props.color || COLORS.green}
            count={3}
          />
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0008",
    // backgroundColor: "transparent",
  },
  modalView: {
    margin: 20,
    width: 200,
    height: 70,
    backgroundColor: "transparent",
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 0,
  },

  modalText: {
    marginVertical: 15,
    textAlign: "center",
    fontSize: 17,
    marginLeft: 15,
  },
});
