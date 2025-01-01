// import React, { useState, useEffect } from "react";
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   StatusBar,
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import COLORS from "../constants/color";
// import FONTS from "../constants/font";
// import Header from "../components/Header";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// const WalletScreen = ({ navigation }) => {
//   const [balance, setBalance] = useState("525.000"); // State for displaying balance
//   const [transactionHistory, setTransactionHistory] = useState([
//     // Example transaction data
//     {
//       id: "1",
//       type: "deposit",
//       amount: "1000000.00",
//       date: "2024-07-28 10:00",
//     },
//     {
//       id: "2",
//       type: "withdrawal",
//       amount: "100000.0",
//       date: "2024-07-27 15:30",
//     },
//     {
//       id: "3",
//       type: "withdrawal",
//       amount: "100000.0",
//       date: "2024-07-27 15:30",
//     },
//     {
//       id: "4",
//       type: "deposit",
//       amount: "1000000.00",
//       date: "2024-07-28 10:00",
//     },
//     {
//       id: "5",
//       type: "deposit",
//       amount: "1000000.00",
//       date: "2024-07-28 10:00",
//     },
//     {
//       id: "6",
//       type: "withdrawal",
//       amount: "100000.0",
//       date: "2024-07-27 15:30",
//     },
//     {
//       id: "7",
//       type: "withdrawal",
//       amount: "100000.0",
//       date: "2024-07-27 15:30",
//     },
//     {
//       id: "8",
//       type: "deposit",
//       amount: "1000000.00",
//       date: "2024-07-28 10:00",
//     },
//     {
//       id: "9",
//       type: "deposit",
//       amount: "1000000.00",
//       date: "2024-07-28 10:00",
//     },
//     {
//       id: "10",
//       type: "withdrawal",
//       amount: "100000.0",
//       date: "2024-07-27 15:30",
//     },
//     {
//       id: "11",
//       type: "withdrawal",
//       amount: "100000.0",
//       date: "2024-07-27 15:30",
//     },
//     {
//       id: "12",
//       type: "deposit",
//       amount: "1000000.00",
//       date: "2024-07-28 10:00",
//     },
//   ]);

//   useEffect(() => {
//     // Fetch user balance from API or AsyncStorage
//     const fetchBalance = async () => {
//       // Replace with your actual API call or AsyncStorage retrieval
//       // Example using AsyncStorage:
//       try {
//         const storedBalance = await AsyncStorage.getItem("walletBalance");
//         if (storedBalance) {
//           setBalance(storedBalance);
//         }
//       } catch (error) {
//         console.error("Error fetching balance:", error);
//       }
//     };

//     fetchBalance();
//   }, []);

//   const handleDeposit = () => {
//     // Navigate to deposit screen or show deposit options
//     console.log("Navigate to deposit options");
//   };

//   return (
//     <>
//       <View style={styles.headerContainer}>
//         <Header
//           title="Ví của bạn"
//           leftIcon="arrow-back-outline"
//           colorBackground={COLORS.white}
//           colorText={COLORS.black}
//           onPress={() => navigation.goBack()}
//           rightIcon="wallet-outline"
//           size={24}
//           color={COLORS.greySolid}
//         />
//       </View>

//       <View style={styles.container}>
//         {/* Balance Display */}
//         <View style={styles.balanceContainer}>
//           <View style={styles.balanceHeader}>
//             <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
//           </View>

//           <Text style={styles.balanceAmount}>{balance} Đ</Text>
//           <Text style={styles.balanceChange}>
//             <Icon name="arrow-up" size={12} color={COLORS.green} /> 28.43%
//           </Text>
//         </View>

//         {/* Deposit Section */}
//         <TouchableOpacity style={styles.actionButton} onPress={handleDeposit}>
//           <Icon name="add-outline" size={24} color={COLORS.white} />
//           <Text style={styles.actionButtonText}>Nạp tiền</Text>
//         </TouchableOpacity>

