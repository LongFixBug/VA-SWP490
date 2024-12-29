import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import Header from "../components/Header";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WalletScreen = ({ navigation }) => {
  const [balance, setBalance] = useState("525.000"); // State for displaying balance
  const [transactionHistory, setTransactionHistory] = useState([
    // Example transaction data
    {
      id: "1",
      type: "deposit",
      amount: "1000000.00",
      date: "2024-07-28 10:00",
    },
    {
      id: "2",
      type: "withdrawal",
      amount: "100000.0",
      date: "2024-07-27 15:30",
    },
    {
      id: "3",
      type: "withdrawal",
      amount: "100000.0",
      date: "2024-07-27 15:30",
    },
    {
      id: "4",
      type: "deposit",
      amount: "1000000.00",
      date: "2024-07-28 10:00",
    },
    {
      id: "5",
      type: "deposit",
      amount: "1000000.00",
      date: "2024-07-28 10:00",
    },
    {
      id: "6",
      type: "withdrawal",
      amount: "100000.0",
      date: "2024-07-27 15:30",
    },
    {
      id: "7",
      type: "withdrawal",
      amount: "100000.0",
      date: "2024-07-27 15:30",
    },
    {
      id: "8",
      type: "deposit",
      amount: "1000000.00",
      date: "2024-07-28 10:00",
    },
    {
      id: "9",
      type: "deposit",
      amount: "1000000.00",
      date: "2024-07-28 10:00",
    },
    {
      id: "10",
      type: "withdrawal",
      amount: "100000.0",
      date: "2024-07-27 15:30",
    },
    {
      id: "11",
      type: "withdrawal",
      amount: "100000.0",
      date: "2024-07-27 15:30",
    },
    {
      id: "12",
      type: "deposit",
      amount: "1000000.00",
      date: "2024-07-28 10:00",
    },
  ]);

  useEffect(() => {
    // Fetch user balance from API or AsyncStorage
    const fetchBalance = async () => {
      // Replace with your actual API call or AsyncStorage retrieval
      // Example using AsyncStorage:
      try {
        const storedBalance = await AsyncStorage.getItem("walletBalance");
        if (storedBalance) {
          setBalance(storedBalance);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, []);

  const handleDeposit = () => {
    // Navigate to deposit screen or show deposit options
    console.log("Navigate to deposit options");
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
        {/* Balance Display */}
        <View style={styles.balanceContainer}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
          </View>

          <Text style={styles.balanceAmount}>{balance} Đ</Text>
          <Text style={styles.balanceChange}>
            <Icon name="arrow-up" size={12} color={COLORS.green} /> 28.43%
          </Text>
        </View>

        {/* Deposit Section */}
        <TouchableOpacity style={styles.actionButton} onPress={handleDeposit}>
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
