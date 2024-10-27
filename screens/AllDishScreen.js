import {
  StyleSheet,
  View,
  Image,
  Text,
  StatusBar,
  TouchableOpacity,
  Alert,
  TextInput,
  Button,
  ScrollView,
  FlatList,
  Keyboard,
} from "react-native";
import React from "react";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../components/Header";

const dataDishType = [
  {
    id: 0,
    name: "Tất cả",
    status: true,
  },
  {
    id: 1,
    name: "Món khai vị",
  },
  {
    id: 2,
    name: "Món chính",
  },
  {
    id: 3,
    name: "Món tráng miệng",
  },
  {
    id: 4,
    name: "Đồ uống",
  },
];

const dataDish = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const AllDishScreen = ({ navigation, route }) => {
  const fromSearch = route.params?.fromSearch;
  const [currentDishType, setCurrenDishType] = React.useState(0);

  const textInputRef = React.useRef(null);
  if (dataDish.length % 2 !== 0) {
    dataDish.push({ id: "dummy", name: "" });
  }

  return (
    <>
      {/* <Header
        title={"Món ăn"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"search"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
        // onPressRight={() => setShowModalInformation(!showModalInformation)}
      /> */}
      <View style={styles.top}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.goBack()}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <View
            style={{
              height: 50,
              width: 50,
              marginLeft: 20,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: COLORS.white,
              borderRadius: 10,
              elevation: 0,
            }}
          >
            <Icon name="arrow-back-outline" size={28} color={COLORS.green} />
          </View>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <TextInput
            autoFocus={fromSearch === true}
            style={{
              fontFamily: FONTS.medium,
              fontSize: 19,
              paddingVertical: 5,
              paddingHorizontal: 10,
            }}
            placeholder="Tìm kiếm món ăn..."
          />
        </View>
      </View>
      <View style={{ backgroundColor: COLORS.white, paddingBottom: 10 }}>
        <View style={{ flexDirection: "row", marginLeft: 20 }}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              borderWidth: 1,
              borderColor: COLORS.grey,
              borderRadius: 8,
              paddingHorizontal: 10,
              justifyContent: "center",
              backgroundColor: COLORS.grey,
              marginRight: 10,
            }}
          >
            <Icon name="filter" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {dataDishType.map((item, index) => (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setCurrenDishType(item.id)}
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor:
                    item.id === currentDishType
                      ? COLORS.green
                      : COLORS.lightGrey,
                  marginRight: 10,
                  borderRadius: 8,
                  backgroundColor:
                    item.id === currentDishType ? COLORS.green : COLORS.white,
                }}
                key={index}
              >
                <Text
                  style={{
                    fontFamily:
                      item.id === currentDishType
                        ? FONTS.semiBold
                        : FONTS.medium,
                    fontSize: 15,
                    color:
                      item.id === currentDishType
                        ? COLORS.white
                        : COLORS.greySolid,
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      <FlatList
        data={dataDish}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        renderItem={({ item, index }) =>
          item.id === "dummy" ? (
            <View style={styles.dummyItem}>
              <Text></Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("DishDetail")}
              style={styles.gridItem}
            >
              <Image
                source={{
                  uri: "https://nld.mediacdn.vn/291774122806476800/2023/6/1/2561434bcfe611b848f7-16856155291601981016037.jpg",
                }}
                style={{
                  width: "100%",
                  height: 100,
                  resizeMode: "cover",
                }}
              />
              <View style={{ padding: 5 }}>
                <Text style={styles.textNameDish} numberOfLines={1}>
                  Xôi hạt sen
                </Text>
                <Text style={styles.textDishType}>Món khai vị</Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flexDirection: "row" }}>
                    <Icon name="star" size={16} color={COLORS.star} />
                    <Text style={styles.textDishType} numberOfLines={1}>
                      {" "}
                      3,5
                    </Text>
                  </View>
                  <Text style={styles.textDishType}>15.000đ</Text>
                </View>
              </View>
            </TouchableOpacity>
          )
        }
        style={{
          padding: 10,
          paddingTop: 0,
          backgroundColor: COLORS.white,
        }}
      />
    </>
  );
};

export default AllDishScreen;

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    backgroundColor: "transparent",
    height: 80,
    marginTop: StatusBar.currentHeight,
    backgroundColor: COLORS.white,
  },
  gridItem: {
    flex: 1,
    margin: 10,
    backgroundColor: COLORS.white,
    elevation: 1,
    borderRadius: 8,
    overflow: "hidden",
  },
  dummyItem: {
    flex: 1,
    margin: 10,
    backgroundColor: "transparent",
  },
  textNameDish: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  textDishType: {
    color: COLORS.grey,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
});
