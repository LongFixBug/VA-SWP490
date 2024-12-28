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

// const CheckoutScreen = ({ navigation, route }) => {
//   const [currentPayment, setCurrentPayment] = useState("COD");
//   const [userId, setUserId] = useState(null);
//   const [deliveryInfo, setDeliveryInfo] = useState({});
//   const [detailedCartItems, setDetailedCartItems] = useState([]);
//   const [totalPrice, setTotalPrice] = useState(0);
//   const [discountRate, setDiscountRate] = useState(0);
//   const [finalPrice, setFinalPrice] = useState(0);
//   const [note, setNote] = useState("");
//   const [deliveryFee, setDeliveryFee] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [orderId, setOrderId] = useState(null);
//   const [discountOptions, setDiscountOptions] = useState([]);
//   const [selectedDiscount, setSelectedDiscount] = useState(0);

//   // State for editing delivery info
//   const [isEditingDelivery, setIsEditingDelivery] = useState(false);
//   const [editedName, setEditedName] = useState("");
//   const [editedPhone, setEditedPhone] = useState("");
//   // New states for district and address detail
//   const [selectedDistrict, setSelectedDistrict] = useState(null);
//   const [editedAddressDetail, setEditedAddressDetail] = useState("");

//   const districtsHCM = [
//     { label: "Quận 1", value: "Quận 1" },
//     { label: "Quận 2", value: "Quận 2" },
//     { label: "Quận 3", value: "Quận 3" },
//     { label: "Quận 4", value: "Quận 4" },
//     { label: "Quận 5", value: "Quận 5" },
//     { label: "Quận 6", value: "Quận 6" },
//     { label: "Quận 7", value: "Quận 7" },
//     { label: "Quận 8", value: "Quận 8" },
//     { label: "Quận 9", value: "Quận 9" },
//     { label: "Quận 10", value: "Quận 10" },
//     { label: "Quận 11", value: "Quận 11" },
//     { label: "Quận 12", value: "Quận 12" },
//     { label: "Bình Thạnh", value: "Bình Thạnh" },
//     { label: "Gò Vấp", value: "Gò Vấp" },
//     { label: "Phú Nhuận", value: "Phú Nhuận" },
//     { label: "Tân Bình", value: "Tân Bình" },
//     { label: "Tân Phú", value: "Tân Phú" },
//     { label: "Thủ Đức", value: "Thủ Đức" },
//     { label: "Bình Tân", value: "Bình Tân" },
//     { label: "Huyện Nhà Bè", value: "Huyện Nhà Bè" },
//     { label: "Huyện Bình Chánh", value: "Huyện Bình Chánh" },
//     { label: "Huyện Hóc Môn", value: "Huyện Hóc Môn" },
//     { label: "Huyện Củ Chi", value: "Huyện Củ Chi" },
//     { label: "Huyện Cần Giờ", value: "Huyện Cần Giờ" },
//   ];

//   const { selectedItems } = route.params || { selectedItems: [] }; // Receive selected items from CartScreen

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

//   // Chỉnh sửa hàm generateFullAddress để trả về deliveryInfo.address
//   const generateFullAddress = () => {
//     return deliveryInfo.address || "";
//   };

//   const parseAddress = (fullAddress) => {
//     if (!fullAddress) return { province: "", district: "", address: "" };

//     const parts = fullAddress.split(",");
//     const province = parts[parts.length - 1]?.trim();
//     const district = parts[parts.length - 2]?.trim();
//     let address = "";
//     for (let i = 0; i < parts.length - 2; i++) {
//       address += parts[i].trim();
//       if (i < parts.length - 3) {
//         address += ", ";
//       }
//     }

//     console.log("Province:", province);
//     console.log("District:", district);
//     console.log("Address:", address);

//     return { province, district, address };
//   };

//   const { province, district, address } = parseAddress(deliveryInfo.address);

//   const dataPayment = [
//     { id: "COD", name: "Thanh toán khi nhận hàng" },
//     { id: "QR", name: "Thanh toán qua QR code" },
//     { id: "VnPay", name: "Thanh toán qua VnPay" },
//   ];

//   useEffect(() => {
//     const getUserIdFromStorage = async () => {
//       try {
//         const storedUserId = await AsyncStorage.getItem("userId");
//         if (storedUserId) {
//           setUserId(storedUserId);
//           await fetchDeliveryInfo(storedUserId);
//           await fetchDiscountHistory(storedUserId);
//         } else {
//           console.log("Không tìm thấy User ID trong AsyncStorage");
//         }
//       } catch (error) {
//         console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
//       }
//     };
//     getUserIdFromStorage();
//   }, []);

//   useEffect(() => {
//     if (selectedItems && selectedItems.length > 0) {
//       let total = 0;
//       selectedItems.forEach((item) => {
//         total += item.price * item.quantity;
//       });
//       setDetailedCartItems(selectedItems);
//       setTotalPrice(total);
//     }
//   }, [selectedItems]);

//   const fetchDeliveryFee = async () => {
//     try {
//       console.log("fetchDeliveryFee called");
//       console.log("deliveryInfo.address:", deliveryInfo.address);
//       const fullAddress = generateFullAddress();
//       const parsedAddress = parseAddress(fullAddress);
//       console.log("Parsed address for API:", parsedAddress);

//       const queryParams = new URLSearchParams({
//         pick_province: "Hồ Chí Minh",
//         pick_district: "Quận 9",
//         province: "Hồ Chí Minh", // Always HCM
//         district: parsedAddress.district || "Quận 12",
//         address: parsedAddress.address || "338/10 Đ. Lê Thị Riêng", // Fallback address
//         weight: 1000,
//         value: totalPrice,
//       }).toString();

//       console.log("Province for API:", parsedAddress.province);
//       console.log("District for API:", parsedAddress.district);
//       console.log("Address for API:", parsedAddress.address);

//       const response = await fetch(
//         `https://services.giaohangtietkiem.vn/services/shipment/fee?${queryParams}`,
//         {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             token: "35j4uHBQNjODAEOrWBlA23Sscp3TicIQ0k4mN2",
//           },
//         }
//       );

//       const data = await response.json();
//       console.log("Dữ liệu phí giao hàng:", data);

