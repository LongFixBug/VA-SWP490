import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
} from "react-native";
import React, { useEffect, useState } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import COLORS from "../constants/color";
import FONTS from "../constants/font";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Header";

const rankColors = {
  Bronze: "#CD7F32", // Bronze color
  Silver: "#C0C0C0", // Silver color
  Gold: "#f5d114", // Gold color
  Platinum: "#1b93e3", // Platinum color
};

const memberTier = [
  {
    id: "Bronze",
    name: "Bronze",
    point: 0,
    description: "Thành viên mặc định",
  },
  { id: "Silver", name: "Silver", point: 500, description: "Giảm giá 10%" },
  { id: "Gold", name: "Gold", point: 1000, description: "Giảm giá 20%" },
  {
    id: "Platinum",
    name: "Platinum",
    point: 2000,
    description: "Giảm giá 30%",
  },
];

const fetchWithAuth = async (url, options = {}) => {
  const token = await AsyncStorage.getItem("authToken");
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    return response;
  } catch (error) {
    console.error("Error fetching with auth:", error);
    throw error;
  }
};

const MembershipScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [membership, setMembership] = useState(null);
  const [tierName, setTierName] = useState("");
  const [nextTier, setNextTier] = useState(null);

  useEffect(() => {
    const fetchMembershipData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) {
          console.error("Không tìm thấy userId trong AsyncStorage.");
          return;
        }

        const userResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/GetUserByID/${storedUserId}`
        );
        const userJson = await userResponse.json();
        setUserData(userJson);

        const membershipResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/membership/${storedUserId}`
        );
        const membershipJson = await membershipResponse.json();
        setMembership(membershipJson);

        const tierResponse = await fetchWithAuth(
          `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/membershipTier/${membershipJson.tierId}`
        );
        const tierJson = await tierResponse.json();
        setTierName(tierJson.tierName);

        const currentPoints = membershipJson.accumulatedPoints;
        const nextTierData = memberTier.find(
          (tier) => tier.point > currentPoints
        );
        if (nextTierData) {
          setNextTier({
            name: nextTierData.name,
            requiredPoints: nextTierData.point - currentPoints,
          });
        }
      } catch (error) {
        console.error("Error fetching membership data:", error);
      }
    };

    fetchMembershipData();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ width: "100%", height: "auto" }}>
        <ImageBackground
          source={{
            uri: "https://img.freepik.com/premium-photo/glowing-green-gradient-background-smooth-gradient-flat-design-high-resolution-high-quality-high_1110519-4518.jpg",
          }}
          style={{ width: "100%", height: "auto", resizeMode: "cover" }}
        >
          <Header
            title={"Thành viên"}
            leftIcon={"arrow-back-outline"}
            colorBackground={"transparent"}
            colorLeftIcon={COLORS.white}
            colorText={COLORS.white}
            onPress={() => navigation.goBack()}
          />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.white,
              elevation: 10,
              marginBottom: 70,
              marginHorizontal: 20,
              borderRadius: 10,
              padding: 20,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: FONTS.semiBold,
                  fontSize: 20,
                  color: COLORS.black,
                }}
              >
                {userData?.username || "Tên người dùng"}
              </Text>
              <Text
                style={{
                  fontFamily: FONTS.semiBold,
                  fontSize: 15,
                  color: COLORS.greySolid,
                  marginTop: 10,
                }}
              >
                Đang có: {membership?.accumulatedPoints || 0} điểm
              </Text>
            </View>
            <View style={{ alignItems: "center", width: "30%" }}>
              <Icon
                name="trophy"
                size={50}
                color={rankColors[tierName]}
                style={{
                  textAlign: "center",
                }}
              />
              <Text
                style={{
                  fontFamily: FONTS.bold,
                  fontSize: 15,
                  color: COLORS.greySolid,
                  marginTop: 5,
                }}
              >
                {tierName || "Cấp bậc"}
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          marginTop: -50,
          paddingHorizontal: 25,
          paddingTop: 15,
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.bold,
            fontSize: 20,
            color: COLORS.greySolid,
            marginTop: 10,
          }}
        >
          CẤP BẬC
        </Text>
        {memberTier.map((item, index) => {
          const isCurrentTier = tierName === item.name;
          const nextTier =
            index < memberTier.length - 1 ? memberTier[index + 1] : null;
          const pointsToNextTier =
            nextTier && membership?.accumulatedPoints < nextTier.point
              ? nextTier.point - membership?.accumulatedPoints
              : null;

          return (
            <View
              style={{
                marginTop: 15,
                flexDirection: "row",
                paddingVertical: 15,
                borderBottomWidth: 1,
                borderBottomColor: COLORS.greyPastel,
              }}
              key={item.id}
            >
              <View style={{ alignItems: "center", width: "35%" }}>
                <Icon name="trophy" size={40} color={rankColors[item.name]} />
                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    fontSize: 13,
                    color: COLORS.greySolid,
                    marginTop: 10,
                  }}
                >
                  {item.name}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: FONTS.semiBold,
                    fontSize: 15,
                    color: COLORS.greySolid,
                  }}
                >
                  {item.point} điểm
                </Text>
                <Text
                  style={{
                    fontFamily: FONTS.medium,
                    fontSize: 13,
                    color: COLORS.greySolid,
                    marginTop: 5,
                  }}
                >
                  {item.description}
                </Text>
                {isCurrentTier && nextTier && pointsToNextTier && (
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      fontSize: 13,
                      color: COLORS.green,
                      marginTop: 5,
                    }}
                  >
                    Còn {pointsToNextTier} điểm để đạt {nextTier.name}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default MembershipScreen;