//         {/* Transaction History */}
//         <View style={styles.historyContainer}>
//           <Text style={styles.historyTitle}>Lịch sử giao dịch</Text>
//           <ScrollView style={styles.transactionScrollView}>
//             {transactionHistory.map((transaction) => (
//               <View key={transaction.id} style={styles.transactionItem}>
//                 <View style={styles.transactionLeft}>
//                   <Icon
//                     name={
//                       transaction.type === "deposit"
//                         ? "arrow-down-circle-outline"
//                         : "arrow-up-circle-outline"
//                     }
//                     size={20}
//                     color={
//                       transaction.type === "deposit" ? COLORS.green : COLORS.red
//                     }
//                   />
//                   <Text style={styles.transactionText}>
//                     {transaction.type === "deposit"
//                       ? "Nạp tiền"
//                       : "Thanh toán đơn hàng"}
//                   </Text>
//                 </View>
//                 <View style={styles.transactionRight}>
//                   <Text
//                     style={[
//                       styles.transactionAmount,
//                       {
//                         color:
//                           transaction.type === "deposit"
//                             ? COLORS.green
//                             : COLORS.red,
//                       },
//                     ]}
//                   >
//                     {transaction.type === "deposit" ? "+" : "-"}
//                     {transaction.amount}
//                   </Text>
//                   <Text style={styles.transactionDate}>{transaction.date}</Text>
//                 </View>
//               </View>
//             ))}
//             {transactionHistory.length === 0 && (
//               <Text style={styles.emptyHistoryText}>
//                 Chưa có giao dịch nào.
//               </Text>
//             )}
//           </ScrollView>
//         </View>
//       </View>
//     </>
//   );
// };

// export default WalletScreen;