//       if (data && data.fee) {
//         setDeliveryFee(data.fee.fee);
//         setFinalPrice(totalPrice - totalPrice * discountRate + data.fee.fee);
//       } else {
//         Alert.alert("Lỗi", "Không thể lấy phí giao hàng.");
//       }
//     } catch (error) {
//       console.error("Lỗi khi lấy phí giao hàng:", error);
//     }
//   };

//   const fetchDeliveryInfo = async (id) => {
//     try {
//       const response = await fetchWithAuth(
//         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/getDeliveryInformationByUserId /${id}`
//       );

//       if (!response.ok) {
//         console.error("API trả về trạng thái không hợp lệ:", response.status);
//         throw new Error(`Error: ${response.status} - ${response.statusText}`);
//       }

//       const data = await response.json();
//       if (!data) {
//         console.error("API không trả về dữ liệu hợp lệ.");
//         return;
//       }

//       console.log("Delivery info:", data);
//       setDeliveryInfo(data);
//     } catch (error) {
//       console.error("Error fetching delivery info:", error.message);
//       Alert.alert(
//         "Lỗi",
//         "Không thể lấy thông tin giao hàng. Vui lòng thử lại sau."
//       );
//     }
//   };

//   useEffect(() => {
//     if (deliveryInfo && deliveryInfo.address && totalPrice > 0) {
//       fetchDeliveryFee();
//     }
//   }, [deliveryInfo, totalPrice, selectedDistrict, editedAddressDetail]);

//   useEffect(() => {
//     // Tính toán tổng tiền sau khi chọn mức giảm giá
//     const selectedOption = discountOptions.find(
//       (option) => option.id === selectedDiscount
//     );
//     const discountRate = selectedOption ? selectedOption.rate : 0;
//     setFinalPrice(totalPrice - totalPrice * discountRate + deliveryFee);
//   }, [selectedDiscount, totalPrice, deliveryFee]);

//   const handleCheckout = async () => {
//     if (detailedCartItems.length === 0) {
//       Alert.alert("Thông báo", "Không có món ăn nào để thanh toán.");
//       return;
//     }

//     // Sử dụng địa chỉ từ deliveryInfo.address
//     const fullAddress = generateFullAddress();

//     if (!fullAddress) {
//       Alert.alert("Lỗi", "Không xác định được địa chỉ giao hàng.");
//       return;
//     }

//     const calculatedDiscountPrice = totalPrice * discountRate;

//     const orderData = {
//       userId,
//       totalPrice: finalPrice,
//       deliveryAddress: fullAddress,
//       note,
//       deliveryFee,
//       cartDetails: detailedCartItems,
//       discountRate,
//       discountPrice: calculatedDiscountPrice,
//       phoneNumber: deliveryInfo.phoneNumber || "Không có số điện thoại",
//       receiverName: deliveryInfo.username || "Không có tên người nhận",
//       paymentMethod: currentPayment,
//     };

//     try {
//       await AsyncStorage.setItem("pendingOrder", JSON.stringify(orderData));
//       console.log("[DEBUG] Dữ liệu đơn hàng lưu vào AsyncStorage:", orderData);

//       navigation.navigate("Payment", {
//         finalPrice,
//         currentPayment,
//       });
//     } catch (error) {
//       console.error("Lỗi khi lưu đơn hàng vào AsyncStorage:", error);
//       Alert.alert("Lỗi", "Không thể lưu thông tin đơn hàng.");
//     }
//   };

//   useEffect(() => {
//     const calculatedDiscountPrice = totalPrice * discountRate;
//     const adjustedFinalPrice =
//       totalPrice - calculatedDiscountPrice + deliveryFee;
//     setFinalPrice(adjustedFinalPrice);
//   }, [totalPrice, discountRate, deliveryFee]);

//   // const fetchLatestOrderId = async (userId) => {
//   //   try {
//   //     console.log("[DEBUG] Gọi API lấy danh sách đơn hàng...");
//   //     const response = await fetchWithAuth(
//   //       `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
//   //     );

//   //     if (!response.ok) {
//   //       const errorText = await response.text();
//   //       console.error("[DEBUG] Lỗi từ API getOrderByUserId:", errorText);
//   //       throw new Error("Không thể lấy danh sách đơn hàng.");
//   //     }

//   //     const orders = await response.json();
//   //     console.log("[DEBUG] Danh sách đơn hàng nhận được:", orders);

//   //     if (orders.length === 0) {
//   //       console.log("[DEBUG] Không có đơn hàng nào.");
//   //       return null;
//   //     }

//   //     const latestOrder = orders.reduce((maxOrder, order) =>
//   //       order.orderId > maxOrder.orderId ? order : maxOrder
//   //     );

//   //     console.log("[DEBUG] Order mới nhất:", latestOrder);
//   //     return latestOrder.orderId;
//   //   } catch (error) {
//   //     console.error("Lỗi khi lấy orderId mới nhất:", error.message);
//   //     Alert.alert("Lỗi", error.message || "Không thể lấy thông tin đơn hàng.");
//   //     return null;
//   //   }
//   // };

//   // const fetchOrderDetailsAndUpdateStatus = async (latestOrderId) => {
//   //   try {
//   //     console.log(
//   //       "[DEBUG] Bắt đầu kiểm tra trạng thái đơn hàng. Order ID:",
//   //       latestOrderId
//   //     );

//   //     console.log("[DEBUG] Gọi API kiểm tra chi tiết thanh toán...");
//   //     const paymentDetailResponse = await fetchWithAuth(
//   //       `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getPaymentDetailByOrderId/${latestOrderId}`
//   //     );

//   //     if (!paymentDetailResponse.ok) {
//   //       const errorText = await paymentDetailResponse.text();
//   //       console.error("[DEBUG] Lỗi từ API kiểm tra thanh toán:", errorText);
//   //       throw new Error("Không thể kiểm tra trạng thái thanh toán.");
//   //     }

//   //     const paymentDetails = await paymentDetailResponse.json();
//   //     console.log("[DEBUG] Kết quả thanh toán từ API:", paymentDetails);

//   //     const paymentDetail = paymentDetails[0];
//   //     console.log("[DEBUG] Chi tiết thanh toán đầu tiên:", paymentDetail);

//   //     if (paymentDetail?.paymentMethod === "COD") {
//   //       console.log(
//   //         "[DEBUG] Phương thức thanh toán là COD. Auto cập nhật trạng thái đơn hàng."
//   //       );

