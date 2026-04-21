import React, { useState, useCallback, useRef } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  StatusBar, Modal, Dimensions, Platform, Animated
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Menu, Plus, Wifi, Lightbulb, Thermometer, Fan, 
  X, AlertTriangle, CloudRain, Eye, ShieldAlert, Droplets, Baby
} from 'lucide-react-native';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#F4F1ED',    // Soft warm off-white/beige
  text: '#8D7B68',          // Deep warm brown
  active: '#C89B7B',        // Burnt orange/gold for active states
  inactive: 'rgba(141, 123, 104, 0.2)', // Translucent brown
  white: '#FFFFFF',
  menuBg: '#5A4634',        // Solid deep brown
  glassBg: 'rgba(255, 255, 255, 0.65)'  // Frosted glass effect
};

const ROOMS = [
  { id: '1', name: 'Living Room', devices: 5, temp: '27°', baseColor: '#E8E2D9' },
  { id: '2', name: 'Kitchen', devices: 3, temp: '24°', baseColor: '#E2D9D0' },
  { id: '3', name: 'Dining', devices: 2, temp: '25°', baseColor: '#DCD3C7' },
];

const ALERTS = [
  { title: 'Audio Alert', message: 'Warning: Baby crying detected in Nursery.', icon: Baby },
  { title: 'AQI Alert', message: 'Poor Air Quality outside. Closing smart windows.', icon: CloudRain },
  { title: 'Elderly/Medication', message: 'Medication missed. Escalating alert to family.', icon: AlertTriangle },
  { title: 'Vision Alert', message: 'Tripping hazards (shoes/cables) detected in hallway walkway.', icon: Eye },
  { title: 'Weather Alert', message: '60% chance of rain at 2:00 PM. Secure laundry.', icon: CloudRain },
  { title: 'Pet Hazard', message: 'Unusual pet behavior detected in Living Room.', icon: AlertTriangle },
  { title: 'Security Alert', message: 'Unrecognized movement detected at front door.', icon: ShieldAlert },
  { title: 'Water Alert', message: "Water leak detected. 'Syntax is full!'", icon: Droplets },
  { title: 'Emergency', message: 'Glass break detected in Kitchen.', icon: AlertTriangle },
];

