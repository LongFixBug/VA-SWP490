import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const StarRating = ({ maxStars = 5, onRatingChange }) => {
  const [rating, setRating] = useState(0);

  const handleRating = (newRating) => {
    setRating(newRating);
    if (onRatingChange) {
      onRatingChange(newRating); // Gọi callback để truyền giá trị rating ra ngoài
    }
  };

  return (
    <View style={{ flexDirection: "row" }}>
      {[...Array(maxStars)].map((_, index) => {
        const starNumber = index + 1;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleRating(starNumber)}
            activeOpacity={0.7}
          >
            <Icon
              name={starNumber <= rating ? "star" : "star"}
              size={30}
              color={starNumber <= rating ? "#FFD700" : "#CCCCCC"}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const DisplayStarRating = ({ rating, maxStars = 5 }) => {
  return (
    <View style={{ flexDirection: "row" }}>
      {[...Array(maxStars)].map((_, index) => {
        const starNumber = index + 1;
        let iconName = "star-outline";

        if (starNumber <= rating) {
          iconName = "star";
        } else if (starNumber - 0.5 <= rating) {
          iconName = "star-half-full";
        }

        return (
          <Icon
            key={index}
            name={iconName}
            size={30}
            color={iconName === "star-outline" ? "#CCCCCC" : "#FFD700"}
          />
        );
      })}
    </View>
  );
};

export { StarRating, DisplayStarRating };