//   //       const updateResponse = await fetchWithAuth(
//   //         `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${latestOrderId}?newStatus=pending`,
//   //         {
//   //           method: "PUT",
//   //           headers: {
//   //             Accept: "*/*",
//   //           },
//   //         }
//   //       );

//   //       if (!updateResponse.ok) {
//   //         const errorText = await updateResponse.text();
//   //         console.error(
//   //           "[DEBUG] Lỗi khi cập nhật trạng thái đơn hàng:",
//   //           errorText
//   //         );
//   //         throw new Error("Không thể cập nhật trạng thái đơn hàng.");
//   //       }

//   //       console.log("[DEBUG] Trạng thái đơn hàng đã được cập nhật thành công.");
//   //     } else if (
//   //       paymentDetail?.paymentMethod === "PayOs" ||
//   //       paymentDetail?.paymentMethod === "VnPay"
//   //     ) {
//   //       console.log("Kiểm tra trạng thái thanh toán.");

//   //       if (paymentDetail?.paymentStatus === "completed") {
//   //         console.log(
//   //           "[DEBUG] Thanh toán đã hoàn tất. Tiến hành cập nhật trạng thái đơn hàng..."
//   //         );

//   //         const updateResponse = await fetchWithAuth(
//   //           `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/updateStatusOrderByOrderId/${latestOrderId}?newStatus=pending`,
//   //           {
//   //             method: "PUT",
//   //             headers: {
//   //               Accept: "*/*",
//   //             },
//   //           }
//   //         );

//   //         if (!updateResponse.ok) {
//   //           const errorText = await updateResponse.text();
//   //           console.error(
//   //             "[DEBUG] Lỗi khi cập nhật trạng thái đơn hàng:",
//   //             errorText
//   //           );
//   //           throw new Error("Không thể cập nhật trạng thái đơn hàng.");
//   //         }

//   //         console.log(
//   //           "[DEBUG] Trạng thái đơn hàng đã được cập nhật thành công."
//   //         );
//   //       } else {
//   //         console.log(
//   //           "[DEBUG] Trạng thái thanh toán chưa hoàn tất. Không cập nhật đơn hàng hoặc giảm giá."
//   //         );
//   //         return;
//   //       }
//   //     } else {
//   //       console.log(
//   //         "[DEBUG] Phương thức thanh toán không được hỗ trợ:",
//   //         paymentDetail?.paymentMethod
//   //       );
//   //       throw new Error("Phương thức thanh toán không được hỗ trợ.");
//   //     }

//   //     console.log("[DEBUG] Gọi API lấy danh sách đơn hàng...");
//   //     const storedUserId = await AsyncStorage.getItem("userId");
//   //     if (!storedUserId) {
//   //       throw new Error("Không thể lấy User ID.");
//   //     }

//   //     const userId = parseInt(storedUserId, 10);
//   //     console.log("[DEBUG] User ID:", userId);

//   //     const ordersResponse = await fetchWithAuth(
//   //       `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/orders/getOrderByUserId/${userId}`
//   //     );

//   //     if (!ordersResponse.ok) {
//   //       const errorText = await ordersResponse.text();
//   //       console.error("[DEBUG] Lỗi khi lấy danh sách đơn hàng:", errorText);
//   //       throw new Error("Không thể lấy danh sách đơn hàng.");
//   //     }

//   //     const orders = await ordersResponse.json();
//   //     console.log("[DEBUG] Danh sách đơn hàng:", orders);

//   //     const latestOrder = orders
//   //       .filter((order) => order.status === "pending")
//   //       .reduce((latest, current) => {
//   //         return new Date(current.orderDate) > new Date(latest.orderDate)
//   //           ? current
//   //           : latest;
//   //       }, orders[0]);

//   //     if (!latestOrder) {
//   //       console.log("[DEBUG] Không tìm thấy đơn hàng trạng thái 'pending'.");
//   //       return;
//   //     }

//   //     console.log("[DEBUG] Đơn hàng trạng thái 'pending':", latestOrder);

//   //     const discountRate = latestOrder.discountRate;
//   //     let tierId = 0;

//   //     if (discountRate === 0.1) {
//   //       tierId = 2;
//   //     } else if (discountRate === 0.2) {
//   //       tierId = 3;
//   //     } else if (discountRate === 0.3) {
//   //       tierId = 4;
//   //     } else {
//   //       console.log(
//   //         "[DEBUG] Không có giảm giá hoặc discountRate không hợp lệ:",
//   //         discountRate
//   //       );
//   //       return;
//   //     }

//   //     console.log("[DEBUG] Tính toán tierId:", tierId);

//   //     const discountUpdateResponse = await fetchWithAuth(
//   //       `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/discount-history/inactive/${userId}/${tierId}`,
//   //       {
//   //         method: "PUT",
//   //         headers: {
//   //           Accept: "*/*",
//   //         },
//   //       }
//   //     );

//   //     if (!discountUpdateResponse.ok) {
//   //       const errorText = await discountUpdateResponse.text();
//   //       console.error(
//   //         "[DEBUG] Lỗi khi cập nhật trạng thái giảm giá:",
//   //         errorText
//   //       );
//   //       throw new Error("Không thể cập nhật trạng thái giảm giá.");
//   //     }

//   //     console.log("[DEBUG] Trạng thái giảm giá đã được cập nhật thành công.");
//   //   } catch (error) {
//   //     console.error(
//   //       "[DEBUG] Lỗi khi kiểm tra và cập nhật trạng thái:",
//   //       error.message
//   //     );
//   //     Alert.alert(
//   //       "Lỗi",
//   //       error.message || "Có lỗi xảy ra trong quá trình xử lý đơn hàng."
//   //     );
//   //   }
//   // };

//   // useEffect(() => {
//   //   const fetchData = async () => {
//   //     try {
//   //       setLoading(true);

//   //       const storedUserId = await AsyncStorage.getItem("userId");
//   //       if (!storedUserId) {
//   //         console.error("[DEBUG] Không tìm thấy User ID.");
//   //         return;
//   //       }
//   //       setUserId(storedUserId);
//   //       await fetchDiscountHistory(storedUserId);

//   //       const latestOrderId = await fetchLatestOrderId(storedUserId);
//   //       if (latestOrderId) {
//   //         setOrderId(latestOrderId);
//   //         await fetchOrderDetailsAndUpdateStatus(latestOrderId);
//   //       }
//   //     } catch (error) {
//   //       console.error("[DEBUG] Lỗi khi tải dữ liệu:", error.message);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   const unsubscribe = navigation.addListener("focus", fetchData);
//   //   return unsubscribe;
//   // }, [navigation]);

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

