import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useFocusEffect } from "@react-navigation/native";

const API_BASE_URL =
  "https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net";

const WalletScreen = ({ navigation }) => {
  const [balance, setBalance] = useState("0");
  const [previousBalance, setPreviousBalance] = useState("0");
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [walletId, setWalletId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  const { height } = Dimensions.get("window");

  const balanceRef = useRef(balance);

  const fetchWithAuth = async (url, options = {}) => {
    const token = await AsyncStorage.getItem("authToken");
    if (!token) {
      console.error("Token không tồn tại.");
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

  const fetchWalletBalance = useCallback(async () => {
    setBalanceLoading(true);
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      if (!storedUserId) {
        console.warn("No User ID found");
        setBalanceLoading(false);
        return;
      }

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/v1/wallet?userId=${storedUserId}`
      );

      if (!response.ok) {
        const errorMessage = `Failed to fetch wallet balance data: ${response.status}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
      }
      const walletData = await response.json();

      // Check if the balance has changed before updating state
      const newBalance = walletData.balance.toLocaleString("vi-VN") || "0";
      if (newBalance !== balanceRef.current) {
        setPreviousBalance(balanceRef.current);
        setBalance(newBalance);
        balanceRef.current = newBalance;
      }

      setWalletId(walletData.walletId);
    } catch (error) {
      console.error("Error fetching wallet balance:", error.message);
      Alert.alert("Lỗi", "Không thể tải số dư ví.");
    } finally {
      setBalanceLoading(false);
    }
  }, [balance, setBalance, setPreviousBalance]);

  const fetchTransactionHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      if (!walletId) {
        console.log("No wallet Id to fetch transactions");
        setHistoryLoading(false);
        return;
      }
      const url = `${API_BASE_URL}/api/v1/wallet/transactions?walletId=${walletId}`;
      const response = await fetchWithAuth(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Failed to fetch transaction history data:",
          response.status,
          errorText
        );
        throw new Error(
          `Failed to fetch transaction history data: ${response.status}`
        );
      }

      const transactionData = await response.json();
      console.log("Full transaction data:", transactionData);

      const successfulTransactions = transactionData.filter(
        (transaction) => transaction.status === "Thành công"
      );

      const transformedHistory = successfulTransactions.map((transaction) => ({
        id: transaction.transactionId,
        type:
          transaction.transactionType === "Nạp tiền"
            ? "deposit"
            : transaction.transactionType === "Thanh toán hóa đơn"
            ? "billPayment"
            : transaction.transactionType === "Hoàn tiền"
            ? "refund"
            : "withdraw",
        amount: transaction.amount.toLocaleString("vi-VN"),
        date: new Date(transaction.createdDate).toLocaleDateString(),
      }));

      transformedHistory.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        return b.id - a.id;
      });

      console.log("Transformed transaction data:", transformedHistory);

      setTransactionHistory(transformedHistory);
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      Alert.alert("Lỗi", "Không thể tải lịch sử giao dịch.");
    } finally {
      setHistoryLoading(false);
    }
  }, [walletId]);

  // Use useFocusEffect to fetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchWalletBalance();
      if (walletId) {
        fetchTransactionHistory();
      }
    }, [walletId, fetchWalletBalance, fetchTransactionHistory])
  );

  useEffect(() => {
    if (walletId) {
      fetchTransactionHistory();
    }
  }, [walletId, fetchTransactionHistory]);

  const handleOpenDepositModal = () => {
    setShowDepositModal(true);
    setDepositAmount("");
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
        walletId: parseInt(walletId),
        amount: parseFloat(depositAmount),
        transactionType: "Nạp tiền",
      };
      console.log("Dữ liệu gửi lên API tạo link:", depositData);

      const response = await axios.post(
        `${API_BASE_URL}/api/v1/wallet/create-payment-link`,
        depositData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Phản hồi API tạo link:", response.data);

      if (response.status === 200) {
        handleCloseDepositModal();
        navigation.navigate("WebViewsScreen", { url: response.data });
        fetchWalletBalance();
        fetchTransactionHistory();
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

  const calculateBalanceChangePercentage = () => {
    const prev = parseFloat(previousBalance.replace(/,/g, "")) || 0;
    const current = parseFloat(balance.replace(/,/g, "")) || 0;
    if (prev === 0) return 0;
    const change = ((current - prev) / prev) * 100;
    return change.toFixed(2);
  };

  const renderTransactionItem = ({ item }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <Icon
          name={
            item.type === "deposit"
              ? "arrow-down-circle-outline"
              : item.type === "billPayment"
              ? "receipt-outline"
              : item.type === "refund"
              ? "arrow-down-circle-outline"
              : "arrow-up-circle-outline"
          }
          size={20}
          color={
            item.type === "deposit"
              ? COLORS.green
              : item.type === "billPayment"
              ? COLORS.blue
              : item.type === "refund"
              ? COLORS.green
              : COLORS.red
          }
        />
        <Text style={styles.transactionText}>
          {item.type === "deposit"
            ? "Nạp tiền"
            : item.type === "billPayment"
            ? "Thanh toán hóa đơn"
            : item.type === "refund"
            ? "Hoàn tiền"
            : "Thanh toán đơn hàng"}
        </Text>
      </View>
      <View style={styles.transactionRight}>
        <Text
          style={[
            styles.transactionAmount,
            {
              color:
                item.type === "deposit"
                  ? COLORS.green
                  : item.type === "billPayment"
                  ? COLORS.red
                  : item.type === "refund"
                  ? COLORS.green
                  : COLORS.red,
            },
          ]}
        >
          {item.type === "deposit" || item.type === "refund" ? "+" : "-"}
          {item.amount}
        </Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
    </View>
  );

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

          {balanceLoading ? (
            <ActivityIndicator size="small" color={COLORS.green} />
          ) : (
            <Text style={styles.balanceAmount}>{balance} Đ</Text>
          )}

          {!balanceLoading && (
            <Text
              style={[
                styles.balanceChange,
                {
                  color:
                    calculateBalanceChangePercentage() >= 0
                      ? COLORS.green
                      : COLORS.red,
                },
              ]}
            >
              <Icon
                name={
                  calculateBalanceChangePercentage() >= 0
                    ? "arrow-up"
                    : "arrow-down"
                }
                size={12}
                color={
                  calculateBalanceChangePercentage() >= 0
                    ? COLORS.green
                    : COLORS.red
                }
              />{" "}
              {calculateBalanceChangePercentage()}%
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleOpenDepositModal}
        >
          <Icon name="add-outline" size={24} color={COLORS.white} />
          <Text style={styles.actionButtonText}>Nạp tiền</Text>
        </TouchableOpacity>

        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Lịch sử giao dịch</Text>
          {historyLoading ? (
            <ActivityIndicator size="large" color={COLORS.green} />
          ) : (
            <FlatList
              data={transactionHistory}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderTransactionItem}
              ListEmptyComponent={
                <Text style={styles.emptyHistoryText}>
                  Chưa có giao dịch nào.
                </Text>
              }
              contentContainerStyle={
                transactionHistory.length === 0 && styles.emptyContainer
              }
              showsVerticalScrollIndicator={false}
            />
          )}
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
  historyContainer: {
    marginTop: 30,
    flex: 1,
  },
  historyTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: 18,
    color: COLORS.black,
    marginBottom: 15,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
});
