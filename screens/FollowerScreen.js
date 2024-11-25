import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import React from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import { ButtonFlex } from "../components/Button";

const dataTabView = [
  {
    id: 1,
    name: "Người theo dõi",
  },
  {
    id: 2,
    name: "Đang theo dõi",
  },
];

const dataFollower = Array.from({ length: 4 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const dataFollowing = Array.from({ length: 24 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const FollowerScreen = ({ navigation }) => {
  const [currentTabView, setCurrentTabView] = React.useState(1);

  return (
    <>
      <Header
        title={"Theo dõi"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"people-outline"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }}>
        <Image
          source={{
            uri: "https://scontent.fsgn5-15.fna.fbcdn.net/v/t39.30808-1/460162027_3425082664458663_2472010034202593960_n.jpg?stp=dst-jpg_s200x200&_nc_cat=111&ccb=1-7&_nc_sid=0ecb9b&_nc_ohc=nznu1u04tbYQ7kNvgECV6Ea&_nc_zt=24&_nc_ht=scontent.fsgn5-15.fna&_nc_gid=AbagoHe_7rxClBPMY59F8Lj&oh=00_AYAqoVPN5ajKA3cj0SlcEoWZxG5-MSCuq-a5Fs8ZFmEsBQ&oe=671E8B22",
          }}
          style={{
            width: 120,
            height: 120,
            borderRadius: 100,
            borderWidth: 5,
            borderColor: COLORS.white,
            alignSelf: "center",
          }}
        />
        <Text
          style={{
            fontFamily: FONTS.semiBold,
            fontSize: 17,
            alignSelf: "center",
            marginTop: 10,
          }}
        >
          Nguyễn Hải Long
        </Text>
        <View
          style={{
            flexDirection: "row",
            marginTop: 10,
            backgroundColor: COLORS.white,
            borderRadius: 10,
            elevation: 2,
            marginBottom: 15,
            marginHorizontal: 20,
          }}
        >
          {dataTabView.map((item, index) => (
            <TouchableOpacity
              activeOpacity={0.8}
              key={index}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 15,
              }}
              onPress={() => setCurrentTabView(item.id)}
            >
              <Text
                style={{
                  fontFamily: FONTS.semiBold,
                  fontSize: 16,
                  color:
                    currentTabView === item.id ? COLORS.green : COLORS.black,
                  marginBottom: 3,
                }}
              >
                165
                {/* lấy list theo dõi hoặc đang theo dõi .length vào */}
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  fontSize: 15,
                  color:
                    currentTabView === item.id ? COLORS.green : COLORS.black,
                }}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {currentTabView === 1 && (
          <View
            style={{
              paddingHorizontal: 20,
              marginHorizontal: 20,
              backgroundColor: COLORS.white,
              elevation: 1,
              borderRadius: 10,
              marginBottom: 20,
              paddingTop: 20,
            }}
          >
            {dataFollower.map((item, index) => (
              <TouchableOpacity
                activeOpacity={0.8}
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{
                      uri: "https://lifehacker.com/imagery/articles/01HF2GKNRQZ4MN1YA639Q53NQV/hero-image.fill.size_1248x702.v1699833590.png",
                    }}
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 100,
                      resizeMode: "cover",
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      fontSize: 15,
                      color: COLORS.black,
                      marginLeft: 10,
                    }}
                  >
                    Long Nguyễn
                  </Text>
                </View>
                <View style={{ minWidth: 90 }}>
                  {/* item.id % 2 === 0 là minh họa, Tương tự với thuộc tính theo dõi hoặc không theo dõi */}
                  {item.id % 2 === 0 ? (
                    <ButtonFlex
                      title={"Theo dõi"}
                      stylesButton={{
                        elevation: 3,
                        backgroundColor: COLORS.green,
                        borderRadius: 5,
                        elevation: 1,
                        alignSelf: "stretch",
                      }}
                      stylesText={{ fontSize: 13, fontFamily: FONTS.medium }}
                      //   onPress={()=>{}}
                    />
                  ) : (
                    <ButtonFlex
                      title={"Hủy"}
                      stylesButton={{
                        elevation: 3,
                        backgroundColor: COLORS.orange,
                        borderRadius: 5,
                        elevation: 1,
                        alignSelf: "stretch",
                      }}
                      stylesText={{ fontSize: 13, fontFamily: FONTS.medium }}
                      //   onPress={()=>{}}
                    />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {currentTabView === 2 && (
          <View
            style={{
              paddingHorizontal: 20,
              marginHorizontal: 20,
              backgroundColor: COLORS.white,
              elevation: 1,
              borderRadius: 10,
              marginBottom: 20,
              paddingTop: 20,
            }}
          >
            {dataFollowing.map((item, index) => (
              <TouchableOpacity
                activeOpacity={0.8}
                key={index}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <Image
                    source={{
                      uri: "https://www.enewsletterhome.com/_eNewsletter/2020/2007_J_avatar.jpg?",
                    }}
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 100,
                      resizeMode: "cover",
                    }}
                  />
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      fontSize: 15,
                      color: COLORS.black,
                      marginLeft: 10,
                      flexShrink: 1,
                    }}
                  >
                    Sea Dragon Nguyen
                  </Text>
                </View>
                <ButtonFlex
                  title={"Hủy"}
                  stylesButton={{
                    elevation: 3,
                    backgroundColor: COLORS.orange,
                    borderRadius: 5,
                    elevation: 1,
                  }}
                  stylesText={{ fontSize: 13, fontFamily: FONTS.medium }}
                  //   onPress={()=>{}}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
};

export default FollowerScreen;

const styles = StyleSheet.create({});

// import React, { useState, useEffect } from "react";
// import {
//   StyleSheet,
//   View,
//   Image,
//   Text,
//   TouchableOpacity,
//   TextInput,
//   ScrollView,
//   Alert,
// } from "react-native";
// import COLORS from "../constants/color";
// import FONTS from "../constants/font";
// import Icon from "react-native-vector-icons/Ionicons";
// import Header from "../components/Header";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Dropdown } from "react-native-element-dropdown";

// const CheckoutScreen = ({ navigation }) => {
//   const [currentPayment, setCurrentPayment] = useState("COD");
//   const [userId, setUserId] = useState(null);
//   const [deliveryInfo, setDeliveryInfo] = useState({});
//   const [cartDetails, setCartDetails] = useState([]);
//   const [detailedCartItems, setDetailedCartItems] = useState([]);
//   const [totalPrice, setTotalPrice] = useState(0);
//   const [discountRate, setDiscountRate] = useState(0);
//   const [finalPrice, setFinalPrice] = useState(0);
//   const [tierInfo, setTierInfo] = useState(null);
//   const [note, setNote] = useState("");
//   const [deliveryFee, setDeliveryFee] = useState(0);
//   const [loading, setLoading] = useState(false); // Ensure setLoading exist
//   const [orderId, setOrderId] = useState(null); // Initialize orderId stat
//   const [discountOptions, setDiscountOptions] = useState([]);
//   const [selectedDiscount, setSelectedDiscount] = useState(0);

//   const fetchWithAuth = async (url, options = {}) => {
//     const token = await AsyncStorage.getItem("authToken");

//     if (!token) {
//       console.error("Không tìm thấy token.");
//       throw new Error("Unauthorized: Missing token");
//     }

//     const headers = {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//       ...options.headers,
//     };

//     try {
//       const response = await fetch(url, { ...options, headers });
//       if (response.status === 401) {
//         console.error("Token hết hạn hoặc không hợp lệ.");
//       }
//       return response;
//     } catch (error) {
//       console.error("Error fetching with auth:", error);
//       throw error;
//     }
//   };

//   const discountColors = {
//     0: { color: COLORS.grey, text: "Không sử dụng giảm giá" },
//     0.1: { color: COLORS.green, text: "Giảm giá 10%" },
//     0.2: { color: COLORS.star, text: "Giảm giá 20%" },
//     0.3: { color: COLORS.orange, text: "Giảm giá 30%" },
//   };

//   const parseAddress = (fullAddress) => {
//     if (!fullAddress) return { province: "", district: "", address: "" };
//     const parts = fullAddress.split(", ");
//     return {
//       province: parts[0] || "",
//       district: parts[1] || "",
//       address: parts[2] || "",
//     };
//   };

//   const { province, district, address } = parseAddress(deliveryInfo.address);

//   const dataPayment = [
//     { id: "COD", name: "Thanh toán khi nhận hàng" },
//     { id: "QR", name: "Thanh toán qua QR code" },
//   ];

//   useEffect(() => {
//     const getUserIdFromStorage = async () => {
//       try {
//         const storedUserId = await AsyncStorage.getItem("userId");
//         if (storedUserId) {
//           setUserId(storedUserId);
//           await fetchDeliveryInfo(storedUserId);
//           await fetchCartDetails(storedUserId);
//           // await fetchTierInfo(storedUserId);
//           await fetchDiscountHistory(storedUserId); // Lấy danh sách giảm giá
//         } else {
//           console.log("Không tìm thấy User ID trong AsyncStorage");
//         }
//       } catch (error) {
//         console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
//       }
//     };
//     getUserIdFromStorage();
//   }, []);

//   const fetchCoordinates = async (address) => {
//     if (!address) {
//       console.error("Địa chỉ không hợp lệ.");
//       return null;
//     }

//     try {
//       // Gọi OpenCage Geocoder API
//       const response = await fetch(
//         `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
//           address
//         )}&key=8c52d2ca976a45b08c2b774e6167ca75`
//       );

//       if (!response.ok) {
//         throw new Error("Không thể gọi OpenCage API.");
//       }

//       const data = await response.json();
//       console.log("OpenCage API response:", data);

//       // Kiểm tra kết quả và lấy tọa độ
//       if (data.results && data.results.length > 0) {
//         const { lat, lng } = data.results[0].geometry;
//         console.log("Tọa độ:", { latitude: lat, longitude: lng });
//         return { latitude: lat, longitude: lng };
//       } else {
//         console.error("Không tìm thấy tọa độ cho địa chỉ này.");
//         return null;
//       }
//     } catch (error) {
//       console.error("Lỗi khi gọi OpenCage API:", error.message);
//       return null;
//     }
//   };

//   const fetchDeliveryFee = async (customerAddress) => {
//     try {
//       console.log("Địa chỉ khách hàng:", customerAddress);

//       // Store's fixed location (FPT University, District 9)
//       const shopLocation = {
//         latitude: 10.84102,
//         longitude: 106.80606,
//       };

//       // Get customer coordinates from their address
//       const customerLocation = await fetchCoordinates(customerAddress);
//       if (!customerLocation) {
//         Alert.alert("Lỗi", "Không thể lấy tọa độ từ địa chỉ khách hàng.");
//         return;
//       }
//       console.log("Tọa độ khách hàng:", customerLocation);

//       const shippingFeePayload = {
//         shopLocation,
//         customerLocation,
//         shippingFeeUnit: 100,
//       };
//       console.log(
//         "Payload gửi đến API tính phí giao hàng:",
//         shippingFeePayload
//       );

//       const response = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/calculate-shipping-fee`,
//         {
//           method: "POST",
//           body: JSON.stringify(shippingFeePayload),
//         }
//       );

//       // Lấy phản hồi dạng text
//       const responseText = await response.text();
//       console.log("Phản hồi từ API:", responseText);

//       if (!response.ok) {
//         console.error("Response status:", response.status);
//         throw new Error("Không thể tính phí giao hàng.");
//       }

//       // Xử lý nếu phản hồi là một số
//       const shippingFee = parseFloat(responseText); // Chuyển thành số thực
//       if (!isNaN(shippingFee)) {
//         console.log("Phí giao hàng:", shippingFee);
//         setDeliveryFee(shippingFee);
//         setFinalPrice(totalPrice - totalPrice * discountRate + shippingFee);
//       } else {
//         console.error("Phản hồi không phải là số hợp lệ:", responseText);
//         throw new Error("Phản hồi không hợp lệ từ API tính phí.");
//       }
//     } catch (error) {
//       console.error("Lỗi khi tính phí giao hàng:", error.message);
//       Alert.alert("Lỗi", "Không thể tính phí giao hàng.");
//     }
//   };

//   const fetchDeliveryInfo = async (id) => {
//     try {
//       // Gọi API để lấy thông tin giao hàng
//       const response = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/getDeliveryInformationByUserId /${id}`
//       );

//       if (!response.ok) {
//         console.error("API trả về trạng thái không hợp lệ:", response.status);
//         throw new Error(`Error: ${response.status} - ${response.statusText}`);
//       }

//       // Kiểm tra dữ liệu phản hồi
//       const data = await response.json();
//       if (!data) {
//         console.error("API không trả về dữ liệu hợp lệ.");
//         return;
//       }

//       console.log("Delivery info:", data);
//       setDeliveryInfo(data);

//       // Tính phí giao hàng sau khi nhận được thông tin
//       if (data.address) {
//         await fetchDeliveryFee(data.address);
//       }
//     } catch (error) {
//       console.error("Error fetching delivery info:", error.message);
//       Alert.alert(
//         "Lỗi",
//         "Không thể lấy thông tin giao hàng. Vui lòng thử lại sau."
//       );
//     }
//   };

//   const fetchCartDetails = async (id) => {
//     try {
//       const response = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/carts/getCartByUserId/${id}`
//       );
//       const cartData = await response.json();
//       console.log("Cart details:", cartData);

//       let total = 0;
//       let items = [];

//       for (const item of cartData) {
//         if (item.quantity > 0) {
//           const dishResponse = await fetchWithAuth(
//             `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/dishs/GetDishByID/${item.dishId}`
//           );
//           const dishData = await dishResponse.json();
//           console.log("Dish data:", dishData);

//           items.push({ ...dishData, quantity: item.quantity });
//           total += dishData.price * item.quantity;
//         }
//       }

//       setDetailedCartItems(items);
//       setTotalPrice(total);
//       setFinalPrice(total - total * discountRate); // Tính tổng sau chiết khấu
//     } catch (error) {
//       console.error("Error fetching cart details:", error);
//     }
//   };

//   // const fetchTierInfo = async (id) => {
//   //   try {
//   //     const response = await fetchWithAuth(
//   //       `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/membership/${id}`
//   //     );
//   //     const tierData = await response.json();
//   //     console.log("Tier info:", tierData);

//   //     if (tierData.tierId) {
//   //       const tierResponse = await fetchWithAuth(
//   //         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/membershipTier/${tierData.tierId}`
//   //       );
//   //       const tierDetails = await tierResponse.json();
//   //       console.log("Tier details:", tierDetails);

//   //       setTierInfo(tierDetails);
//   //       setDiscountRate(tierDetails.discountRate);
//   //       setFinalPrice(totalPrice - totalPrice * tierDetails.discountRate);
//   //     }
//   //   } catch (error) {
//   //     console.log("Error fetching tier info:", error);
//   //   }
//   // };

//   // const fetchTierInfo = async () => {
//   //   try {
//   //     const membershipData = await AsyncStorage.getItem("membershipData");

//   //     if (membershipData) {
//   //       const tierDetails = JSON.parse(membershipData);
//   //       console.log("Tier details from AsyncStorage:", tierDetails);

//   //       setTierInfo(tierDetails);

//   //       // Tạo danh sách tùy chọn giảm giá dựa trên tier
//   //       const options = [{ id: 0, name: "Không sử dụng giảm giá", rate: 0 }];
//   //       if (tierDetails.tierName === "Silver") {
//   //         options.push({ id: 1, name: "Giảm giá 10%", rate: 0.1 });
//   //       } else if (tierDetails.tierName === "Gold") {
//   //         options.push(
//   //           { id: 1, name: "Giảm giá 10% (bậc Silver)", rate: 0.1 },
//   //           { id: 2, name: "Giảm giá 20% (bậc Gold)", rate: 0.2 }
//   //         );
//   //       } else if (tierDetails.tierName === "Platinum") {
//   //         options.push(
//   //           { id: 1, name: "Giảm giá 10% (bậc Silver)", rate: 0.1 },
//   //           { id: 2, name: "Giảm giá 20% (bậc Gold)", rate: 0.2 },
//   //           { id: 3, name: "Giảm giá 30% (bậc Platinum)", rate: 0.3 }
//   //         );
//   //       }

//   //       setDiscountOptions(options);
//   //       setSelectedDiscount(0); // Mặc định không sử dụng giảm giá
//   //     } else {
//   //       console.log("No membership data found in AsyncStorage.");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching tier info from AsyncStorage:", error);
//   //   }
//   // };

//   // useEffect(() => {
//   //   fetchTierInfo();
//   // }, []);

//   useEffect(() => {
//     // Tính toán finalPrice khi totalPrice, deliveryFee, hoặc selectedDiscount thay đổi
//     const selectedOption = discountOptions.find(
//       (option) => option.id === selectedDiscount
//     );
//     const discountRate = selectedOption ? selectedOption.rate : 0;

//     setFinalPrice(totalPrice - totalPrice * discountRate + deliveryFee);
//   }, [totalPrice, deliveryFee, selectedDiscount, discountOptions]);

//   // const fetchDeliveryFee = async () => {
//   //   try {
//   //     const queryParams = new URLSearchParams({
//   //       pick_province: "Hồ Chí Minh",
//   //       pick_district: "Quận 9",
//   //       province: deliveryInfo.province || "Hồ Chí Minh",
//   //       district: deliveryInfo.district || "Quận 12",
//   //       address: deliveryInfo.address || "338/10 Đ. Lê Thị Riêng",
//   //       weight: 1000,
//   //       value: totalPrice,
//   //     }).toString();

//   //     const response = await fetchWithAuth(
//   //       `https://services.giaohangtietkiem.vn/services/shipment/fee?${queryParams}`,
//   //       {
//   //         method: "GET",
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //           token: "35j4uHBQNjODAEOrWBlA23Sscp3TicIQ0k4mN2",
//   //         },
//   //       }
//   //     );

//   //     const data = await response.json();
//   //     console.log("Dữ liệu phí giao hàng:", data);

//   //     if (data && data.fee) {
//   //       setDeliveryFee(data.fee.fee);
//   //       setFinalPrice(totalPrice - totalPrice * discountRate + data.fee.fee);
//   //     } else {
//   //       Alert.alert("Lỗi", "Không thể lấy phí giao hàng.");
//   //     }
//   //   } catch (error) {
//   //     console.error("Lỗi khi lấy phí giao hàng:", error);
//   //   }
//   // };

//   const handleCheckout = async () => {
//     const validCartItems = detailedCartItems.filter(
//       (item) => item.quantity > 0
//     );

//     if (validCartItems.length === 0) {
//       Alert.alert("Thông báo", "Giỏ hàng trống.");
//       return;
//     }

//     const orderData = {
//       userId,
//       totalPrice: finalPrice,
//       deliveryAddress: deliveryInfo.address || "Không có địa chỉ",
//       note,
//       deliveryFee,
//       cartDetails: validCartItems,
//     };

//     try {
//       console.log("Lưu thông tin đơn hàng vào AsyncStorage:", orderData);
//       await AsyncStorage.setItem("pendingOrder", JSON.stringify(orderData));

//       // Chuyển sang màn hình Payment
//       navigation.navigate("Payment", { finalPrice });

//       // Sau khi người dùng thanh toán, kiểm tra trạng thái đơn hàng
//       const latestOrderId = await fetchLatestOrderId(userId);
//       if (latestOrderId) {
//         await fetchOrderDetailsAndUpdateStatus(latestOrderId);

//         // Nếu có giảm giá và trạng thái thanh toán đã hoàn tất
//         if (selectedDiscount > 0) {
//           const discountUpdateResponse = await fetchWithAuth(
//             `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/discount-history/inactive/${userId}/${selectedDiscount}`,
//             { method: "GET" }
//           );
//           if (discountUpdateResponse.ok) {
//             console.log("[DEBUG] Giảm giá đã được cập nhật thành inactive.");
//           } else {
//             console.error(
//               "[DEBUG] Lỗi khi cập nhật giảm giá:",
//               await discountUpdateResponse.text()
//             );
//           }
//         }
//       }
//     } catch (error) {
//       console.error("Lỗi khi lưu đơn hàng vào AsyncStorage:", error);
//       Alert.alert("Lỗi", "Không thể lưu thông tin đơn hàng.");
//     }
//   };

//   useEffect(() => {
//     const discountAmount = totalPrice * discountRate;
//     const adjustedFinalPrice = totalPrice - discountAmount + deliveryFee;
//     setFinalPrice(adjustedFinalPrice);
//   }, [totalPrice, discountRate, deliveryFee]);

//   //chẹck

//   const fetchLatestOrderId = async (userId) => {
//     try {
//       console.log("[DEBUG] Gọi API lấy danh sách đơn hàng...");
//       const response = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("[DEBUG] Lỗi từ API getOrderByUserId:", errorText);
//         throw new Error("Không thể lấy danh sách đơn hàng.");
//       }

//       const orders = await response.json();
//       console.log("[DEBUG] Danh sách đơn hàng nhận được:", orders);

//       if (orders.length === 0) {
//         console.log("[DEBUG] Không có đơn hàng nào.");
//         return 1; // Trả về 1 nếu chưa có đơn hàng nào
//       }

//       // Tìm orderId mới nhất và cộng thêm 1
//       const latestOrder =
//         orders.reduce((maxOrder, order) =>
//           order.orderId > maxOrder.orderId ? order : maxOrder
//         ).orderId + 1;

//       console.log("[DEBUG] Order ID mới sẽ là:", latestOrder);

//       return latestOrder;
//     } catch (error) {
//       console.error("Lỗi khi lấy orderId mới nhất:", error.message);
//       Alert.alert("Lỗi", error.message || "Không thể lấy thông tin đơn hàng.");
//       return null;
//     }
//   };

//   //check

//   const fetchOrderDetailsAndUpdateStatus = async (latestOrderId) => {
//     try {
//       console.log("[DEBUG] Kiểm tra trạng thái đơn hàng:", latestOrderId);

//       // Gọi API kiểm tra thanh toán
//       const paymentDetailResponse = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${latestOrderId}`
//       );

//       if (!paymentDetailResponse.ok) {
//         throw new Error("Không thể kiểm tra trạng thái thanh toán.");
//       }

//       const paymentDetails = await paymentDetailResponse.json();
//       console.log("[DEBUG] Kết quả thanh toán:", paymentDetails);

//       // Đảm bảo dữ liệu là một mảng và lấy phần tử đầu tiên
//       const paymentDetail = paymentDetails[0];
//       if (paymentDetail?.paymentStatus === "completed") {
//         console.log("[DEBUG] Thanh toán đã hoàn tất, cập nhật trạng thái...");

//         // Gọi API cập nhật trạng thái
//         const updateResponse = await fetchWithAuth(
//           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${latestOrderId}`,
//           {
//             method: "PUT",
//             body: JSON.stringify("pending"),
//           }
//         );

//         if (updateResponse.ok) {
//           console.log(
//             "[DEBUG] Trạng thái đơn hàng đã được cập nhật thành công."
//           );
//           Alert.alert("Thông báo", "Trạng thái đơn hàng đã được cập nhật.");
//         } else {
//           const errorText = await updateResponse.text();
//           console.error(
//             "[DEBUG] Lỗi khi cập nhật trạng thái đơn hàng:",
//             errorText
//           );
//           throw new Error("Không thể cập nhật trạng thái đơn hàng.");
//         }
//       } else {
//         console.log("[DEBUG] Trạng thái thanh toán chưa hoàn tất.");
//       }
//     } catch (error) {
//       console.error(
//         "[DEBUG] Lỗi khi kiểm tra và cập nhật trạng thái:",
//         error.message
//       );
//       Alert.alert(
//         "Lỗi",
//         error.message || "Có lỗi xảy ra trong quá trình xử lý đơn hàng."
//       );
//     }
//   };

//   const checkAndUpdateOrderStatus = async (orderId) => {
//     try {
//       console.log(`[DEBUG] Kiểm tra trạng thái đơn hàng: ${orderId}`);

//       // Gọi API lấy thông tin thanh toán
//       const paymentDetailResponse = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${orderId}`
//       );

//       if (!paymentDetailResponse.ok) {
//         console.error("[DEBUG] Lỗi khi gọi API lấy thông tin thanh toán.");
//         throw new Error("Không thể kiểm tra trạng thái thanh toán.");
//       }

//       const paymentDetails = await paymentDetailResponse.json();
//       console.log("[DEBUG] Kết quả thanh toán:", paymentDetails);

//       // Đảm bảo dữ liệu là mảng và lấy phần tử đầu tiên
//       const paymentDetail = paymentDetails[0];
//       if (paymentDetail?.paymentStatus === "completed") {
//         console.log("[DEBUG] Thanh toán đã hoàn tất, cập nhật trạng thái...");

//         // Gọi API cập nhật trạng thái đơn hàng
//         const updateResponse = await fetchWithAuth(
//           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${orderId}`,
//           {
//             method: "PUT",
//             body: JSON.stringify("pending"), // Cập nhật trạng thái thành "pending"
//           }
//         );

//         if (updateResponse.ok) {
//           console.log(
//             "[DEBUG] Trạng thái đơn hàng đã được cập nhật thành công."
//           );
//           Alert.alert(
//             "Thông báo",
//             "Trạng thái đơn hàng đã được cập nhật thành công."
//           );
//         } else {
//           const errorText = await updateResponse.text();
//           console.error(
//             "[DEBUG] Lỗi khi cập nhật trạng thái đơn hàng:",
//             errorText
//           );
//           throw new Error("Không thể cập nhật trạng thái đơn hàng.");
//         }
//       } else {
//         console.log("[DEBUG] Trạng thái thanh toán chưa hoàn tất.");
//       }
//     } catch (error) {
//       console.error(
//         "[DEBUG] Lỗi trong quá trình kiểm tra và cập nhật trạng thái:",
//         error.message
//       );
//       Alert.alert(
//         "Lỗi",
//         error.message || "Có lỗi xảy ra khi cập nhật trạng thái."
//       );
//     }
//   };

//   useEffect(() => {
//     if (orderId) {
//       checkAndUpdateOrderStatus(orderId);
//     }
//   }, [orderId]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const storedUserId = await AsyncStorage.getItem("userId");
//         if (storedUserId) {
//           setUserId(storedUserId);

//           // Gọi các API cần thiết
//           await fetchDeliveryInfo(storedUserId);
//           await fetchCartDetails(storedUserId);
//           await fetchDiscountHistory(storedUserId); // Gọi hàm lấy lịch sử giảm giá
//         } else {
//           console.log("Không tìm thấy User ID trong AsyncStorage");
//         }
//       } catch (error) {
//         console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
//       }
//     };

//     fetchData();
//   }, []);

//   const fetchDiscountHistory = async (id) => {
//     try {
//       const response = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/discount-history/${id}`
//       );

//       if (!response.ok) {
//         console.error(
//           `Lỗi khi lấy lịch sử giảm giá: ${response.status} ${response.statusText}`
//         );
//         return [];
//       }

//       const data = await response.json();

//       // Lọc các giảm giá có trạng thái "active" và ngày hết hạn lớn hơn ngày hiện tại
//       const activeDiscounts = data.filter(
//         (discount) =>
//           discount.status === "active" &&
//           new Date(discount.expirationDate) > new Date()
//       );

//       // Chuyển đổi danh sách giảm giá thành định dạng hiển thị cho dropdown
//       const mappedDiscounts = activeDiscounts.map((discount) => ({
//         id: discount.tierId, // Sử dụng tierId làm định danh
//         name: `Giảm giá ${discount.discountRate * 100}% (bậc ${
//           discount.tierId === 2
//             ? "Silver"
//             : discount.tierId === 3
//             ? "Gold"
//             : "Platinum"
//         })`,
//         rate: discount.discountRate, // Tỷ lệ giảm giá
//       }));

//       // Thêm tuỳ chọn "Không sử dụng giảm giá" làm mặc định
//       const options = [
//         { id: 0, name: "Không sử dụng giảm giá", rate: 0 },
//         ...mappedDiscounts,
//       ];

//       setDiscountOptions(options);
//       setSelectedDiscount(0);
//     } catch (error) {
//       console.error("Lỗi khi lấy lịch sử giảm giá:", error);
//       return [];
//     }
//   };

//   return (
//     <>
//       <Header
//         title={"Thanh toán"}
//         leftIcon={"arrow-back-outline"}
//         rightIcon={"menu"}
//         colorBackground={COLORS.white}
//         colorText={COLORS.black}
//         onPress={() => navigation.goBack()}
//       />
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         style={{ flex: 1, backgroundColor: COLORS.white, marginBottom: 120 }}
//         contentContainerStyle={{ padding: 10 }}
//       >
//         <View style={styles.deliveryInfoContainer}>
//           <Icon
//             name="location-sharp"
//             size={22}
//             color={COLORS.orange}
//             style={{ marginHorizontal: 5 }}
//           />
//           <View style={{ flex: 1 }}>
//             <Text style={styles.textBold}>
//               Tên: {deliveryInfo.username || "Người dùng"}
//             </Text>
//             <Text style={styles.text}>
//               Số điện thoại: {deliveryInfo.phoneNumber || "N/A"}
//             </Text>
//             <Text style={styles.text}>
//               Địa chỉ: {deliveryInfo.address || "Không xác định"}
//             </Text>
//           </View>
//         </View>

//         <View style={styles.discountContainer}>
//           <Text style={styles.textBold}>Chọn mức giảm giá:</Text>
//           <Dropdown
//             data={discountOptions}
//             labelField="name"
//             valueField="id"
//             value={selectedDiscount}
//             onChange={(item) => setSelectedDiscount(item.id)}
//             placeholder="Chọn mức giảm giá"
//             style={styles.dropdown}
//           />
//           {selectedDiscount > 0 && (
//             <View
//               style={[
//                 styles.discountDisplay,
//                 {
//                   backgroundColor:
//                     discountColors[
//                       discountOptions.find((opt) => opt.id === selectedDiscount)
//                         ?.rate
//                     ]?.color || COLORS.white,
//                 },
//               ]}
//             >
//               <Text style={[styles.textBold, { color: COLORS.white }]}>
//                 {discountColors[
//                   discountOptions.find((opt) => opt.id === selectedDiscount)
//                     ?.rate
//                 ]?.text || "Không có mức giảm giá"}
//               </Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.noteContainer}>
//           <Text style={styles.textBold}>Ghi chú</Text>
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <Icon
//               name="create-outline"
//               size={22}
//               color={COLORS.green}
//               style={{ marginRight: 5 }}
//             />
//             <TextInput
//               style={styles.textInput}
//               placeholder="Nhập ghi chú"
//               multiline
//               value={note}
//               onChangeText={(text) => setNote(text)}
//             />
//           </View>
//         </View>

//         <View style={styles.cartDetailsContainer}>
//           {detailedCartItems.map((item, index) => (
//             <View key={index} style={styles.listItem}>
//               <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
//               <View style={styles.itemDetails}>
//                 <Text style={styles.textNameDish}>{item.name}</Text>
//                 <Text style={styles.textDishType}>
//                   {item.dishType || "Món ăn"}
//                 </Text>
//                 <Text style={styles.textDishPrice}>{item.price}đ</Text>
//                 <View style={styles.quantityContainer}>
//                   <Text style={styles.textBold}>x{item.quantity}</Text>
//                 </View>
//               </View>
//             </View>
//           ))}
//         </View>

//         <View style={styles.paymentMethodContainer}>
//           <Text style={styles.textBold}>Phương thức thanh toán</Text>
//           {dataPayment.map((item) => (
//             <TouchableOpacity
//               key={item.id}
//               onPress={() => setCurrentPayment(item.id)}
//               style={{
//                 ...styles.paymentOption,
//                 borderColor:
//                   currentPayment === item.id ? COLORS.green : COLORS.greyPastel,
//               }}
//             >
//               <Text style={styles.text}>{item.name}</Text>
//               <Icon
//                 name={
//                   currentPayment === item.id
//                     ? "radio-button-on"
//                     : "radio-button-off"
//                 }
//                 size={20}
//                 color={currentPayment === item.id ? COLORS.green : COLORS.grey}
//               />
//             </TouchableOpacity>
//           ))}
//         </View>
//         <View style={styles.deliveryFeeContainer}>
//           <Text style={styles.textBold}>Phí giao hàng:</Text>
//           <Text style={{ ...styles.textBold, color: COLORS.green }}>
//             {deliveryFee > 0
//               ? `${deliveryFee.toLocaleString()}vnđ`
//               : "Đang tính..."}
//           </Text>
//         </View>
//       </ScrollView>

//       <View style={styles.containerButtonFloatBottom}>
//         <View style={styles.totalContainer}>
//           <Text style={styles.textBold}>Số tiền đã giảm:</Text>
//           <Text style={{ ...styles.textBold, color: COLORS.green }}>
//             {selectedDiscount > 0
//               ? (
//                   totalPrice *
//                   discountOptions.find((opt) => opt.id === selectedDiscount)
//                     .rate
//                 ).toFixed(0) + "vnđ"
//               : "0vnđ"}
//           </Text>
//         </View>
//         <View style={styles.boxButtonFloatBottom}>
//           <TouchableOpacity style={styles.totalButton}>
//             <Text style={styles.textBold}>Tổng thanh toán:</Text>
//             <Text style={{ ...styles.textBold, color: COLORS.green }}>
//               {finalPrice.toLocaleString()}vnđ
//             </Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={styles.checkoutButton}
//             onPress={handleCheckout}
//           >
//             <Text style={styles.textButton}>Thanh toán</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </>
//   );
// };

// export default CheckoutScreen;

// const styles = StyleSheet.create({
//   deliveryInfoContainer: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//     flexDirection: "row",
//     marginBottom: 10,
//   },
//   discountContainer: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   dropdown: {
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//     paddingHorizontal: 10,
//     height: 50,
//     marginBottom: 10,
//   },
//   discountDisplay: {
//     marginTop: 10,
//     padding: 10,
//     borderRadius: 10,
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   tierInfoContainer: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//     marginBottom: 10,
//     backgroundColor: COLORS.lightGrey,
//   },
//   textBold: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 15,
//   },
//   text: {
//     fontFamily: FONTS.medium,
//     fontSize: 14,
//     marginTop: 3,
//   },
//   noteContainer: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   textInput: {
//     fontFamily: FONTS.medium,
//     height: 60,
//     flex: 1,
//   },
//   cartDetailsContainer: {
//     padding: 5,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   listItem: {
//     flexDirection: "row",
//     marginBottom: 5,
//     borderBottomWidth: 1,
//     borderBottomColor: COLORS.greyPastel,
//     paddingBottom: 10,
//     backgroundColor: COLORS.white,
//   },
//   itemImage: {
//     width: 110,
//     height: "100%",
//     resizeMode: "cover",
//     borderRadius: 8,
//   },
//   itemDetails: {
//     padding: 5,
//     marginLeft: 5,
//     flex: 1,
//   },
//   textNameDish: {
//     color: COLORS.black,
//     fontSize: 16,
//     fontFamily: FONTS.semiBold,
//     marginBottom: 3,
//   },
//   textDishType: {
//     color: COLORS.grey,
//     fontSize: 12,
//     fontFamily: FONTS.semiBold,
//     marginBottom: 3,
//   },
//   textDishPrice: {
//     color: COLORS.green,
//     fontSize: 15,
//     fontFamily: FONTS.semiBold,
//     marginBottom: 3,
//   },
//   quantityContainer: {
//     flexDirection: "row",
//     alignSelf: "flex-end",
//     alignItems: "center",
//     backgroundColor: COLORS.white,
//   },
//   paymentMethodContainer: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   paymentOption: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 10,
//     borderWidth: 1,
//     borderRadius: 8,
//     marginBottom: 10,
//   },
//   containerButtonFloatBottom: {
//     position: "absolute",
//     bottom: 0,
//     right: 0,
//     left: 0,
//   },
//   totalContainer: {
//     backgroundColor: COLORS.white,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     elevation: 20,
//   },
//   boxButtonFloatBottom: {
//     backgroundColor: COLORS.white,
//     height: 80,
//     flexDirection: "row",
//     elevation: 20,
//     borderTopWidth: 1,
//     borderTopColor: COLORS.darkGrey,
//   },
//   totalButton: {
//     width: "40%",
//     backgroundColor: COLORS.white,
//     alignItems: "flex-end",
//     justifyContent: "center",
//     marginHorizontal: 20,
//     marginVertical: 10,
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "transparent",
//   },
//   checkoutButton: {
//     flex: 1,
//     backgroundColor: COLORS.green,
//     alignItems: "center",
//     justifyContent: "center",
//     marginVertical: 10,
//     borderRadius: 10,
//     elevation: 2,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: COLORS.green,
//   },
//   textButton: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 18,
//     color: COLORS.white,
//   },
//   deliveryFeeContainer: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 10,
//     marginBottom: 10,
//     flexDirection: "row",
//     justifyContent: "space-between",
//   },
// });