//       const activeDiscounts = data.filter(
//         (discount) =>
//           discount.status === "active" &&
//           new Date(discount.expirationDate) > new Date()
//       );

//       const mappedDiscounts = activeDiscounts.map((discount) => ({
//         id: discount.tierId,
//         name: `Giảm giá ${discount.discountRate * 100}%`,
//         rate: discount.discountRate,
//       }));

//       const options = [
//         { id: 0, name: "Không sử dụng giảm giá", rate: 0 },
//         ...mappedDiscounts,
//       ];

//       setDiscountOptions(options);
//       setSelectedDiscount(0);
//     } catch (error) {
//       console.error("Lỗi khi lấy lịch sử giảm giá:", error);
//     }
//   };

//   const handleSaveDeliveryInfo = () => {
//     if (
//       !editedName ||
//       !editedPhone ||
//       !selectedDistrict ||
//       !editedAddressDetail
//     ) {
//       Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
//       return;
//     }
//     const fullAddress = `${editedAddressDetail}, ${selectedDistrict}, Thành phố Hồ Chí Minh`;
//     setDeliveryInfo({
//       username: editedName,
//       phoneNumber: editedPhone,
//       address: fullAddress,
//     });

//     setIsEditingDelivery(false);
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
//             {isEditingDelivery ? (
//               <>
//                 <View>
//                   <Text style={styles.textInputLabel}>Tên người nhận</Text>
//                   <TextInput
//                     style={styles.textInput}
//                     value={editedName}
//                     onChangeText={setEditedName}
//                   />
//                 </View>

//                 <View>
//                   <Text style={styles.textInputLabel}>Số điện thoại</Text>
//                   <TextInput
//                     style={styles.textInput}
//                     value={editedPhone}
//                     onChangeText={setEditedPhone}
//                     keyboardType="phone-pad"
//                   />
//                 </View>

//                 <View>
//                   <Text style={styles.textInputLabel}>Chọn Quận</Text>
//                   <Dropdown
//                     style={styles.dropdown}
//                     placeholder="Chọn Quận"
//                     data={districtsHCM}
//                     labelField="label"
//                     valueField="value"
//                     value={selectedDistrict}
//                     onChange={(item) => {
//                       setSelectedDistrict(item.value);
//                     }}
//                   />
//                 </View>
//                 <View>
//                   <Text style={styles.textInputLabel}>Địa chỉ chi tiết</Text>
//                   <TextInput
//                     style={styles.textInput}
//                     value={editedAddressDetail}
//                     onChangeText={setEditedAddressDetail}
//                   />
//                 </View>

//                 <View
//                   style={{ flexDirection: "row", justifyContent: "flex-end" }}
//                 >
//                   <TouchableOpacity
//                     onPress={handleSaveDeliveryInfo}
//                     style={styles.saveButton}
//                   >
//                     <Text
//                       style={{
//                         color: COLORS.white,
//                         fontFamily: FONTS.semiBold,
//                       }}
//                     >
//                       Lưu
//                     </Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity
//                     onPress={() => setIsEditingDelivery(false)}
//                     style={styles.cancelButton}
//                   >
//                     <Text
//                       style={{ color: COLORS.grey, fontFamily: FONTS.semiBold }}
//                     >
//                       Hủy
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             ) : (
//               <View style={styles.deliveryInfoWrapper}>
//                 <View style={{ flex: 1 }}>
//                   <Text style={styles.textBold}>
//                     Tên: {deliveryInfo.username || "Người dùng"}
//                   </Text>
//                   <Text style={styles.text}>
//                     Số điện thoại: {deliveryInfo.phoneNumber || "N/A"}
//                   </Text>
//                   <Text style={styles.text}>
//                     Địa chỉ: {deliveryInfo.address || "Không xác định"}
//                   </Text>
//                 </View>
//                 <TouchableOpacity
//                   onPress={() => {
//                     setIsEditingDelivery(true);
//                     setEditedName(deliveryInfo.username || "");
//                     setEditedPhone(deliveryInfo.phoneNumber || "");
//                     const { address, district, province } = parseAddress(
//                       deliveryInfo.address
//                     );
//                     setEditedAddressDetail(address || "");
//                     setSelectedDistrict(district || "");
//                   }}
//                   style={styles.editButton}
//                 >
//                   <Text
//                     style={{ color: COLORS.green, fontFamily: FONTS.semiBold }}
//                   >
//                     Sửa
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             )}
//           </View>
//         </View>

//         <View style={styles.discountContainer}>
//           <Text style={styles.textBold}>Chọn mức giảm giá:</Text>

//           <Dropdown
//             data={discountOptions}
//             labelField="name"
//             valueField="id"
//             value={selectedDiscount}
//             onChange={(item) => {
//               console.log(
//                 "[DEBUG] Giá trị selectedDiscount được chọn:",
//                 item.id
//               );
//               setSelectedDiscount(item.id);

//               const selectedOption = discountOptions.find(
//                 (opt) => opt.id === item.id
//               );
//               setDiscountRate(selectedOption ? selectedOption.rate : 0);
//             }}
//             placeholder="Chọn mức giảm giá"
//             style={styles.dropdown}
//           />

