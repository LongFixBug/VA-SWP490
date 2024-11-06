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
import DateTimePicker from '@react-native-community/datetimepicker';
import COLORS from '../constants/color';
import FONTS from '../constants/font';
import Icon from 'react-native-vector-icons/Ionicons';
import RadioGroup from 'react-native-radio-buttons-group';
import { ButtonFlex } from '../components/Button';
import moment from 'moment';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const InputProfileScreen = ({ navigation, route }) => {
  // Nhận phoneNumber và password từ route params
  const { phone: initialPhoneNumber } = route.params || {};


  const [errorDoB, setErrorDoB] = useState('');
  const [error, setError] = useState('');
  const [selectedPreferencesId, setSelectedPreferencesId] = useState('1');
  const [selectedSexId, setSelectedSexId] = useState('1');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState(new Date());
  const age = moment().diff(dob, 'years');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [height, setHeight] = useState(''); // New state for height
  const [weight, setWeight] = useState(''); // New state for weight
  const [profession, setProfession] = useState('Đang đi học');
  const [activityLevel, setActivityLevel] = useState('Cao');
  const [goal, setGoal] = useState('Tăng cân');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [visibleProfessionMenu, setVisibleProfessionMenu] = useState(false);
  const [visibleActivityMenu, setVisibleActivityMenu] = useState(false);
  const [visibleGoalMenu, setVisibleGoalMenu] = useState(false);

  const openProfessionMenu = () => setVisibleProfessionMenu(true);
  const closeProfessionMenu = () => setVisibleProfessionMenu(false);
  const openActivityMenu = () => setVisibleActivityMenu(true);
  const closeActivityMenu = () => setVisibleActivityMenu(false);
  const openGoalMenu = () => setVisibleGoalMenu(true);
  const closeGoalMenu = () => setVisibleGoalMenu(false);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(false);
    setDob(currentDate);
  };

  const handleRegister = async () => {
    // Kiểm tra nếu các trường bắt buộc đã được nhập đầy đủ
    if (!username || !email || !phoneNumber || !address || !dob || !password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
  
    // Kiểm tra nếu mật khẩu và xác nhận mật khẩu khớp
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu và xác nhận mật khẩu không khớp!');
      return;
    }

    const formattedPhoneNumber = phoneNumber.startsWith('0') ? phoneNumber : '0' + phoneNumber;
  
    // Chuẩn bị dữ liệu để gửi tới API
    const age = moment().diff(dob, 'years');
    const gender = selectedSexId === '1' ? 'Man' : selectedSexId === '2' ? 'Woman' : 'Other';
  
    const requestData = {
      username,
      password,
      email,
      phoneNumber: formattedPhoneNumber,
      address,
      height: parseFloat(height), // Đảm bảo chiều cao là số
      weight: parseFloat(weight), // Đảm bảo cân nặng là số
      age,
      gender,
      dietaryPreferenceId: parseInt(selectedPreferencesId), // Thêm dietary_preference_id
      profession,
      activityLevel,
      goal,
      isPhoneVerified: true, // Thêm is_phone_verified
    };
  
    // Ghi log dữ liệu đã nhập
    console.log('Dữ liệu đã nhập:', requestData);
    try {
      const response = await axios.post(
        'https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/customers/RegisterCustomer',
        requestData
      );
  
      if (response.status === 200) {
        console.log('Đăng ký thành công:', response.data);
  
        try {
          const userResponse = await axios.get(
            `https://vegetariansassistant-behjaxfhfkeqhbhk.southeastasia-01.azurewebsites.net/api/v1/users/getUserByUsername/${username}`
          );
  
          if (userResponse.status === 200 && userResponse.data) {
            const userId = userResponse.data?.userId || userResponse.data?.[0]?.userId;
            const fetchedUsername = userResponse.data?.username || userResponse.data?.[0]?.username;
        
            console.log('Lấy được userId:', userId);
            console.log('Lấy được username:', fetchedUsername);
        
            // Lưu cả userId và username vào AsyncStorage
            await AsyncStorage.setItem('userId', userId.toString());
            // await AsyncStorage.setItem('username', fetchedUsername);
        
            Alert.alert('Thông báo', 'Đăng ký thành công!', [
              { text: 'OK', onPress: () => navigation.navigate('Home') },
            ]);
          } else {
            console.log('Phản hồi từ getUserByName không hợp lệ hoặc không có userId:', userResponse.data);
            Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng sau khi đăng ký.');
          }
        } catch (getUserError) {
          console.error('Lỗi chi tiết khi gọi API getUserByName:', getUserError.response ? getUserError.response.data : getUserError.message);
          Alert.alert('Lỗi', 'Không thể lấy thông tin user sau khi đăng ký. Vui lòng thử lại sau.');
        }
      } else {
        console.log('Phản hồi không thành công:', response.data);
        Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại sau.');
      }
    } catch (registerError) {
      console.error('Lỗi đăng ký:', registerError.response ? registerError.response.data : registerError.message);
      Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại sau.');
    }
  };
  
  
  
  

  const radioButtonsPreferences = [
    {
      id: '1',
      label: 'Thuần chay',
      value: 'option1',
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: '42%' },
    },
    {
      id: '2',
      label: 'Chay không trứng, có thể có sữa, phô mai',
      value: 'option2',
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: '42%' },
    },
    {
      id: '3',
      label: 'Chay không sữa, có thể có trứng',
      value: 'option3',
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: '42%' },
    },
    {
      id: '4',
      label: 'Hỗn hợp, có thể sử dụng cả trứng, sữa',
      value: 'option4',
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: '42%' },
    },
    {
      id: '5',
      label: 'Chay bán phần (không thịt, có thể ăn cá)',
      value: 'option5',
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: '42%' },
    },
  ];

  const radioButtonsSex = [
    {
      id: '1',
      label: 'Nam',
      value: 'Man',
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: '42%' },
    },
    {
      id: '2',
      label: 'Nữ',
      value: 'Woman',
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: '42%' },
    },
    {
      id: '3',
      label: 'Khác',
      value: 'other',
      color: COLORS.green,
      size: 20,
      containerStyle: { minWidth: '42%' },
    },
  ];

  // React.useEffect(() => {
  //   console.log("Số điện thoại truyền vào:", phoneNumber);
  // }, [phoneNumber]);
  // React.useEffect(() => {
  //   console.log("Route params:", route.params);
  // }, [route.params]);
  
  

  return (
    <Provider>
      <ScrollView contentContainerStyle={styles.formContainer}>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 30 }}>
          <Text style={{ fontSize: 25, color: COLORS.green, fontFamily: FONTS.bold, marginTop: 15 }}>
            NHẬP THÔNG TIN
          </Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Họ tên <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập họ tên"
              placeholderTextColor={COLORS.lightGrey}
              onChangeText={setUsername}
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Email <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <Icon name="mail" size={20} color={COLORS.green} />
            <TextInput
              style={styles.textInput}
              placeholder="Nhập email"
              placeholderTextColor={COLORS.lightGrey}
              onChangeText={setEmail}
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Số điện thoại <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <Icon name="call" size={20} color={COLORS.green} />
            <TextInput
              style={styles.textInput}
              value={'0'+phoneNumber}
              editable={false} // Hiển thị nhưng không cho phép chỉnh sửa
            />
          </View>
        </View>
        <View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Mật khẩu <Text style={{ color: COLORS.red }}>*</Text>
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập mật khẩu"
            placeholderTextColor={COLORS.lightGrey}
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.green}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>
          Xác nhận mật khẩu <Text style={{ color: COLORS.red }}>*</Text>
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập mật khẩu"
            placeholderTextColor={COLORS.lightGrey}
            secureTextEntry={!showConfirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Icon
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              color={COLORS.green}
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Chiều cao (cm) <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập chiều cao"
              placeholderTextColor={COLORS.lightGrey}
              keyboardType="numeric"
              onChangeText={setHeight}
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Cân nặng (kg) <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập cân nặng"
              placeholderTextColor={COLORS.lightGrey}
              keyboardType="numeric"
              onChangeText={setWeight}
            />
          </View>
        </View>
    </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Nghề nghiệp <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <Menu
            visible={visibleProfessionMenu}
            onDismiss={closeProfessionMenu}
            anchor={
              <TouchableOpacity style={styles.menuAnchor} onPress={openProfessionMenu}>
                <Text style={styles.textInput}>{profession}</Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => { setProfession('Đang đi học'); closeProfessionMenu(); }} title="Đang đi học" />
            <Menu.Item onPress={() => { setProfession('Văn phòng'); closeProfessionMenu(); }} title="Văn phòng" />
            <Menu.Item onPress={() => { setProfession('Nội trợ'); closeProfessionMenu(); }} title="Nội trợ" />
            <Menu.Item onPress={() => { setProfession('Công nhân lao động nặng'); closeProfessionMenu(); }} title="Công nhân lao động nặng" />
            <Menu.Item onPress={() => { setProfession('Thầy tu'); closeProfessionMenu(); }} title="Thầy tu" />
            <Menu.Item onPress={() => { setProfession('Nghệ sĩ'); closeProfessionMenu(); }} title="Nghệ sĩ" />
          </Menu>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Mức độ hoạt động <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <Menu
            visible={visibleActivityMenu}
            onDismiss={closeActivityMenu}
            anchor={
              <TouchableOpacity style={styles.menuAnchor} onPress={openActivityMenu}>
                <Text style={styles.textInput}>{activityLevel}</Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => { setActivityLevel('Cao'); closeActivityMenu(); }} title="Cao" />
            <Menu.Item onPress={() => { setActivityLevel('Trung bình'); closeActivityMenu(); }} title="Trung bình" />
            <Menu.Item onPress={() => { setActivityLevel('Ít'); closeActivityMenu(); }} title="Ít" />
          </Menu>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Mục tiêu <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <Menu
            visible={visibleGoalMenu}
            onDismiss={closeGoalMenu}
            anchor={
              <TouchableOpacity style={styles.menuAnchor} onPress={openGoalMenu}>
                <Text style={styles.textInput}>{goal}</Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => { setGoal('Tăng cân'); closeGoalMenu(); }} title="Tăng cân" />
            <Menu.Item onPress={() => { setGoal('Giảm cân'); closeGoalMenu(); }} title="Giảm cân" />
            <Menu.Item onPress={() => { setGoal('Giữ nguyên'); closeGoalMenu(); }} title="Giữ nguyên" />
          </Menu>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Ngày sinh <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.inputRow}>
            <Icon name="calendar" size={20} color={COLORS.green} />
            <Text style={styles.textInput}>{moment(dob).format('DD/MM/YYYY')}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker value={dob} mode="date" display="default" onChange={onDateChange} />
          )}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Giới tính <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={[styles.inputRow, { marginTop: 15, borderBottomWidth: 0 }]}>
            <RadioGroup
              radioButtons={radioButtonsSex}
              onPress={setSelectedSexId}
              selectedId={selectedSexId}
              layout="column"
              labelStyle={{ fontFamily: FONTS.medium }}
              containerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
            />
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Sở thích ăn uống <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={[styles.inputRow, { marginTop: 15, borderBottomWidth: 0 }]}>
          <RadioGroup
  radioButtons={radioButtonsPreferences}
  onPress={(selectedValue) => {
    setSelectedPreferencesId(selectedValue); // Giả sử selectedValue là ID hoặc value bạn cần
  }}
  selectedId={selectedPreferencesId}
  layout="column"
  labelStyle={{ fontFamily: FONTS.medium }}
  containerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
/>


          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            Địa chỉ <Text style={{ color: COLORS.red }}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <Icon name="location-sharp" size={20} color={COLORS.green} />
            <TextInput
              style={styles.textInput}
              placeholder="VD: 50 Lê Văn Việt, Hiệp Phú, Quận 9,..."
              placeholderTextColor={COLORS.lightGrey}
              onChangeText={setAddress}
            />
          </View>
        </View>
        <ButtonFlex
  title={'Bắt đầu!'}
  stylesButton={{ paddingVertical: 15, elevation: 3, backgroundColor: COLORS.green, borderRadius: 10 }}
  stylesText={{ fontSize: 14 }}
  onPress={handleRegister} // Call the handleRegister function when pressed
/>

        {error ? <Text style={styles.errorDoBText}>{error}</Text> : null}
      </ScrollView>
    </Provider>
  );
};

export default InputProfileScreen;

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
  },
  errorDoBText: {
    color: COLORS.red,
    marginTop: 10,
    fontFamily: FONTS.semiBold,
  },
});
