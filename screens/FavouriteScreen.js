import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import React from "react";
import Header from "../components/Header";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";

const favouriteList = [
    {
      id: "1",
      name: "Đậu hũ ki",
      time: "23",
      image:
        "https://cellphones.com.vn/sforum/wp-content/uploads/2023/09/mon-chay-ngon-de-lam-1.jpg",
      latitude: 10.8441,
      longitude: 106.78288,
    },
    {
      id: "2",
      name: "Sườn non",
      time: "70",
      image:
        "https://file.hstatic.net/1000341804/file/canh-chay-ngu-sac_dafc5d8509b64f6c82afc1477065ed66_grande.jpeg",
      latitude: 10.790032685611157,
      longitude: 106.68744825401734,
    },
    {
      id: "3",
      name: "A Mà Kitchen",
      time: "60",
      image:
        "https://cdn.nguyenkimmall.com/images/companies/_1/tin-tuc/kinh-nghiem-meo-hay/n%E1%BA%A5u%20%C4%83n/canh-bong-h%E1%BA%B9-n%E1%BA%A5u-n%E1%BA%A5m.jpg.jpg",
      latitude: 10.7768469439067,
      longitude: 106.69026283867206,
    },
    {
      id: "4",
      name: "King BBQ",
      time: "50",
      image:
        "https://tiki.vn/blog/wp-content/uploads/2023/08/8DLbexQE5KIiDOBbhCUf0Myl39csYt_YRWOInLorMpT-6l-b4bFEwNXhj23bIUfqc9oDSv5f64GuEeMKWtPZIgQe_fm1BeGuTBlZ2GqWo_AMUFNfYo8mFqsVjn7iQe0zzAC_uiAa7dVlxUFLtndk3s.png",
      latitude: 10.847411218830398,
      longitude: 106.7762775617879,
    },
    {
      id: "5",
      name: "Hanuri-Korean Fast Food",
      time: "70",
      image:
        "https://storage.googleapis.com/ops-shopee-files-live/live/shopee-blog/2021/04/mon-kho-chay-2.jpg",
      latitude: 10.775871102987148,
      longitude: 106.68727154052584,
    },

    {
      id: "7",
      name: "Maison Mận-Đỏ",
      time: "75",
      image:
        "https://cdn.nguyenkimmall.com/images/companies/_1/tin-tuc/kinh-nghiem-meo-hay/n%E1%BA%A5u%20%C4%83n/dau-phu-sot-nam-dong-co.jpg",
      latitude: 10.793057450832194,
      longitude: 106.69022156701138,
    },
    {
        id: "8",
        name: "Maison Mận-Đỏ",
        time: "75",
        image:
          "https://cdn.nguyenkimmall.com/images/companies/_1/tin-tuc/kinh-nghiem-meo-hay/n%E1%BA%A5u%20%C4%83n/dau-phu-sot-nam-dong-co.jpg",
        latitude: 10.793057450832194,
        longitude: 106.69022156701138,
      },
  ];


const menuList = [
    {
        id: '1',
        name: 'Menu 1',
        calo: '950 kcal'
    },
    {
        id: '2',
        name: 'Menu 2',
        calo: '1250 kcal'
    },
    {
        id: '3',
        name: 'Menu 3',
        calo: '1000 kcal'
    },
    {
        id: '4',
        name: 'Menu 4',
        calo: '4000 kcal'
    }
]
const dataTabView = [
  {
    id: 1,
    name: "Món ăn",
  },
  {
    id: 2,
    name: "Menu",
  },
];

const FavouriteScreen = ({navigation}) => {

  const [currentTabView, setCurrentTabView] = React.useState(1);

  return (
    <View>
       <Header
        title={"Yêu thích"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"menu"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
        // onPressRight={() => setShowModalInformation(!showModalInformation)}
      />
       <View style={{ flexDirection: "row" }}>
        {dataTabView.map((tabView, index) => (
          <TouchableOpacity
            activeOpacity={0.8}
            key={index}
            onPress={() => setCurrentTabView(tabView.id)}
            style={{
              flex: 1,
              alignItems: "center",
              alignSelf: "center",
              paddingVertical: 20,
              borderBottomWidth: 3,
              borderBottomColor: currentTabView === tabView.id ? COLORS.green : COLORS.greyPastel,
              backgroundColor:  COLORS.white,
              borderTopWidth: 1,
              borderTopColor: COLORS.greyPastel
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.bold,
                fontSize: 16,
                color:
                  currentTabView === tabView.id ? COLORS.green : COLORS.black,
              }}
            >
              {tabView.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {currentTabView === 1 &&
        <FlatList
        showsVerticalScrollIndicator={false}
        data={favouriteList}
        renderItem={({item, index}) =>
            (
                <TouchableOpacity
                // onPress={() => {navigation.navigate("PostDetail", {post_id: item._id})}}
                activeOpacity={0.8}
                key={index}
                style={
                  {
                    backgroundColor: COLORS.white,
                    padding: 10,
                    marginHorizontal: 15,
                    marginBottom: 5,
                    flexDirection: "row",
                    borderBottomWidth:2,
                    borderBottomColor: COLORS.greyPastel
                  }
                }
              >
                <Image
                  source={{ uri: item.image }}
                  style={{ height: 100, width: 120, borderRadius: 5 }}
                />
                <View
                  style={{
                    flex: 1,
                    padding: 10,
                    paddingLeft: 20,
                    paddingTop: 5
                  }}
                >
                  <Text style={{ fontFamily: FONTS.semiBold, fontSize: 15 }} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.semiBold,
                      fontSize: 13,
                      color: COLORS.grey,
                      marginTop: 5
                    }}
                  >
                    Món khai vị
                  </Text>
                  <Text
                      style={{
                        fontFamily: FONTS.semiBold,
                        fontSize: 15,
                        color: COLORS.green,
                        marginTop: 5,
                      }}
                    >
                      15.000đ
                  </Text>
                </View>
                <Icon  name="trash-outline" color={COLORS.orange} size={24} style={{alignSelf: 'flex-end'}}/> 
              </TouchableOpacity>
            )
        }
        keyExtractor={(item) => item._id}
        style={{backgroundColor: COLORS.white, paddingTop: 10}}
        />

      }
      {currentTabView === 2 &&
        <FlatList
        showsVerticalScrollIndicator={false}
        data={menuList}
        renderItem={({item, index}) =>
            (
                <TouchableOpacity
                // onPress={() => {navigation.navigate("PostDetail", {post_id: item._id})}}
                activeOpacity={0.8}
                key={index}
                style={
                  {
                    backgroundColor: COLORS.white,
                    padding: 10,
                    marginHorizontal: 15,
                    marginBottom: 5,
                    flexDirection: "row",
                    borderBottomWidth:2,
                    borderBottomColor: COLORS.greyPastel
                  }
                }
              >
                <View
                  style={{
                    flex: 1,
                    padding: 10,
                    paddingLeft: 20,
                    paddingTop: 5
                  }}
                >
                  <Text style={{ fontFamily: FONTS.semiBold, fontSize: 15 }} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.semiBold,
                      fontSize: 13,
                      color: COLORS.grey,
                      marginTop: 5
                    }}
                  >
                    {item.calo}
                  </Text>
                </View>
                <Icon  name="trash-outline" color={COLORS.orange} size={24} style={{alignSelf: 'flex-end'}}/> 
              </TouchableOpacity>
            )
        }
        keyExtractor={(item) => item._id}
        style={{backgroundColor: COLORS.white, paddingTop: 10}}
        />

      }      

    </View>
  )
}

export default FavouriteScreen

const styles = StyleSheet.create({})