//           <View
//             style={[
//               styles.discountDisplay,
//               {
//                 backgroundColor:
//                   discountColors[
//                     discountOptions.find((opt) => opt.id === selectedDiscount)
//                       ?.rate
//                   ]?.color || COLORS.white,
//               },
//             ]}
//           >
//             <Text style={[styles.textBold, { color: COLORS.white }]}>
//               {discountColors[
//                 discountOptions.find((opt) => opt.id === selectedDiscount)?.rate
//               ]?.text || "Không có mức giảm giá"}
//             </Text>
//           </View>
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
//                 <Text style={styles.textDishPrice}>
//                   {item.price.toLocaleString()} đ
//                   {discountRate > 0 && (
//                     <Text
//                       style={{
//                         color: COLORS.grey,
//                         textDecorationLine: "line-through",
//                       }}
//                     >
//                       - {(item.price * discountRate).toLocaleString()} đ
//                     </Text>
//                   )}
//                 </Text>
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
//               ? `${deliveryFee.toLocaleString()} đ`
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
//                 ).toLocaleString() + " đ"
//               : "0 đ"}
//           </Text>
//         </View>
//         <View style={styles.boxButtonFloatBottom}>
//           <TouchableOpacity style={styles.totalButton}>
//             <Text style={styles.textBold}>Tổng thanh toán:</Text>
//             <Text style={{ ...styles.textBold, color: COLORS.green }}>
//               {finalPrice.toLocaleString()} đ
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
//   deliveryInfoWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   editButton: {
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderRadius: 10,
//     borderColor: COLORS.green,
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     height: 30,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   saveButton: {
//     backgroundColor: COLORS.green,
//     padding: 10,
//     marginRight: 5,
//     borderRadius: 10,
//   },
//   cancelButton: {
//     backgroundColor: COLORS.white,
//     borderWidth: 1,
//     borderColor: COLORS.grey,
//     padding: 10,
//     borderRadius: 10,
//   },
//   textInputLabel: {
//     fontFamily: FONTS.medium,
//     fontSize: 14,
//     marginBottom: 5,
//     color: COLORS.black,
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
//     height: 40,
//     flex: 1,
//     borderWidth: 1,
//     borderColor: COLORS.greyPastel,
//     borderRadius: 5,
//     paddingHorizontal: 10,
//     marginBottom: 10,
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

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Icon from "react-native-vector-icons/Ionicons";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Dropdown } from "react-native-element-dropdown";

