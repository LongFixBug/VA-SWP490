import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Menu, Provider } from 'react-native-paper';
import COLORS from '../constants/color';
import FONTS from '../constants/font';
import Icon from 'react-native-vector-icons/Ionicons';
import RadioGroup from 'react-native-radio-buttons-group';
import { ButtonFlex } from '../components/Button';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EditProfileScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [profession, setProfession] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [selectedPreferencesId, setSelectedPreferencesId] = useState('1');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState(''); // Thêm trạng thái cho mật khẩu
  const [editableField, setEditableField] = useState(null);
  const [visibleProfessionMenu, setVisibleProfessionMenu] = useState(false);
  const [visibleActivityMenu, setVisibleActivityMenu] = useState(false);
  const [visibleGoalMenu, setVisibleGoalMenu] = useState(false);
  const [visibleDietaryMenu, setVisibleDietaryMenu] = useState(false);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('Stored userId:', storedUserId);
        if (storedUserId) {
          const response = await axios.get(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/GetUserByID/${storedUserId}`
          );
          console.log('User data fetched from API:', response.data);
          const userData = response.data;

          setUsername(userData.username);
          setEmail(userData.email);
          setPhoneNumber(userData.phoneNumber);
          setAddress(userData.address);
          setHeight(userData.height?.toString());
          setWeight(userData.weight?.toString());
          setProfession(userData.profession);
          setActivityLevel(userData.activityLevel);
          setGoal(userData.goal);
          setSelectedPreferencesId(userData.dietaryPreferenceId?.toString() || '1');
          setGender(userData.gender); // Directly set gender
          setAge(userData.age); // Set age
          setPassword(userData.password); // Lấy password từ API
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
        Alert.alert('Lỗi', 'Không thể lấy dữ liệu người dùng.');
      }
    };

    fetchUserData();
  }, []);

  const handleFieldEdit = (field) => {
    setEditableField(field);
  };

  const handleSaveChanges = async () => {
    if (!username || !email || !phoneNumber || !address) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const updatedData = {
      userId: await AsyncStorage.getItem('userId'),
      username,
      email,
      phoneNumber,
      address,
      age, // Send age instead of dob
      height: parseFloat(height),
      weight: parseFloat(weight),
      profession,
      activityLevel,
      password, // Gửi password từ API
      goal,
      dietaryPreferenceId: parseInt(selectedPreferencesId),
      gender, // Use the direct gender value
      isPhoneVerified: true,
    };

    // Log dữ liệu trước khi gửi tới API
    console.log('Updated data to be sent:', updatedData);

    try {
      const response = await axios.put(
        'https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/EditCustomer',
        updatedData
      );

      if (response.status === 200) {
        Alert.alert('Thành công', 'Thông tin đã được cập nhật!');
        navigation.goBack();
      } else {
        console.log('API response status:', response.status);
        Alert.alert('Lỗi', 'Không thể cập nhật thông tin. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
      if (error.response) {
        console.log('API error response:', error.response.data); // In ra chi tiết từ API nếu có
      }
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi cập nhật thông tin.');
    }
  };

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={{ alignItems: 'center', marginBottom: 30 }}>
          <Text style={styles.titleText}>CHỈNH SỬA THÔNG TIN</Text>
        </View>

        {[
          { label: 'Họ tên', value: username, onChange: setUsername, field: 'username' },
          { label: 'Email', value: email, onChange: setEmail, field: 'email' },
          { label: 'Số điện thoại', value: phoneNumber, onChange: setPhoneNumber, field: 'phoneNumber', editable: false },
          { label: 'Chiều cao (cm)', value: height, onChange: setHeight, field: 'height' },
          { label: 'Cân nặng (kg)', value: weight, onChange: setWeight, field: 'weight' },
          { label: 'Địa chỉ', value: address, onChange: setAddress, field: 'address' },
          { label: 'Nghề nghiệp', value: profession, onChange: setProfession, field: 'profession', isDropdown: true, menuVisible: visibleProfessionMenu, setMenuVisible: setVisibleProfessionMenu },
          { label: 'Mức độ hoạt động', value: activityLevel, onChange: setActivityLevel, field: 'activityLevel', isDropdown: true, menuVisible: visibleActivityMenu, setMenuVisible: setVisibleActivityMenu },
          { label: 'Mục tiêu', value: goal, onChange: setGoal, field: 'goal', isDropdown: true, menuVisible: visibleGoalMenu, setMenuVisible: setVisibleGoalMenu }
        ].map((input, index) => (
          <View key={index} style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{input.label}</Text>
            <View style={styles.inputRow}>
              {input.isDropdown ? (
                <Menu
                  visible={input.menuVisible}
                  onDismiss={() => input.setMenuVisible(false)}
                  anchor={
                    <TouchableOpacity style={styles.menuAnchor} onPress={() => input.setMenuVisible(true)}>
                      <Text style={styles.textInput}>{input.value}</Text>
                    </TouchableOpacity>
                  }
                >
                  {input.field === 'profession' && (
                    <>
                      <Menu.Item onPress={() => { setProfession('Đang đi học'); setVisibleProfessionMenu(false); }} title="Đang đi học" />
                      <Menu.Item onPress={() => { setProfession('Văn phòng'); setVisibleProfessionMenu(false); }} title="Văn phòng" />
                      <Menu.Item onPress={() => { setProfession('Nội trợ'); setVisibleProfessionMenu(false); }} title="Nội trợ" />
                      <Menu.Item onPress={() => { setProfession('Công nhân lao động nặng'); setVisibleProfessionMenu(false); }} title="Công nhân lao động nặng" />
                      <Menu.Item onPress={() => { setProfession('Thầy tu'); setVisibleProfessionMenu(false); }} title="Thầy tu" />
                      <Menu.Item onPress={() => { setProfession('Nghệ sĩ'); setVisibleProfessionMenu(false); }} title="Nghệ sĩ" />
                    </>
                  )}
                  {input.field === 'activityLevel' && (
                    <>
                      <Menu.Item onPress={() => { setActivityLevel('Cao'); setVisibleActivityMenu(false); }} title="Cao" />
                      <Menu.Item onPress={() => { setActivityLevel('Trung bình'); setVisibleActivityMenu(false); }} title="Trung bình" />
                      <Menu.Item onPress={() => { setActivityLevel('Ít'); setVisibleActivityMenu(false); }} title="Ít" />
                    </>
                  )}
                  {input.field === 'goal' && (
                    <>
                      <Menu.Item onPress={() => { setGoal('Tăng cân'); setVisibleGoalMenu(false); }} title="Tăng cân" />
                      <Menu.Item onPress={() => { setGoal('Giảm cân'); setVisibleGoalMenu(false); }} title="Giảm cân" />
                      <Menu.Item onPress={() => { setGoal('Giữ nguyên'); setVisibleGoalMenu(false); }} title="Giữ nguyên" />
                    </>
                  )}
                </Menu>
              ) : (
                <TextInput
                  style={styles.textInput}
                  placeholder={`Nhập ${input.label.toLowerCase()}`}
                  placeholderTextColor={COLORS.lightGrey}
                  value={input.value}
                  onChangeText={input.onChange}
                  editable={editableField === input.field}
                />
              )}
              {input.editable !== false && (
                <TouchableOpacity onPress={() => handleFieldEdit(input.field)}>
                  <Icon name="pencil" size={20} color={COLORS.green} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}

{/* <View style={styles.inputContainer}>
  <Text style={styles.inputLabel}>
    Sở thích ăn uống <Text style={{ color: COLORS.red }}>*</Text>
  </Text>
  <RadioGroup
    radioButtons={[
      {
        id: '1',
        label: 'Thuần chay',
        value: '1',
        color: COLORS.green,
      },
      {
        id: '2',
        label: 'Chay không trứng, có thể có sữa, phô mai',
        value: '2',
        color: COLORS.green,
      },
      {
        id: '3',
        label: 'Chay không sữa, có thể có trứng',
        value: '3',
        color: COLORS.green,
      },
      {
        id: '4',
        label: 'Hỗn hợp, có thể sử dụng cả trứng, sữa',
        value: '4',
        color: COLORS.green,
      },
      {
        id: '5',
        label: 'Chay bán phần (không thịt, có thể ăn cá)',
        value: '5',
        color: COLORS.green,
      },
    ]}
    onPress={(selectedValue) => {
      if (selectedValue && selectedValue.id) {
        setSelectedPreferencesId(selectedValue.id);
        console.log('Updated dietaryPreferenceId:', selectedValue.id);
      } else {
        console.log('Selected value is invalid:', selectedValue);
      }
    }}
    selectedId={selectedPreferencesId}
    layout="column"
    labelStyle={{ fontFamily: FONTS.medium }}
    containerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
  />
</View> */}


<View style={styles.inputContainer}>
  <Text style={styles.inputLabel}>
    Sở thích ăn uống <Text style={{ color: COLORS.red }}>*</Text>
  </Text>
  <Menu
    visible={visibleDietaryMenu}
    onDismiss={() => setVisibleDietaryMenu(false)}
    anchor={
      <TouchableOpacity style={styles.menuAnchor} onPress={() => setVisibleDietaryMenu(true)}>
        <Text style={styles.textInput}>
          {
            [
              'Thuần chay',
              'Chay không trứng, có thể có sữa, phô mai',
              'Chay không sữa, có thể có trứng',
              'Hỗn hợp, có thể sử dụng cả trứng, sữa',
              'Chay bán phần (không thịt, có thể ăn cá)',
            ][parseInt(selectedPreferencesId) - 1] || 'Chọn sở thích'
          }
        </Text>
      </TouchableOpacity>
    }
  >
    <Menu.Item onPress={() => { setSelectedPreferencesId('1'); setVisibleDietaryMenu(false); }} title="Thuần chay" />
    <Menu.Item onPress={() => { setSelectedPreferencesId('2'); setVisibleDietaryMenu(false); }} title="Chay không trứng, có thể có sữa, phô mai" />
    <Menu.Item onPress={() => { setSelectedPreferencesId('3'); setVisibleDietaryMenu(false); }} title="Chay không sữa, có thể có trứng" />
    <Menu.Item onPress={() => { setSelectedPreferencesId('4'); setVisibleDietaryMenu(false); }} title="Hỗn hợp, có thể sử dụng cả trứng, sữa" />
    <Menu.Item onPress={() => { setSelectedPreferencesId('5'); setVisibleDietaryMenu(false); }} title="Chay bán phần (không thịt, có thể ăn cá)" />
  </Menu>
</View>




        <ButtonFlex
          title={'Lưu thay đổi'}
          stylesButton={{ paddingVertical: 15, backgroundColor: COLORS.green, borderRadius: 10 }}
          stylesText={{ fontSize: 14 }}
          onPress={handleSaveChanges}
        />
      </ScrollView>
    </Provider>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: COLORS.white,
    padding: 30,
    flexGrow: 1,
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginTop: 5,
  },
  menuAnchor: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  textInput: {
    fontFamily: FONTS.medium,
    fontSize: 15,
    flex: 1,
  },
});