// const styles = StyleSheet.create({
//   headerContainer: {
//     backgroundColor: COLORS.white,
//   },
//   container: {
//     flex: 1,
//     backgroundColor: COLORS.white,
//     paddingHorizontal: 20,
//   },
//   balanceContainer: {
//     backgroundColor: "#f0f0f0",
//     padding: 20,
//     borderRadius: 10,
//     marginTop: 20,
//   },
//   balanceHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 5,
//   },
//   balanceLabel: {
//     fontFamily: FONTS.medium,
//     fontSize: 14,
//     color: COLORS.black,
//   },
//   balanceAmount: {
//     fontFamily: FONTS.bold,
//     fontSize: 28,
//     color: COLORS.black,
//   },
//   balanceChange: {
//     fontFamily: FONTS.medium,
//     fontSize: 12,
//     color: COLORS.green,
//     marginTop: 5,
//   },
//   actionButton: {
//     backgroundColor: "#191919",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 15,
//     borderRadius: 8,
//     marginTop: 20,
//   },
//   actionButtonText: {
//     color: COLORS.white,
//     fontFamily: FONTS.semiBold,
//     fontSize: 16,
//     marginLeft: 10,
//   },
//   historyContainer: {
//     marginTop: 30,
//   },
//   historyTitle: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 18,
//     color: COLORS.black,
//     marginBottom: 15,
//   },
//   transactionScrollView: {
//     maxHeight: 300,
//   },
//   transactionItem: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e0e0e0",
//   },
//   transactionLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   transactionRight: {
//     alignItems: "flex-end",
//   },
//   transactionText: {
//     fontFamily: FONTS.medium,
//     fontSize: 16,
//     color: COLORS.black,
//     marginLeft: 10,
//   },
//   transactionAmount: {
//     fontFamily: FONTS.semiBold,
//     fontSize: 16,
//   },
//   transactionDate: {
//     fontFamily: FONTS.regular,
//     fontSize: 12,
//     color: COLORS.grey,
//   },
//   emptyHistoryText: {
//     fontFamily: FONTS.regular,
//     fontSize: 16,
//     color: COLORS.grey,
//     textAlign: "center",
//     marginTop: 20,
//   },
// });

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const WalletScreen = ({ navigation }) => {
  const [balance, setBalance] = useState("525.000");
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [userId, setUserId] = useState(null); // State for storing userId
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBalanceAndUserId = async () => {
      try {
        const storedBalance = await AsyncStorage.getItem("walletBalance");
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedBalance) {
          setBalance(storedBalance);
        }
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchBalanceAndUserId();
  }, []);

  const handleOpenDepositModal = () => {
    setShowDepositModal(true);
    setDepositAmount(""); // Reset deposit amount when opening modal
  };

  const handleCloseDepositModal = () => {
    setShowDepositModal(false);
  };

  const handleDeposit = async () => {
    if (
      !depositAmount.trim() ||
      isNaN(depositAmount) ||
      parseFloat(depositAmount) <= 0
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ.");
      return;
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const depositData = {
        walletId: parseInt(userId), // Use userId from state, ensure it's a number
        amount: parseFloat(depositAmount),
        transactionType: "Nạp tiền",
      };
      console.log("Dữ liệu gửi lên API tạo link:", depositData);

      const response = await axios.post(
        "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/wallet/create-payment-link",
        depositData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Phản hồi API tạo link:", response.data);

      if (response.status === 200) {
        handleCloseDepositModal();
        navigation.navigate("WebViewsScreen", { url: response.data });
      } else {
        Alert.alert(
          "Lỗi",
          "Không thể tạo link thanh toán. Vui lòng thử lại sau."
        );
      }
    } catch (error) {
      console.error(
        "Lỗi khi gọi API tạo link:",
        error.response?.data || error.message
      );
      Alert.alert("Lỗi", "Đã xảy ra lỗi. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <Header
          title="Ví của bạn"
          leftIcon="arrow-back-outline"
          colorBackground={COLORS.white}
          colorText={COLORS.black}
          onPress={() => navigation.goBack()}
          rightIcon="wallet-outline"
          size={24}
          color={COLORS.greySolid}
        />
      </View>

      <View style={styles.container}>
        <View style={styles.balanceContainer}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
          </View>

          <Text style={styles.balanceAmount}>{balance} Đ</Text>
          <Text style={styles.balanceChange}>
            <Icon name="arrow-up" size={12} color={COLORS.green} /> 28.43%
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleOpenDepositModal}
        >
          <Icon name="add-outline" size={24} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Nạp tiền</Text>
        </TouchableOpacity>

        {/* Transaction History */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Lịch sử giao dịch</Text>
          <ScrollView style={styles.transactionScrollView}>
            {transactionHistory.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Icon
                    name={
                      transaction.type === "deposit"
                        ? "arrow-down-circle-outline"
                        : "arrow-up-circle-outline"
                    }
                    size={20}
                    color={
                      transaction.type === "deposit" ? COLORS.green : COLORS.red
                    }
                  />
                  <Text style={styles.transactionText}>
                    {transaction.type === "deposit"
                      ? "Nạp tiền"
                      : "Thanh toán đơn hàng"}
                  </Text>
                </View>
                <View style={styles.transactionRight}>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type === "deposit"
                            ? COLORS.green
                            : COLORS.red,
                      },
                    ]}
                  >
                    {transaction.type === "deposit" ? "+" : "-"}
                    {transaction.amount}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
              </View>
            ))}
            {transactionHistory.length === 0 && (
              <Text style={styles.emptyHistoryText}>
                Chưa có giao dịch nào.
              </Text>
            )}
          </ScrollView>
        </View>
        <Modal
          visible={showDepositModal}
          transparent={true}
          animationType="slide"
          onRequestClose={handleCloseDepositModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nhập số tiền nạp</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Số tiền"
                keyboardType="numeric"
                value={depositAmount}
                onChangeText={setDepositAmount}
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleDeposit}
                disabled={loading}
              >
                <Text style={styles.modalButtonText}>
                  {loading ? "Đang xử lý..." : "Nạp tiền"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleCloseDepositModal}
              >
                <Text style={styles.modalCancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
  },
  balanceContainer: {
    backgroundColor: "#f0f0f0",
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  balanceLabel: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.black,
  },
  balanceAmount: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.black,
  },
  balanceChange: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.green,
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: "#191919",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  actionButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    marginBottom: 15,
    textAlign: "center",
    color: COLORS.black,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  modalButton: {
    backgroundColor: COLORS.green,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: COLORS.grey,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  modalCancelButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  historyContainer: {
    marginTop: 30,
  },
  historyTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.black,
    marginBottom: 15,
  },
  transactionScrollView: {
    maxHeight: 300,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.black,
    marginLeft: 10,
  },
  transactionAmount: {
    fontFamily: FONTS.semiBold,
    fontSize: 16,
  },
  transactionDate: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.grey,
  },
  emptyHistoryText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.grey,
    textAlign: "center",
    marginTop: 20,
  },
});