const CheckoutScreen = ({ navigation, route }) => {
  const [currentPayment, setCurrentPayment] = useState("COD");
  const [userId, setUserId] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({});
  const [detailedCartItems, setDetailedCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [note, setNote] = useState("");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [discountOptions, setDiscountOptions] = useState([]);
  const [selectedDiscount, setSelectedDiscount] = useState(0);
  const [ingredientsFetched, setIngredientsFetched] = useState(false); // Thêm state này

  // State for editing delivery info
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  // New states for district and address detail
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [editedAddressDetail, setEditedAddressDetail] = useState("");

  const districtsHCM = [
    { label: "Quận 1", value: "Quận 1" },
    { label: "Quận 2", value: "Quận 2" },
    { label: "Quận 3", value: "Quận 3" },
    { label: "Quận 4", value: "Quận 4" },
    { label: "Quận 5", value: "Quận 5" },
    { label: "Quận 6", value: "Quận 6" },
    { label: "Quận 7", value: "Quận 7" },
    { label: "Quận 8", value: "Quận 8" },
    { label: "Quận 9", value: "Quận 9" },
    { label: "Quận 10", value: "Quận 10" },
    { label: "Quận 11", value: "Quận 11" },
    { label: "Quận 12", value: "Quận 12" },
    { label: "Bình Thạnh", value: "Bình Thạnh" },
    { label: "Gò Vấp", value: "Gò Vấp" },
    { label: "Phú Nhuận", value: "Phú Nhuận" },
    { label: "Tân Bình", value: "Tân Bình" },
    { label: "Tân Phú", value: "Tân Phú" },
    { label: "Thủ Đức", value: "Thủ Đức" },
    { label: "Bình Tân", value: "Bình Tân" },
    { label: "Huyện Nhà Bè", value: "Huyện Nhà Bè" },
    { label: "Huyện Bình Chánh", value: "Huyện Bình Chánh" },
    { label: "Huyện Hóc Môn", value: "Huyện Hóc Môn" },
    { label: "Huyện Củ Chi", value: "Huyện Củ Chi" },
    { label: "Huyện Cần Giờ", value: "Huyện Cần Giờ" },
  ];

  const { selectedItems } = route.params || { selectedItems: [] }; // Receive selected items from CartScreen

  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");

    if (!token) {
      console.error("Không tìm thấy token.");
      throw new Error("Unauthorized: Missing token");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        console.error("Token hết hạn hoặc không hợp lệ.");
      }
      return response;
    } catch (error) {
      console.error("Error fetching with auth:", error);
      throw error;
    }
  };

  const discountColors = {
    0: { color: COLORS.grey, text: "Không sử dụng giảm giá" },
    0.1: { color: COLORS.green, text: "Giảm giá 10%" },
    0.2: { color: COLORS.star, text: "Giảm giá 20%" },
    0.3: { color: COLORS.orange, text: "Giảm giá 30%" },
  };

  // Chỉnh sửa hàm generateFullAddress để trả về deliveryInfo.address
  const generateFullAddress = () => {
    return deliveryInfo.address || "";
  };

  const parseAddress = (fullAddress) => {
    if (!fullAddress) return { province: "", district: "", address: "" };

    const parts = fullAddress.split(",");
    const province = parts[parts.length - 1]?.trim();
    const district = parts[parts.length - 2]?.trim();
    let address = "";
    for (let i = 0; i < parts.length - 2; i++) {
      address += parts[i].trim();
      if (i < parts.length - 3) {
        address += ", ";
      }
    }

    console.log("Province:", province);
    console.log("District:", district);
    console.log("Address:", address);

    return { province, district, address };
  };

  const { province, district, address } = parseAddress(deliveryInfo.address);

  const dataPayment = [
    { id: "COD", name: "Thanh toán khi nhận hàng" },
    { id: "QR", name: "Thanh toán qua QR code" },
    { id: "VnPay", name: "Thanh toán qua VnPay" },
  ];

  useEffect(() => {
    const getUserIdFromStorage = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(storedUserId);
          await fetchDeliveryInfo(storedUserId);
          await fetchDiscountHistory(storedUserId);
        } else {
          console.log("Không tìm thấy User ID trong AsyncStorage");
        }
      } catch (error) {
        console.error("Lỗi khi lấy userId từ AsyncStorage:", error);
      }
    };
    getUserIdFromStorage();
  }, []);

  useEffect(() => {
    const initializeCartItems = async () => {
      if (selectedItems && selectedItems.length > 0) {
        let total = 0;
        selectedItems.forEach((item) => {
          total += item.price * item.quantity;
        });
        // Thêm trường removedIngredients và ingredients vào mỗi món ăn
        const itemsWithRemovedIngredients = selectedItems.map((item) => ({
          ...item,
          removedIngredients: [], // Khởi tạo mảng nguyên liệu bị bỏ ra
          ingredients: [], // Khởi tạo mảng nguyên liệu
        }));
        setDetailedCartItems(itemsWithRemovedIngredients);
        setTotalPrice(total);
      }
    };
    initializeCartItems();
  }, [selectedItems]);

  useEffect(() => {
    const fetchAllIngredients = async () => {
      if (detailedCartItems.length > 0 && !ingredientsFetched) {
        await fetchIngredients(detailedCartItems);
        setIngredientsFetched(true); // Đánh dấu đã lấy nguyên liệu
      }
    };
    fetchAllIngredients();
  }, [detailedCartItems, ingredientsFetched]);

  const fetchIngredients = async (items) => {
    try {
      const updatedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const dishId = item.dishId;
            if (!dishId) {
              console.error(
                `Dish ID is missing for item: ${JSON.stringify(item)}`
              );
              return { ...item, ingredients: [] };
            }

            // Gọi API để lấy ingredientIds dựa trên dishId
            const response1 = await fetchWithAuth(
              `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByDishId/${dishId}`
            );
            if (!response1.ok) {
              throw new Error(
                `Error fetching ingredient IDs for dish ${dishId}: ${response1.status}`
              );
            }
            const ingredientData = await response1.json(); // Giả sử trả về mảng các đối tượng nguyên liệu

            // Gọi API để lấy tên của từng ingredientId
            const ingredientNames = await Promise.all(
              ingredientData.map(async (ingredientItem) => {
                try {
                  const ingredientId = ingredientItem.ingredientId;
                  const response2 = await fetchWithAuth(
                    `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/ingredients/getIngredientByIngredientId/${ingredientId}`
                  );
                  if (!response2.ok) {
                    throw new Error(
                      `Error fetching ingredient name for ID ${ingredientId}: ${response2.status}`
                    );
                  }
                  const ingredient = await response2.json(); // Giả sử trả về đối tượng chứa tên nguyên liệu
                  return ingredient.name;
                } catch (error) {
                  console.error(error);
                  return "Không xác định";
                }
              })
            );

            return { ...item, ingredients: ingredientNames };
          } catch (error) {
            console.error(error);
            return { ...item, ingredients: ["Không xác định"] };
          }
        })
      );

      setDetailedCartItems(updatedItems);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    }
  };

  const fetchDeliveryFee = async () => {
    try {
      console.log("fetchDeliveryFee called");
      console.log("deliveryInfo.address:", deliveryInfo.address);
      const fullAddress = generateFullAddress();
      const parsedAddress = parseAddress(fullAddress);
      console.log("Parsed address for API:", parsedAddress);

      const queryParams = new URLSearchParams({
        pick_province: "Hồ Chí Minh",
        pick_district: "Quận 9",
        province: "Hồ Chí Minh", // Always HCM
        district: parsedAddress.district || "Quận 12",
        address: parsedAddress.address || "338/10 Đ. Lê Thị Riêng", // Fallback address
        weight: 1000,
        value: totalPrice,
      }).toString();

      console.log("Province for API:", parsedAddress.province);
      console.log("District for API:", parsedAddress.district);
      console.log("Address for API:", parsedAddress.address);

      const response = await fetch(
        `https://services.giaohangtietkiem.vn/services/shipment/fee?${queryParams}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            token: "35j4uHBQNjODAEOrWBlA23Sscp3TicIQ0k4mN2",
          },
        }
      );

      const data = await response.json();
      console.log("Dữ liệu phí giao hàng:", data);

      if (data && data.fee) {
        setDeliveryFee(data.fee.fee);
        setFinalPrice(totalPrice - totalPrice * discountRate + data.fee.fee);
      } else {
        Alert.alert("Lỗi", "Không thể lấy phí giao hàng.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy phí giao hàng:", error);
      Alert.alert("Lỗi", "Không thể lấy phí giao hàng.");
    }
  };

  const fetchDeliveryInfo = async (id) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/getDeliveryInformationByUserId /${id}`
      );

      if (!response.ok) {
        console.error("API trả về trạng thái không hợp lệ:", response.status);
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      if (!data) {
        console.error("API không trả về dữ liệu hợp lệ.");
        return;
      }

      console.log("Delivery info:", data);
      setDeliveryInfo(data);
    } catch (error) {
      console.error("Error fetching delivery info:", error.message);
      Alert.alert(
        "Lỗi",
        "Không thể lấy thông tin giao hàng. Vui lòng thử lại sau."
      );
    }
  };

  useEffect(() => {
    if (deliveryInfo && deliveryInfo.address && totalPrice > 0) {
      fetchDeliveryFee();
    }
  }, [deliveryInfo, totalPrice, selectedDistrict, editedAddressDetail]);

  useEffect(() => {
    // Tính toán tổng tiền sau khi chọn mức giảm giá
    const selectedOption = discountOptions.find(
      (option) => option.id === selectedDiscount
    );
    const discountRate = selectedOption ? selectedOption.rate : 0;
    setFinalPrice(totalPrice - totalPrice * discountRate + deliveryFee);
  }, [selectedDiscount, totalPrice, deliveryFee]);

  const handleCheckout = async () => {
    if (detailedCartItems.length === 0) {
      Alert.alert("Thông báo", "Không có món ăn nào để thanh toán.");
      return;
    }

    // Sử dụng địa chỉ từ deliveryInfo.address
    const fullAddress = generateFullAddress();

    if (!fullAddress) {
      Alert.alert("Lỗi", "Không xác định được địa chỉ giao hàng.");
      return;
    }

    const calculatedDiscountPrice = totalPrice * discountRate;

    const orderData = {
      userId,
      totalPrice: finalPrice,
      deliveryAddress: fullAddress,
      note,
      deliveryFee,
      cartDetails: detailedCartItems,
      discountRate,
      discountPrice: calculatedDiscountPrice,
      phoneNumber: deliveryInfo.phoneNumber || "Không có số điện thoại",
      receiverName: deliveryInfo.username || "Không có tên người nhận",
      paymentMethod: currentPayment,
    };

    try {
      await AsyncStorage.setItem("pendingOrder", JSON.stringify(orderData));
      console.log("[DEBUG] Dữ liệu đơn hàng lưu vào AsyncStorage:", orderData);

      navigation.navigate("Payment", {
        finalPrice,
        currentPayment,
      });
    } catch (error) {
      console.error("Lỗi khi lưu đơn hàng vào AsyncStorage:", error);
      Alert.alert("Lỗi", "Không thể lưu thông tin đơn hàng.");
    }
  };

  useEffect(() => {
    const calculatedDiscountPrice = totalPrice * discountRate;
    const adjustedFinalPrice =
      totalPrice - calculatedDiscountPrice + deliveryFee;
    setFinalPrice(adjustedFinalPrice);
  }, [totalPrice, discountRate, deliveryFee]);

  const fetchDiscountHistory = async (id) => {
    try {
      const response = await fetchWithAuth(
        `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/discount-history/${id}`
      );

      if (!response.ok) {
        console.error(
          `Lỗi khi lấy lịch sử giảm giá: ${response.status} ${response.statusText}`
        );
        return [];
      }

      const data = await response.json();

      const activeDiscounts = data.filter(
        (discount) =>
          discount.status === "active" &&
          new Date(discount.expirationDate) > new Date()
      );

      const mappedDiscounts = activeDiscounts.map((discount) => ({
        id: discount.tierId,
        name: `Giảm giá ${discount.discountRate * 100}%`,
        rate: discount.discountRate,
      }));

      const options = [
        { id: 0, name: "Không sử dụng giảm giá", rate: 0 },
        ...mappedDiscounts,
      ];

      setDiscountOptions(options);
      setSelectedDiscount(0);
    } catch (error) {
      console.error("Lỗi khi lấy lịch sử giảm giá:", error);
      Alert.alert("Lỗi", "Không thể lấy lịch sử giảm giá.");
    }
  };

  const handleRemoveIngredient = (dishId, ingredient) => {
    // Tìm món ăn trước khi cập nhật
    const item = detailedCartItems.find((item) => item.dishId === dishId);
    const itemName = item ? item.name : "Món ăn";

    // Cập nhật detailedCartItems
    setDetailedCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.dishId === dishId) {
          return {
            ...item,
            ingredients: item.ingredients.filter((ing) => ing !== ingredient),
            removedIngredients: [...item.removedIngredients, ingredient],
          };
        }
        return item;
      })
    );

    // Cập nhật phần ghi chú với nguyên liệu bị bỏ ra
    setNote((prevNote) => {
      const ingredientInfo = `(${itemName}: ${ingredient} bị bỏ ra)`;
      // Tránh ghi đè nếu nguyên liệu đã được ghi nhận trước đó
      if (prevNote.includes(ingredientInfo)) {
        return prevNote;
      }
      return prevNote ? `${prevNote} ${ingredientInfo}` : ingredientInfo;
    });
  };

  const handleSaveDeliveryInfo = () => {
    if (
      !editedName ||
      !editedPhone ||
      !selectedDistrict ||
      !editedAddressDetail
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    const fullAddress = `${editedAddressDetail}, ${selectedDistrict}, Thành phố Hồ Chí Minh`;
    setDeliveryInfo({
      username: editedName,
      phoneNumber: editedPhone,
      address: fullAddress,
    });

    setIsEditingDelivery(false);
  };

  return (
    <>
      <Header
        title={"Thanh toán"}
        leftIcon={"arrow-back-outline"}
        rightIcon={"menu"}
        colorBackground={COLORS.white}
        colorText={COLORS.black}
        onPress={() => navigation.goBack()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: COLORS.white, marginBottom: 120 }}
        contentContainerStyle={{ padding: 10 }}
      >
        <View style={styles.deliveryInfoContainer}>
          <Icon
            name="location-sharp"
            size={22}
            color={COLORS.orange}
            style={{ marginHorizontal: 5 }}
          />
          <View style={{ flex: 1 }}>
            {isEditingDelivery ? (
              <>
                <View>
                  <Text style={styles.textInputLabel}>Tên người nhận</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editedName}
                    onChangeText={setEditedName}
                  />
                </View>

                <View>
                  <Text style={styles.textInputLabel}>Số điện thoại</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editedPhone}
                    onChangeText={setEditedPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View>
                  <Text style={styles.textInputLabel}>Chọn Quận</Text>
                  <Dropdown
                    style={styles.dropdown}
                    placeholder="Chọn Quận"
                    data={districtsHCM}
                    labelField="label"
                    valueField="value"
                    value={selectedDistrict}
                    onChange={(item) => {
                      setSelectedDistrict(item.value);
                    }}
                  />
                </View>
                <View>
                  <Text style={styles.textInputLabel}>Địa chỉ chi tiết</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editedAddressDetail}
                    onChangeText={setEditedAddressDetail}
                  />
                </View>

                <View
                  style={{ flexDirection: "row", justifyContent: "flex-end" }}
                >
                  <TouchableOpacity
                    onPress={handleSaveDeliveryInfo}
                    style={styles.saveButton}
                  >
                    <Text
                      style={{
                        color: COLORS.white,
                        fontFamily: FONTS.semiBold,
                      }}
                    >
                      Lưu
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsEditingDelivery(false)}
                    style={styles.cancelButton}
                  >
                    <Text
                      style={{ color: COLORS.grey, fontFamily: FONTS.semiBold }}
                    >
                      Hủy
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.deliveryInfoWrapper}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.textBold}>
                    Tên: {deliveryInfo.username || "Người dùng"}
                  </Text>
                  <Text style={styles.text}>
                    Số điện thoại: {deliveryInfo.phoneNumber || "N/A"}
                  </Text>
                  <Text style={styles.text}>
                    Địa chỉ: {deliveryInfo.address || "Không xác định"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingDelivery(true);
                    setEditedName(deliveryInfo.username || "");
                    setEditedPhone(deliveryInfo.phoneNumber || "");
                    const { address, district, province } = parseAddress(
                      deliveryInfo.address
                    );
                    setEditedAddressDetail(address || "");
                    setSelectedDistrict(district || "");
                  }}
                  style={styles.editButton}
                >
                  <Text
                    style={{ color: COLORS.green, fontFamily: FONTS.semiBold }}
                  >
                    Sửa
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View style={styles.discountContainer}>
          <Text style={styles.textBold}>Chọn mức giảm giá:</Text>

          <Dropdown
            data={discountOptions}
            labelField="name"
            valueField="id"
            value={selectedDiscount}
            onChange={(item) => {
              console.log(
                "[DEBUG] Giá trị selectedDiscount được chọn:",
                item.id
              );
              setSelectedDiscount(item.id);

              const selectedOption = discountOptions.find(
                (opt) => opt.id === item.id
              );
              setDiscountRate(selectedOption ? selectedOption.rate : 0);
            }}
            placeholder="Chọn mức giảm giá"
            style={styles.dropdown}
          />

          <View
            style={[
              styles.discountDisplay,
              {
                backgroundColor:
                  discountColors[
                    discountOptions.find((opt) => opt.id === selectedDiscount)
                      ?.rate
                  ]?.color || COLORS.white,
              },
            ]}
          >
            <Text style={[styles.textBold, { color: COLORS.white }]}>
              {discountColors[
                discountOptions.find((opt) => opt.id === selectedDiscount)?.rate
              ]?.text || "Không có mức giảm giá"}
            </Text>
          </View>
        </View>

        <View style={styles.noteContainer}>
          <Text style={styles.textBold}>Ghi chú</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon
              name="create-outline"
              size={22}
              color={COLORS.green}
              style={{ marginRight: 5 }}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Nhập ghi chú"
              multiline
              value={note}
              onChangeText={(text) => setNote(text)}
            />
          </View>
        </View>

        <View style={styles.cartDetailsContainer}>
          {detailedCartItems.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <Text style={styles.textNameDish}>{item.name}</Text>
                <Text style={styles.textDishType}>
                  {item.dishType || "Món ăn"}
                </Text>
                <Text style={styles.textDishPrice}>
                  {item.price.toLocaleString()} đ
                  {discountRate > 0 && (
                    <Text
                      style={{
                        color: COLORS.grey,
                        textDecorationLine: "line-through",
                      }}
                    >
                      - {(item.price * discountRate).toLocaleString()} đ
                    </Text>
                  )}
                </Text>
                <View style={styles.quantityContainer}>
                  <Text style={styles.textBold}>x{item.quantity}</Text>
                </View>
                {/* Hiển thị nguyên liệu với nút "X" để bỏ ra */}
                {item.ingredients && item.ingredients.length > 0 ? (
                  <View style={styles.ingredientsContainer}>
                    <Text style={styles.textIngredients}>Nguyên liệu:</Text>
                    {item.ingredients.map((ingredient, idx) => (
                      <View key={idx} style={styles.ingredientItem}>
                        <Text style={styles.textIngredient}>
                          - {ingredient}
                        </Text>
                        <TouchableOpacity
                          onPress={() =>
                            handleRemoveIngredient(item.dishId, ingredient)
                          }
                          style={styles.removeIngredientButton}
                        >
                          <Icon
                            name="close-circle"
                            size={16}
                            color={COLORS.red}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.ingredientsContainer}>
                    <Text style={styles.textIngredients}>
                      Không có nguyên liệu.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.paymentMethodContainer}>
          <Text style={styles.textBold}>Phương thức thanh toán</Text>
          {dataPayment.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => setCurrentPayment(item.id)}
              style={{
                ...styles.paymentOption,
                borderColor:
                  currentPayment === item.id ? COLORS.green : COLORS.greyPastel,
              }}
            >
              <Text style={styles.text}>{item.name}</Text>
              <Icon
                name={
                  currentPayment === item.id
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={currentPayment === item.id ? COLORS.green : COLORS.grey}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.deliveryFeeContainer}>
          <Text style={styles.textBold}>Phí giao hàng:</Text>
          <Text style={{ ...styles.textBold, color: COLORS.green }}>
            {deliveryFee > 0
              ? `${deliveryFee.toLocaleString()} đ`
              : "Đang tính..."}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.containerButtonFloatBottom}>
        <View style={styles.totalContainer}>
          <Text style={styles.textBold}>Số tiền đã giảm:</Text>
          <Text style={{ ...styles.textBold, color: COLORS.green }}>
            {selectedDiscount > 0
              ? (
                  totalPrice *
                  discountOptions.find((opt) => opt.id === selectedDiscount)
                    .rate
                ).toLocaleString() + " đ"
              : "0 đ"}
          </Text>
        </View>
        <View style={styles.boxButtonFloatBottom}>
          <TouchableOpacity style={styles.totalButton}>
            <Text style={styles.textBold}>Tổng thanh toán:</Text>
            <Text style={{ ...styles.textBold, color: COLORS.green }}>
              {finalPrice.toLocaleString()} đ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={handleCheckout}
          >
            <Text style={styles.textButton}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  deliveryInfoContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    flexDirection: "row",
    marginBottom: 10,
  },
  discountContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 10,
  },
  discountDisplay: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: COLORS.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: COLORS.green,
    padding: 10,
    marginRight: 5,
    borderRadius: 10,
  },
  cancelButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.grey,
    padding: 10,
    borderRadius: 10,
  },
  textInputLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginBottom: 5,
    color: COLORS.black,
  },
  textBold: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginTop: 3,
  },
  noteContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  textInput: {
    fontFamily: FONTS.medium,
    height: 40,
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  cartDetailsContainer: {
    padding: 5,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: "row",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.greyPastel,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
  },
  itemImage: {
    width: 110,
    height: "100%",
    resizeMode: "cover",
    borderRadius: 8,
  },
  itemDetails: {
    padding: 5,
    marginLeft: 5,
    flex: 1,
  },
  textNameDish: {
    color: COLORS.black,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  textDishType: {
    color: COLORS.grey,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  textDishPrice: {
    color: COLORS.green,
    fontSize: 15,
    fontFamily: FONTS.semiBold,
    marginBottom: 3,
  },
  quantityContainer: {
    flexDirection: "row",
    alignSelf: "flex-end",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  ingredientsContainer: {
    marginTop: 5,
  },
  textIngredients: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 2,
  },
  textIngredient: {
    fontFamily: FONTS.light,
    fontSize: 13,
    color: COLORS.green,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  removeIngredientButton: {
    marginLeft: 5,
  },
  paymentMethodContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
  },
  containerButtonFloatBottom: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
  },
  totalContainer: {
    backgroundColor: COLORS.white,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 20,
  },
  boxButtonFloatBottom: {
    backgroundColor: COLORS.white,
    height: 80,
    flexDirection: "row",
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGrey,
  },
  totalButton: {
    width: "40%",
    backgroundColor: COLORS.white,
    alignItems: "flex-end",
    justifyContent: "center",
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  checkoutButton: {
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
  },
  textButton: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.white,
  },
  deliveryFeeContainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.greyPastel,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