export default function App() {
  const [activeRoom, setActiveRoom] = useState(ROOMS[0]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoModalVisible, setDemoModalVisible] = useState(false);
  
  const [deviceStats, setDeviceStats] = useState({
    wifi: true,
    light: false,
    temp: true,
    fan: false,
  });

  const [currentAlert, setCurrentAlert] = useState(null);
  
  // Alert Banner Animation
  const alertTranslateY = useRef(new Animated.Value(-200)).current;

  const showAlert = useCallback(async (alert) => {
    setCurrentAlert(alert);
    Animated.spring(alertTranslateY, {
      toValue: 0,
      tension: 90,
      friction: 15,
      useNativeDriver: true
    }).start();
    
    // expo-av audio placeholder
    try {
       // const { sound } = await Audio.Sound.createAsync(require('./assets/alert.mp3'));
       // await sound.playAsync();
       console.log('Audio activated for:', alert.title);
    } catch (e) {
       console.warn('Audio placeholder error:', e);
    }
    
    setTimeout(() => {
      Animated.timing(alertTranslateY, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true
      }).start();
    }, 4000);
  }, []);

  const alertAnimatedStyle = { transform: [{ translateY: alertTranslateY }] };

  // Drawer Animation
  const drawerTranslateX = useRef(new Animated.Value(-width)).current;

  const toggleMenu = () => {
    if (menuOpen) {
      Animated.timing(drawerTranslateX, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else {
      Animated.timing(drawerTranslateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
    setMenuOpen(!menuOpen);
  };

  const drawerAnimatedStyle = { transform: [{ translateX: drawerTranslateX }] };

  // Demo hidden tap implementation
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  const handleHiddenTap = () => {
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    
    tapTimer.current = setTimeout(() => {
      tapCount.current = 0;
    }, 1000);

    if (tapCount.current >= 3) {
      tapCount.current = 0;
      setDemoModalVisible(true);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        
        {/* Main Dashboard */}
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity onPress={toggleMenu} style={styles.iconBtn}>
                <Menu color={COLORS.text} size={28} />
              </TouchableOpacity>
              <View style={styles.headerTextWrap}>
                <Text style={styles.greeting}>Hi Vaishali</Text>
                <Text style={styles.subtext}>Welcome to your Smart Home</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.avatarStack}>
                <View style={[styles.avatar, { zIndex: 3, backgroundColor: '#D4C4B7' }]} />
                <View style={[styles.avatar, { zIndex: 2, backgroundColor: '#BDAE9D', marginLeft: -12 }]} />
                <View style={[styles.avatar, { zIndex: 1, backgroundColor: '#A49586', marginLeft: -12 }]} />
              </View>
              <TouchableOpacity style={styles.plusBtn}>
                <Plus color={COLORS.white} size={20} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
          >
            
            {/* Horizontal Room Slider */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Rooms</Text>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.roomSlider}
              contentContainerStyle={{ paddingHorizontal: 20 }}
            >
              {ROOMS.map((room) => (
                <TouchableOpacity 
                  key={room.id}
                  onPress={() => setActiveRoom(room)}
                  style={[
                    styles.roomMiniCard, 
                    activeRoom.id === room.id && styles.roomMiniCardActive
                  ]}
                >
                  <LinearGradient
                    colors={activeRoom.id === room.id ? [COLORS.active, '#AA7E61'] : [room.baseColor, '#D8CFB9']}
                    style={styles.roomMiniGradient}
                  >
                    <Text style={[
                      styles.roomMiniTitle,
                      activeRoom.id === room.id && { color: COLORS.white }
                    ]}>{room.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Active Room Card Hero */}
            <View style={styles.heroWrapper}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)']}
                style={styles.heroCard}
              >
                <View style={styles.heroHeader}>
                  <View style={{ flex: 1, paddingRight: 20 }}>
                    <Text style={styles.heroRoomName}>{activeRoom.name}</Text>
                    <Text style={styles.heroContext}>
                      Your {activeRoom.name.toLowerCase()} is connected with {activeRoom.devices} devices
                    </Text>
                  </View>
                  <Text style={styles.heroTemp}>{activeRoom.temp}</Text>
                </View>

                {/* Flexible spacer */}
                <View style={{ flex: 1 }} />

                <View style={styles.devicesGrid}>
                  <DeviceToggle 
                    icon={Wifi} label="WiFi" 
                    active={deviceStats.wifi} 
                    onPress={() => setDeviceStats(s => ({ ...s, wifi: !s.wifi }))} 
                  />
                  <DeviceToggle 
                    icon={Lightbulb} label="Light" 
                    active={deviceStats.light} 
                    onPress={() => setDeviceStats(s => ({ ...s, light: !s.light }))} 
                  />
                  <DeviceToggle 
                    icon={Thermometer} label="Temp" 
                    active={deviceStats.temp} 
                    onPress={() => setDeviceStats(s => ({ ...s, temp: !s.temp }))} 
                  />
                  <DeviceToggle 
                    icon={Fan} label="Fan" 
                    active={deviceStats.fan} 
                    onPress={() => setDeviceStats(s => ({ ...s, fan: !s.fan }))} 
                  />
                </View>
              </LinearGradient>
            </View>

          </ScrollView>
        </SafeAreaView>

        {/* Dropdown Custom Alert Banner */}
        <Animated.View style={[styles.alertBanner, alertAnimatedStyle]} pointerEvents="none">
          <SafeAreaView edges={['top']}>
            <View style={styles.alertInner}>
              <View style={styles.alertIconCircle}>
                {currentAlert?.icon && <currentAlert.icon color={COLORS.white} size={24} />}
              </View>
              <View style={styles.alertTexts}>
                <Text style={styles.alertTitle}>{currentAlert?.title}</Text>
                <Text style={styles.alertMessage} numberOfLines={2}>{currentAlert?.message}</Text>
              </View>
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* Sidebar Menu Drawer */}
        <Animated.View style={[styles.drawer, drawerAnimatedStyle]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <TouchableOpacity onPress={toggleMenu} style={styles.closeBtn}>
                <X color={COLORS.background} size={28} />
              </TouchableOpacity>
            </View>
            <View style={styles.drawerList}>
              {['Manage Users', 'Devices', 'Rooms', 'Music', 'Settings', 'Help', 'Logout'].map((item, i) => (
                <TouchableOpacity key={i} style={styles.drawerItem}>
                  <Text style={styles.drawerItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </SafeAreaView>
        </Animated.View>

        {/* Invisible Demo Trigger */}
        <TouchableOpacity 
          style={styles.demoTrigger}
          onPress={handleHiddenTap}
          activeOpacity={1}
        />

        {/* Pitch Demo Selection Modal */}
        <Modal
          visible={demoModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setDemoModalVisible(false)}
        >
          <View style={styles.modalBg}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pitch Demo Alerts</Text>
                <TouchableOpacity onPress={() => setDemoModalVisible(false)}>
                  <X color={COLORS.text} size={24} />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: Dimensions.get('window').height * 0.6 }}>
                {ALERTS.map((alert, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    style={styles.modalAlertBtn}
                    onPress={() => {
                      setDemoModalVisible(false);
                      showAlert(alert);
                    }}
                  >
                    <Text style={styles.modalAlertTxt}>{alert.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaProvider>
  );
}

const DeviceToggle = ({ icon: Icon, label, active, onPress }) => (
  <View style={styles.deviceCtrl}>
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.toggleBtn, 
        active ? styles.toggleActive : styles.toggleInactive
      ]}
    >
      <Icon color={active ? COLORS.white : COLORS.text} size={30} />
    </TouchableOpacity>
    <Text style={styles.toggleLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBtn: {
    marginRight: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: '#382D25', // Extra dark for readability
  },
  subtext: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  plusBtn: {
    backgroundColor: COLORS.active,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 50,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#382D25',
  },
  roomSlider: {
    marginBottom: 32,
  },
  roomMiniCard: {
    width: 140,
    height: 200,
    marginRight: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  roomMiniGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  roomMiniCardActive: {
    shadowColor: COLORS.active,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  roomMiniTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  heroWrapper: {
    paddingHorizontal: 20,
  },
  heroCard: {
    width: '100%',
    height: 420,
    borderRadius: 32,
    padding: 24,
    // Glassmorphism and shadow
    backgroundColor: COLORS.glassBg,
    borderColor: 'rgba(255,255,255,0.8)',
    borderWidth: 1.5,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroRoomName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#382D25',
    marginBottom: 6,
  },
  heroContext: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  heroTemp: {
    fontSize: 48,
    fontWeight: '300',
    color: COLORS.active,
  },
  devicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  deviceCtrl: {
    alignItems: 'center',
    gap: 12,
  },
  toggleBtn: {
    width: 68,
    height: 98,
    borderRadius: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: COLORS.active,
    shadowColor: COLORS.active,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  toggleInactive: {
    backgroundColor: COLORS.inactive,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#382D25',
  },
  alertBanner: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    backgroundColor: '#D1664F', // Warm aesthetic danger color
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  alertInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  alertIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTexts: {
    marginLeft: 16,
    flex: 1,
  },
  alertTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  alertMessage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  drawer: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    width: width * 0.75,
    backgroundColor: COLORS.menuBg,
    zIndex: 50,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 24 : 10,
    marginBottom: 40,
  },
  drawerTitle: {
    color: COLORS.background,
    fontSize: 28,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 8,
  },
  drawerList: {
    gap: 32,
  },
  drawerItem: {
    paddingVertical: 4,
  },
  drawerItemText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: '600',
  },
  demoTrigger: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: 80, height: 80,
    zIndex: 999,
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: COLORS.background,
    borderRadius: 28,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#382D25',
  },
  modalAlertBtn: {
    backgroundColor: COLORS.active,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  modalAlertTxt: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  }
});
