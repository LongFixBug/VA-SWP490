// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
//   ScrollView,
// } from "react-native";
// import { useNavigation, useRoute } from "@react-navigation/native";
// import Icon from "react-native-vector-icons/Ionicons";
// import COLORS from "../constants/color";
// import FONTS from "../constants/font";

// const DishDetailScreen = () => {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { dish } = route.params;

//   return (
//     <ScrollView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => navigation.goBack()}>
//           <Icon name="arrow-back-outline" size={24} color={COLORS.black} />
//         </TouchableOpacity>
//         <Text style={styles.headerTitle}>Dishes detail</Text>
//         <TouchableOpacity
//           activeOpacity={0.8}
//           onPress={() => navigation.navigate("Cart")}
//         >
//           <View
//             style={{
//               height: 50,
//               width: 50,
//               marginRight: 20,
//               justifyContent: "center",
//               alignItems: "center",
//               backgroundColor: COLORS.white,
//               borderRadius: 10,
//               elevation: 0,
//             }}
//           >
//             <Icon name={"cart-outline"} size={30} color={COLORS.green} />
//             <Text style={styles.bagdeCart}>77</Text>
//           </View>
//         </TouchableOpacity>
//       </View>

//       {/* Món ăn */}
//       <View style={styles.dishInfo}>
//         <Image source={{ uri: dish.imageUrl }} style={styles.dishImage} />
//         <View style={styles.priceAndFavorite}>
//           <Text style={styles.price}>{dish.price} vnd</Text>
//           <Icon name="heart-outline" size={24} color={COLORS.black} />
//         </View>
//         <Text style={styles.dishName}>{dish.name}</Text>
//         {/* <View style={styles.dishRating}>
//           <Text style={styles.rating}>{dish.average_rating}</Text>
//           {Array.from({ length: Math.round(dish.average_rating) }, (_, i) => (
//             <Icon key={i} name="star" size={16} color="gold" />
//           ))}
//         </View> */}

//         {/* Mô tả món ăn */}
//         <Text style={styles.sectionTitle}>Mô tả</Text>
//         <Text style={styles.description}>{dish.description}</Text>

//         {/* Nguyên liệu */}
//         <Text style={styles.sectionTitle}>Nguyên liệu</Text>
//         <Text style={styles.description}>{dish.ingredients}</Text>

//         {/* Công thức */}
//         <Text style={styles.sectionTitle}>Công thức</Text>
//         <Text style={styles.description}>{dish.recipe}</Text>
//       </View>

//       {/* Đánh giá */}
//       <Text style={styles.sectionTitle}>Đánh giá</Text>
//       {/* <View style={styles.reviewList}>
//         {dish.feedbacks.map((feedback) => (
//           <View key={feedback.user_id} style={styles.reviewCard}>
//             <View style={styles.reviewHeader}>
//               <Text style={styles.username}>{feedback.username}</Text>
//               <View style={styles.reviewRating}>
//                 {Array.from({ length: Math.round(feedback.rating) }, (_, i) => (
//                   <Icon key={i} name="star" size={14} color="gold" />
//                 ))}
//               </View>
//             </View>
//             <Text style={styles.comment}>{feedback.feedback_content}</Text>
//             <Text style={styles.time}>{feedback.feedback_date}</Text>
//           </View>
//         ))}
//       </View> */}

//       {/* Nút thêm vào giỏ hàng */}
//       <View style={styles.actionButtons}>
//         <TouchableOpacity style={styles.addToCartButton}>
//           <Text style={styles.buttonText}>THÊM VÀO GIỎ HÀNG</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.buyNowButton}>
//           <Text style={styles.buttonText}>MUA NGAY</Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     padding: 20,
//   },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontFamily: FONTS.semiBold,
//     color: COLORS.black,
//   },
//   dishImage: {
//     width: "100%",
//     height: 200,
//     borderRadius: 10,
//     backgroundColor: COLORS.lightGray,
//     marginBottom: 15,
//   },
//   dishInfo: {
//     marginBottom: 20,
//   },
//   priceAndFavorite: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
//   price: {
//     fontSize: 18,
//     fontFamily: FONTS.bold,
//     color: COLORS.black,
//   },
//   dishName: {
//     fontSize: 22,
//     fontFamily: FONTS.bold,
//     color: COLORS.black,
//     marginVertical: 10,
//   },
//   dishRating: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   rating: {
//     fontSize: 16,
//     color: COLORS.black,
//     marginRight: 5,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontFamily: FONTS.semiBold,
//     marginVertical: 10,
//     color: COLORS.black,
//   },
//   description: {
//     fontSize: 14,
//     color: COLORS.grey,
//     marginBottom: 10,
//   },
//   reviewList: {
//     marginBottom: 20,
//   },
//   reviewCard: {
//     backgroundColor: COLORS.lightGray,
//     padding: 10,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   reviewHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 5,
//   },
//   username: {
//     fontSize: 14,
//     fontFamily: FONTS.bold,
//   },
//   reviewRating: {
//     flexDirection: "row",
//   },
//   comment: {
//     fontSize: 14,
//     color: COLORS.grey,
//   },
//   time: {
//     fontSize: 12,
//     color: COLORS.grey,
//   },
//   actionButtons: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 10,
//   },
//   addToCartButton: {
//     flex: 1,
//     backgroundColor: COLORS.grey,
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginRight: 10,
//     marginBottom: 40,
//   },
//   buyNowButton: {
//     flex: 1,
//     backgroundColor: COLORS.green,
//     padding: 15,
//     borderRadius: 10,
//     alignItems: "center",
//     marginBottom: 20,
//   },
//   buttonText: {
//     fontSize: 16,
//     fontFamily: FONTS.semiBold,
//     color: COLORS.white,
//   },
//   bagdeCart: {
//     fontFamily: FONTS.bold,
//     color: COLORS.white,
//     fontSize: 12,
//     width: 23,
//     height: 23,
//     textAlign: "center",
//     textAlignVertical: "center",
//     backgroundColor: COLORS.red,
//     borderRadius: 150,
//     position: "absolute",
//     top: 0,
//     right: 0,
//   },
// });

// export default DishDetailScreen;

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Swiper from "react-native-swiper";
import Icon1 from "react-native-vector-icons/MaterialCommunityIcons";
import Toast from "react-native-toast-message";

const DishDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { dish } = route.params; // Lấy dữ liệu từ route.params
  const [showMoreAttribute, setShowMoreAttribute] = React.useState(false);

  const showToastAddToCart = () => {
    Toast.show({
      type: "success",
      text1: "Thông báo",
      text2: "Thêm vào giỏ hàng thành công !👋",
    });
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          marginTop: StatusBar.currentHeight,
          marginBottom: 80,
        }}
      >
        {/* Header */}
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
            <View>
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  color: COLORS.black,
                  marginLeft: 10,
                  fontSize: 20,
                }}
              >
                Chi tiết món ăn
              </Text>
            </View>
          </TouchableOpacity>
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity activeOpacity={0.8}>
              <View
                style={{
                  height: 50,
                  width: 50,
                  marginRight: 0,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: COLORS.white,
                  borderRadius: 10,
                  elevation: 0,
                }}
              >
                <Icon name={"heart-outline"} size={30} color={COLORS.green} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate("Cart")}
            >
              <View
                style={{
                  height: 50,
                  width: 50,
                  marginRight: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: COLORS.white,
                  borderRadius: 10,
                  elevation: 0,
                }}
              >
                <Icon name={"cart-outline"} size={30} color={COLORS.green} />
                <Text style={styles.bagdeCart}>77</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Swiper cho hình ảnh món ăn */}
        <View style={{ height: 250 }}>
          <Swiper
            style={styles.wrapper}
            showsButtons={false}
            activeDotColor={COLORS.green}
            dotColor={COLORS.white}
            autoplay={false}
          >
            {/* Ảnh món ăn từ API */}
            <View style={styles.slide}>
              <Image
                source={{ uri: dish.imageUrl }} // Sử dụng ảnh từ dữ liệu
                style={styles.img}
                resizeMode="cover"
              />
            </View>
          </Swiper>
          <View
            style={{
              elevation: 2,
              position: "absolute",
              right: 10,
              bottom: 50,
              backgroundColor: COLORS.green,
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.bold,
                color: COLORS.white,
                fontSize: 17,
              }}
            >
              {dish.price}.000đ {/* Giá từ dữ liệu */}
            </Text>
          </View>
        </View>

        {/* Thông tin chi tiết món ăn */}
        <View style={{ padding: 15 }}>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              color: COLORS.black,
              fontSize: 22,
              marginBottom: 5,
            }}
          >
            {dish.name} {/* Tên món ăn */}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.medium,
              color: COLORS.grey,
              fontSize: 15,
              marginBottom: 5,
            }}
          >
            {dish.dishType} {/* Loại món ăn */}
          </Text>

          {/* Mô tả */}
          <View style={styles.containerAttribute}>
            <Text style={styles.titleAttribute}>Mô tả</Text>
            <Text style={styles.textAttribute}>{dish.description}</Text>
          </View>

          {/* Nguyên liệu */}
          {showMoreAttribute === false && (
            <>
              <TouchableOpacity
                style={{ marginTop: 5 }}
                activeOpacity={0.6}
                onPress={() => setShowMoreAttribute(!showMoreAttribute)}
              >
                <Text
                  style={{ fontFamily: FONTS.semiBold, color: COLORS.blue }}
                >
                  Xem thêm
                </Text>
              </TouchableOpacity>
            </>
          )}

          {showMoreAttribute && (
            <>
              <View style={styles.containerAttribute}>
                <Text style={styles.titleAttribute}>Nguyên liệu</Text>
                <Text style={styles.textAttribute}>{dish.ingredients}</Text>
              </View>

              {/* Công thức */}
              <View style={styles.containerAttribute}>
                <Text style={styles.titleAttribute}>Công thức</Text>
                <Text style={styles.textAttribute}>{dish.recipe}</Text>
              </View>

              <TouchableOpacity
                style={{ marginTop: 5 }}
                activeOpacity={0.6}
                onPress={() => setShowMoreAttribute(!showMoreAttribute)}
              >
                <Text
                  style={{ fontFamily: FONTS.semiBold, color: COLORS.blue }}
                >
                  Thu gọn
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Nút thêm vào giỏ hàng */}
      <View style={styles.containerButtonFloatBottom}>
        <View style={styles.boxButtonFloatBottom}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => showToastAddToCart()}
            style={{
              width: "30%",
              backgroundColor: COLORS.white,
              alignItems: "center",
              justifyContent: "center",
              marginHorizontal: 10,
              marginVertical: 10,
              borderRadius: 10,
              elevation: 2,
              borderWidth: 1,
              borderColor: COLORS.green,
            }}
          >
            <Icon name={"cart-outline"} size={30} color={COLORS.green} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate("Cart")}
            style={{
              flex: 1,
              backgroundColor: COLORS.green,
              alignItems: "center",
              justifyContent: "center",
              marginVertical: 10,
              borderRadius: 10,
              elevation: 2,
              marginRight: 10,
              borderWidth: 1,
              borderColor: COLORS.green,
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: 20,
                color: COLORS.white,
              }}
            >
              Đặt hàng
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default DishDetailScreen;

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "transparent",
    height: 80,
  },
  img: {
    width: "100%",
    height: 300,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  containerAttribute: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyPastel,
    paddingBottom: 10,
  },
  titleAttribute: {
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    fontSize: 15,
    marginBottom: 3,
  },
  textAttribute: {
    fontFamily: FONTS.medium,
    color: COLORS.grey,
    fontSize: 15,
    lineHeight: 23,
  },
  containerButtonFloatBottom: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
  },
  boxButtonFloatBottom: {
    backgroundColor: COLORS.white,
    height: 80,
    flexDirection: "row",
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGrey,
  },
  bagdeCart: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
    fontSize: 12,
    width: 23,
    height: 23,
    textAlign: "center",
    backgroundColor: COLORS.red,
    borderRadius: 150,
    position: "absolute",
    top: 0,
    right: 0,
  },
});
